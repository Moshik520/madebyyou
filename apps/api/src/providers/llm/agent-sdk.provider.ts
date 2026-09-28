import { query } from '@anthropic-ai/claude-agent-sdk';
import { logger } from '../../platform/logger.js';
import { extractJsonObject } from './json-extract.js';
import { buildTurnPrompt } from './system-prompt.js';
import { z } from 'zod';
import { agentTurnSchema, type AgentTurn, type AgentTurnInput, type LLMProvider } from './types.js';

async function askModel(prompt: string): Promise<string> {
  let raw = '';

  for await (const message of query({
    prompt,
    options: {
      allowedTools: [],     // reasoning only — no file or shell access
      permissionMode: 'default',
      maxTurns: 1,
    },
  })) {
    if (message.type === 'result' && message.subtype === 'success') {
      raw = message.result;
    }
  }

  return raw;
}

function parseTurn(raw: string): AgentTurn | null {
  let parsed: unknown;

  try {
    parsed = extractJsonObject(raw);
  } catch {
    logger.warn({ raw: raw.slice(0, 800) }, 'agent output was not parseable JSON');
    return null;
  }

  const result = agentTurnSchema.safeParse(parsed);

  if (!result.success) {
    logger.warn(
      { issues: z.treeifyError(result.error), parsed },
      'agent output failed schema validation',
    );
    return null;
  }

  return result.data;
}


export const agentSdkProvider: LLMProvider = {
  name: 'claude-agent-sdk',

  async runTurn(input: AgentTurnInput): Promise<AgentTurn> {
    const prompt = buildTurnPrompt(input);

    const first = parseTurn(await askModel(prompt));
    if (first) return first;

    logger.warn('agent returned invalid JSON, retrying once');

    const retryPrompt = `${prompt}

התשובה הקודמת שלך לא הייתה JSON תקין לפי הסכמה.
החזר עכשיו **רק** אובייקט JSON יחיד, בלי שום טקסט אחר.`;

    const second = parseTurn(await askModel(retryPrompt));
    if (second) return second;

    throw new Error('LLM returned invalid JSON twice');
  },
};
