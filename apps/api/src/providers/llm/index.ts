import { config } from '../../platform/config.js';
import { agentSdkProvider } from './agent-sdk.provider.js';
import type { LLMProvider } from './types.js';

function createLLMProvider(): LLMProvider {
  switch (config.LLM_PROVIDER) {
    case 'agent-sdk':
      return agentSdkProvider;
    default:
      throw new Error(`Unknown LLM provider: ${config.LLM_PROVIDER as string}`);
  }
}

export const llmProvider = createLLMProvider();
