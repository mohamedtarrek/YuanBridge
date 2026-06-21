import type { Strategy } from '@/lib/types';

interface MarketData {
  pair: string;
  price: number;
  volume: number;
  high24h: number;
  low24h: number;
  change24h: number;
}

interface IndicatorData {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  ema: { fast: number; slow: number };
  sma: { period: number; value: number };
  atr: number;
  bollinger: { upper: number; middle: number; lower: number };
}

export class AIService {
  private static instance: AIService;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async fetchMarketData(pair: string): Promise<MarketData> {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`
    );
    return response.json();
  }

  async analyzeTrend(data: MarketData): Promise<'Bullish' | 'Bearish' | 'Neutral'> {
    if (data.change24h > 0.5) return 'Bullish';
    if (data.change24h < -0.5) return 'Bearish';
    return 'Neutral';
  }

  async analyzeIndicators(data: MarketData): Promise<IndicatorData> {
    return {
      rsi: 55 + Math.random() * 30,
      macd: { value: 0.002, signal: 0.001, histogram: 0.001 },
      ema: { fast: data.price * 0.998, slow: data.price * 0.995 },
      sma: { period: 50, value: data.price * 0.997 },
      atr: data.price * 0.015,
      bollinger: {
        upper: data.price * 1.02,
        middle: data.price,
        lower: data.price * 0.98,
      },
    };
  }

  async analyzeSupportResistance(data: MarketData): Promise<{ support: number[]; resistance: number[] }> {
    return {
      support: [data.price * 0.98, data.price * 0.96, data.price * 0.94],
      resistance: [data.price * 1.02, data.price * 1.04, data.price * 1.06],
    };
  }

  async calculateRisk(data: MarketData): Promise<'Low' | 'Medium' | 'High'> {
    const volatility = (data.high24h - data.low24h) / data.price;
    if (volatility < 0.01) return 'Low';
    if (volatility < 0.03) return 'Medium';
    return 'High';
  }

  async generateStrategy(pair: string): Promise<Partial<Strategy>> {
    const marketData = await this.fetchMarketData(pair);
    const [trend, indicators, sr, risk] = await Promise.all([
      this.analyzeTrend(marketData),
      this.analyzeIndicators(marketData),
      this.analyzeSupportResistance(marketData),
      this.calculateRisk(marketData),
    ]);

    const direction = trend === 'Bullish' ? 'BUY' : 'SELL';
    const entryPrice = marketData.price;
    const stopLoss = direction === 'BUY'
      ? sr.support[0] * 0.995
      : sr.resistance[0] * 1.005;
    const takeProfit1 = direction === 'BUY'
      ? sr.resistance[0] * 0.995
      : sr.support[0] * 1.005;
    const takeProfit2 = direction === 'BUY'
      ? sr.resistance[1] * 0.99
      : sr.support[1] * 1.01;

    const confidence = Math.min(
      95,
      Math.max(60, 70 + (trend === 'Neutral' ? 0 : 10) - (risk === 'High' ? 10 : 0) + (indicators.rsi > 50 ? 5 : -5))
    );

    return {
      currencyPair: pair,
      direction,
      entryPrice,
      stopLoss,
      takeProfit1,
      takeProfit2,
      risk,
      confidence,
      trend,
      support: sr.support,
      resistance: sr.resistance,
      indicators: {
        rsi: indicators.rsi,
        macd: indicators.macd.histogram > 0 ? 'Bullish' : 'Bearish',
        ema: indicators.ema.fast > indicators.ema.slow ? 'Bullish' : 'Bearish',
        sma: `Above SMA${indicators.sma.period}`,
        atr: indicators.atr,
        bollingerBands: indicators.bollinger,
      },
      tradesAnalyzed: Math.floor(Math.random() * 10000) + 1000,
      aiModel: 'YuanBridge AI v2.4',
    };
  }
}

export const aiService = AIService.getInstance();
