import { BaseAIProvider } from '@/lib/ai/providers/base';
import type { AIConfig, StrategyInput, StrategyOutput } from '@/lib/ai/types';

export class ClaudeProvider extends BaseAIProvider {
  constructor(config: AIConfig) {
    super({
      ...config,
      model: config.model || 'claude-3-opus-20240229',
    });
  }

  async generate(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens ?? 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text ?? '';
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
