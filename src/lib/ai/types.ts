export type AIProviderType = 'openai' | 'claude' | 'gemini' | 'deepseek';

export interface AIConfig {
  provider: AIProviderType;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

export interface MarketData {
  pair: string;
  price: number;
  high24h: number;
  low24h: number;
  volume: number;
  change24h: number;
  timestamp: Date;
}

export interface IndicatorValues {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  ema: { fast: number; slow: number };
  sma: { period: number; value: number };
  atr: number;
  bb: { upper: number; middle: number; lower: number };
  adx: number;
  cci: number;
  stochasticRsi: { k: number; d: number };
  vwap: number;
  ichimoku: {
    tenkan: number;
    kijun: number;
    senkouA: number;
    senkouB: number;
    chikou: number;
  };
  fibonacci: { levels: { level: number; price: number }[] };
  pivotPoints: { pp: number; r1: number; r2: number; s1: number; s2: number };
}

export interface PatternResult {
  name: string;
  direction: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number;
  description: string;
}

export interface StrategyInput {
  pair: string;
  marketData: MarketData;
  prices: number[];
  highs: number[];
  lows: number[];
  closes: number[];
  volumes: number[];
}

export interface StrategyOutput {
  title: string;
  titleAr: string;
  currencyPair: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  risk: 'Low' | 'Medium' | 'High';
  confidence: number;
  summary: string;
  summaryAr: string;
  isPremium: boolean;
  technicalAnalysis: string;
  technicalAnalysisAr: string;
  fundamentalAnalysis: string;
  fundamentalAnalysisAr: string;
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  support1: number;
  support2: number;
  support3: number;
  resistance1: number;
  resistance2: number;
  resistance3: number;
  rsi: number;
  macdValue: number;
  macdSignal: number;
  macdHistogram: number;
  emaFast: number;
  emaSlow: number;
  smaPeriod: number;
  smaValue: number;
  atr: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  notes: string;
  notesAr: string;
  tradesAnalyzed: number;
  aiModel: string;
  aiProvider: AIProviderType;
  indicators: IndicatorValues;
  patterns: PatternResult[];
}

export interface AIEngineResult {
  success: boolean;
  strategy: StrategyOutput | null;
  jobId: string | null;
  error: string | null;
}
