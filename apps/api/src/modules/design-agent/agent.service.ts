import { prisma } from '../../platform/prisma.js';
import { NotFoundError } from '../../platform/errors.js';
import { llmProvider } from '../../providers/llm/index.js';
import { localStorageProvider } from '../../providers/storage/local.provider.js';
import { buildSystemPrompt } from '../../providers/llm/system-prompt.js';
import {
  designBriefSchema,
  emptyBrief,
  type DesignBrief,
} from '../../providers/llm/types.js';
import { AppError } from '../../platform/errors.js';
import { logger } from '../../platform/logger.js';
import {
  createDesignVersion,
  toVersionDto,
  versionSelect,
} from './design-pipeline.js';

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
      currentVersionId: true,
      sourceAsset: { select: { id: true, storageKey: true } },
      conversation: {
        select: {
          messages: { select: messageSelect, orderBy: { createdAt: 'asc' } },
        },
      },
      versions: {
        select: versionSelect,
        orderBy: { versionNumber: 'asc' },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Design project not found');
  }

  return {
    brief: parseBrief(project.brief),
    currentVersionId: project.currentVersionId,
    sourceImage: project.sourceAsset
      ? {
          id: project.sourceAsset.id,
          url: localStorageProvider.publicUrl(project.sourceAsset.storageKey),
        }
      : null,
    messages: project.conversation?.messages ?? [],
    versions: project.versions.map(toVersionDto),
  };
}


export async function sendMessage(
  userId: string,
  projectId: string,
  content: string,
  assetId?: string,
) {
  const project = await prisma.designProject.findFirst({
    where: { id: projectId, userId },
    select: {
      id: true,
      brief: true,
      sourceAssetId: true,
      product: { select: { name: true, description: true } },
      conversation: { select: { id: true } },
    },
  });

  if (!project) {
    throw new NotFoundError('Design project not found');
  }

  // An attachment arrives with the message that references it. Only assets the
  // user owns may be attached.
  let sourceAssetId = project.sourceAssetId;

  if (assetId && assetId !== sourceAssetId) {
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, userId, kind: 'UPLOAD' },
      select: { id: true },
    });

    if (!asset) {
      throw new NotFoundError('Uploaded image not found');
    }

    await prisma.designProject.update({
      where: { id: project.id },
      data: { sourceAssetId: asset.id },
    });

    sourceAssetId = asset.id;
  }

  // One conversation per project, created lazily on the first message.
  const conversation =
    project.conversation ??
    (await prisma.conversation.create({
      data: { projectId: project.id },
      select: { id: true },
    }));

  const versionCount = await prisma.designVersion.count({
    where: { projectId: project.id },
  });

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
    hasSourceImage: Boolean(sourceAssetId),
    versionCount,
    userMessage: content,
  });

  // The agent declared intent; the server carries it out.
  let version: Awaited<ReturnType<typeof createDesignVersion>> | null = null;
  let replyText = turn.reply;

  if (turn.status === 'READY') {
    try {
      version = await createDesignVersion({
        userId,
        projectId: project.id,
        brief: turn.brief,
      });
    } catch (error) {
      logger.warn(
        { err: error, projectId: project.id },
        'design generation failed',
      );

      // A failed generation must not break the conversation.
      replyText =
        error instanceof AppError
          ? `${turn.reply}\n\n(${error.message})`
          : `${turn.reply}\n\n(משהו השתבש בייצור העיצוב. אפשר לנסות שוב.)`;
    }
  }

  const [userMessage, assistantMessage] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: conversation.id, role: 'USER', content },
      select: messageSelect,
    }),
    prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: replyText,
        designVersionId: version?.id ?? null,
      },
      select: messageSelect,
    }),
    prisma.designProject.update({
      where: { id: project.id },
      data: { brief: turn.brief },
    }),
  ]);

  return { turn, messages: [userMessage, assistantMessage], version };
}

