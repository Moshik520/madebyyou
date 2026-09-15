import { prisma } from '../../platform/prisma.js';
import { NotFoundError } from '../../platform/errors.js';
import { llmProvider } from '../../providers/llm/index.js';
import { buildSystemPrompt } from '../../providers/llm/system-prompt.js';
import {
  designBriefSchema,
  emptyBrief,
  type DesignBrief,
} from '../../providers/llm/types.js';

const HISTORY_LIMIT = 30;

const messageSelect = {
  id: true,
  role: true,
  content: true,
  designVersionId: true,
  createdAt: true,
} as const;

/** Whatever is in the Json column, coerced back into a valid brief. */
function parseBrief(value: unknown): DesignBrief {
  const result = designBriefSchema.safeParse(value);

  return result.success ? result.data : emptyBrief;
}

export async function getConversation(userId: string, projectId: string) {
  const project = await prisma.designProject.findFirst({
    where: { id: projectId, userId },
    select: {
      brief: true,
      conversation: {
        select: {
          messages: { select: messageSelect, orderBy: { createdAt: 'asc' } },
        },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Design project not found');
  }

  return {
    brief: parseBrief(project.brief),
    messages: project.conversation?.messages ?? [],
  };
}

export async function sendMessage(
  userId: string,
  projectId: string,
  content: string,
) {
  const project = await prisma.designProject.findFirst({
    where: { id: projectId, userId },
    select: {
      id: true,
      brief: true,
      product: { select: { name: true, description: true } },
      conversation: { select: { id: true } },
    },
  });

  if (!project) {
    throw new NotFoundError('Design project not found');
  }

  // One conversation per project, created lazily on the first message.
  const conversation =
    project.conversation ??
    (await prisma.conversation.create({
      data: { projectId: project.id },
      select: { id: true },
    }));

  const history = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    select: { role: true, content: true },
    orderBy: { createdAt: 'asc' },
    take: HISTORY_LIMIT,
  });

  const turn = await llmProvider.runTurn({
    systemPrompt: buildSystemPrompt(project.product),
    history,
    brief: parseBrief(project.brief),
    userMessage: content,
  });

  const [userMessage, assistantMessage] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: conversation.id, role: 'USER', content },
      select: messageSelect,
    }),
    prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: turn.reply,
      },
      select: messageSelect,
    }),
    prisma.designProject.update({
      where: { id: project.id },
      data: { brief: turn.brief },
    }),
  ]);

  return { turn, messages: [userMessage, assistantMessage] };
}
