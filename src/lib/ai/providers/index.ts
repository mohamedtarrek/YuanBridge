import type { AIProviderType, AIConfig } from '@/lib/ai/types';
import { BaseAIProvider } from '@/lib/ai/providers/base';
import { OpenAIProvider } from '@/lib/ai/providers/openai';
import { ClaudeProvider } from '@/lib/ai/providers/claude';
import { GeminiProvider } from '@/lib/ai/providers/gemini';
import { DeepSeekProvider } from '@/lib/ai/providers/deepseek';

const providerMap: Record<AIProviderType, new (config: AIConfig) => BaseAIProvider> = {
  openai: OpenAIProvider,
  claude: ClaudeProvider,
  gemini: GeminiProvider,
  deepseek: DeepSeekProvider,
};

export function getProvider(type: AIProviderType, config: AIConfig): BaseAIProvider {
  const ProviderClass = providerMap[type];
  if (!ProviderClass) {
    throw new Error(`Unknown AI provider: ${type}`);
  }
  return new ProviderClass(config);
}

export function getDefaultProvider(): BaseAIProvider {
  return new OpenAIProvider({
    provider: 'openai',
    model: 'gpt-4-turbo',
    apiKey: process.env.OPENAI_API_KEY ?? '',
    temperature: 0.7,
    maxTokens: 2000,
  });
}

export { BaseAIProvider, OpenAIProvider, ClaudeProvider, GeminiProvider, DeepSeekProvider };
