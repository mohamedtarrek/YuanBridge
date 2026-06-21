import type { AIConfig, StrategyInput, StrategyOutput } from '@/lib/ai/types';

export abstract class BaseAIProvider {
  protected config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  abstract generate(prompt: string): Promise<string>;

  abstract analyze(data: StrategyInput): Promise<StrategyOutput>;

  abstract calculateConfidence(data: StrategyInput): Promise<number>;

  protected parseJSONResponse<T>(response: string): T {
    const cleaned = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    return JSON.parse(cleaned) as T;
  }

  protected buildAnalysisPrompt(data: StrategyInput): string {
    return `Analyze the following market data and generate a trading strategy:
Currency Pair: ${data.pair}
Current Price: ${data.marketData.price}
24h High: ${data.marketData.high24h}
24h Low: ${data.marketData.low24h}
Volume: ${data.marketData.volume}
24h Change: ${data.marketData.change24h}%

Provide a detailed technical analysis including direction, entry, stop loss, take profit levels, and confidence score.`;
  }

  protected buildConfidencePrompt(data: StrategyInput): string {
    return `Calculate a confidence score (0-100) for a trade on ${data.pair} at $${data.marketData.price}. Consider:
- Price position relative to 24h range
- Volume analysis
- Volatility
- Overall market conditions

Return only a number.`;
  }
}
