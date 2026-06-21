import { BaseAIProvider } from '@/lib/ai/providers/base';
import type { AIConfig, StrategyInput, StrategyOutput } from '@/lib/ai/types';

export class GeminiProvider extends BaseAIProvider {
  constructor(config: AIConfig) {
    super({
      ...config,
      model: config.model || 'gemini-2.0-flash',
    });
  }

  async generate(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: this.config.temperature ?? 0.7,
          maxOutputTokens: this.config.maxTokens ?? 2000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
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
