export interface Strategy {
  id: string;
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
  publishedAt: string;
  summary: string;
  summaryAr: string;
  isPremium: boolean;
  technicalAnalysis: string;
  technicalAnalysisAr: string;
  fundamentalAnalysis: string;
  fundamentalAnalysisAr: string;
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  support: number[];
  resistance: number[];
  indicators: {
    rsi: number;
    macd: string;
    ema: string;
    sma: string;
    atr: number;
    bollingerBands: { upper: number; middle: number; lower: number };
  };
  notes: string;
  notesAr: string;
  tradesAnalyzed: number;
  aiModel: string;
}

export interface StrategyFilters {
  direction?: 'BUY' | 'SELL';
  risk?: 'Low' | 'Medium' | 'High';
  isPremium?: boolean;
  currencyPair?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'highest_confidence' | 'lowest_confidence';
  page?: number;
  limit?: number;
}

export interface StrategiesResponse {
  strategies: Strategy[];
  total: number;
  page: number;
  totalPages: number;
}
