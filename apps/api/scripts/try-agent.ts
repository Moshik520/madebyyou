import { agentSdkProvider } from './src/providers/llm/agent-sdk.provider.js';
import { buildSystemPrompt } from './src/providers/llm/system-prompt.js';
import { emptyBrief } from './src/providers/llm/types.js';

const systemPrompt = buildSystemPrompt({
  name: 'Classic T-Shirt',
  description: '100% combed cotton, unisex fit. Print area is a square on the chest.',
});

const userMessage = process.argv[2] ?? 'אני רוצה זאב';

console.log('--- user says:', userMessage, '\n');

const turn = await agentSdkProvider.runTurn({
  systemPrompt,
  history: [],
  brief: emptyBrief,
  userMessage,
});

console.log(JSON.stringify(turn, null, 2));
