import { BaseAIProvider } from '@/lib/ai/providers/base';
import type { AIConfig, StrategyInput, StrategyOutput } from '@/lib/ai/types';

export class DeepSeekProvider extends BaseAIProvider {
  constructor(config: AIConfig) {
    super({
      ...config,
      model: config.model || 'deepseek-chat',
    });
  }

  async generate(prompt: string): Promise<string> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  async analyze(data: StrategyInput): Promise<StrategyOutput> {
    const prompt = this.buildAnalysisPrompt(data);
    const response = await this.generate(prompt);
    return this.parseJSONResponse<StrategyOutput>(response);
  }

  async calculateConfidence(data: StrategyInput): Promise<number> {
    const prompt = this.buildConfidencePrompt(data);
    const response = await this.generate(prompt);
    const score = Number.parseFloat(response.trim());
    return Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 50;
  }
}
