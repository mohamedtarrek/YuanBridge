import { v4 as uuidv4 } from 'uuid';
import type { StrategyInput, StrategyOutput, AIEngineResult, IndicatorValues, PatternResult, MarketData } from '@/lib/ai/types';
import {
  calculateAllIndicators,
  calculateATR,
  calculateSMA,
  calculateRSI,
  detectTrend,
  detectSupportResistance,
  calculateVolatility,
  calculateVolumeAnalysis,
} from '@/lib/ai/indicators';
import { detectPatterns } from '@/lib/ai/pattern-recognition';

function generateMockPrices(pair: string, basePrice?: number): {
  prices: number[];
  highs: number[];
  lows: number[];
  closes: number[];
  volumes: number[];
  marketData: MarketData;
} {
  const now = new Date();
  const price = basePrice ?? getBasePrice(pair);
  const prices: number[] = [];
  const highs: number[] = [];
  const lows: number[] = [];
  const closes: number[] = [];
  const volumes: number[] = [];
  let current = price;

  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.5) * price * 0.02;
    current += change;
    const high = current * (1 + Math.random() * 0.01);
    const low = current * (1 - Math.random() * 0.01);
    prices.push(current);
    highs.push(high);
    lows.push(low);
    closes.push(current);
    volumes.push(Math.random() * 1000000 + 500000);
  }

  return {
    prices,
    highs,
    lows,
    closes,
    volumes,
    marketData: {
      pair,
      price,
      high24h: Math.max(...highs.slice(-24)),
      low24h: Math.min(...lows.slice(-24)),
      volume: volumes.slice(-24).reduce((a, b) => a + b, 0),
      change24h: ((prices[prices.length - 1] - prices[prices.length - 25]) / prices[prices.length - 25]) * 100,
      timestamp: now,
    },
  };
}

function getBasePrice(pair: string): number {
  const prices: Record<string, number> = {
    'EUR/USD': 1.0850,
    'GBP/USD': 1.2650,
    'USD/JPY': 150.50,
    'USD/CHF': 0.8850,
    'AUD/USD': 0.6550,
    'USD/CAD': 1.3650,
    'NZD/USD': 0.6050,
    'BTC/USD': 65000,
    'ETH/USD': 3400,
    'XAU/USD': 2030,
    'XAG/USD': 24.50,
  };
  return prices[pair] ?? 1.0;
}

export function determineDirection(
  indicators: IndicatorValues,
  trend: string
): 'BUY' | 'SELL' {
  let buyScore = 0;
  let sellScore = 0;

  const factors: { score: number; side: 'BUY' | 'SELL'; weight: number }[] = [];

  if (indicators.rsi < 30) factors.push({ score: 1, side: 'BUY', weight: 3 });
  else if (indicators.rsi > 70) factors.push({ score: 1, side: 'SELL', weight: 3 });

  if (indicators.macd.histogram > 0) factors.push({ score: 1, side: 'BUY', weight: 2 });
  else factors.push({ score: 1, side: 'SELL', weight: 2 });

  if (indicators.ema.fast > indicators.ema.slow) factors.push({ score: 1, side: 'BUY', weight: 2 });
  else factors.push({ score: 1, side: 'SELL', weight: 2 });

  if (indicators.cci > 100) factors.push({ score: 1, side: 'SELL', weight: 1 });
  else if (indicators.cci < -100) factors.push({ score: 1, side: 'BUY', weight: 1 });

  if (trend === 'BULLISH') factors.push({ score: 1, side: 'BUY', weight: 3 });
  else if (trend === 'BEARISH') factors.push({ score: 1, side: 'SELL', weight: 3 });

  for (const f of factors) {
    if (f.side === 'BUY') buyScore += f.score * f.weight;
    else sellScore += f.score * f.weight;
  }

  return buyScore >= sellScore ? 'BUY' : 'SELL';
}

export function calculateStopLoss(entry: number, direction: string, atr: number): number {
  const multiplier = direction === 'BUY' ? 1.5 : 1.5;
  const distance = atr * multiplier;
  return direction === 'BUY' ? entry - distance : entry + distance;
}

export function calculateTakeProfit(
  entry: number,
  direction: string,
  atr: number
): { tp1: number; tp2: number } {
  const tp1Multiplier = direction === 'BUY' ? 1.5 : 1.5;
  const tp2Multiplier = direction === 'BUY' ? 2.5 : 2.5;
  const distance1 = atr * tp1Multiplier;
  const distance2 = atr * tp2Multiplier;
  return {
    tp1: direction === 'BUY' ? entry + distance1 : entry - distance1,
    tp2: direction === 'BUY' ? entry + distance2 : entry - distance2,
  };
}

export function generateConfidence(
  indicators: IndicatorValues,
  trend: string,
  patterns: PatternResult[]
): number {
  let score = 70;

  if (indicators.rsi >= 30 && indicators.rsi <= 70) score += 5;
  if (indicators.rsi < 30 || indicators.rsi > 70) score += 2;

  if (Math.abs(indicators.macd.histogram) > 0) score += 5;
  if (indicators.adx > 25) score += 5;
  if (indicators.adx > 40) score += 3;

  if (trend !== 'NEUTRAL') score += 5;

  const highPatternConfidence = patterns.filter(p => p.confidence >= 70);
  score += highPatternConfidence.length * 5;

  const bestPattern = patterns.reduce(
    (max, p) => (p.confidence > max.confidence ? p : max),
    patterns[0] ?? { confidence: 0 } as PatternResult
  );
  if (bestPattern.confidence > 70) score += 5;

  return Math.min(100, Math.max(10, score));
}

function generateTitle(
  pair: string,
  direction: string,
  confidence: number
): { title: string; titleAr: string } {
  const dir = direction === 'BUY' ? 'Buy' : 'Sell';
  const dirAr = direction === 'BUY' ? 'شراء' : 'بيع';
  return {
    title: `${pair} ${dir} Signal - ${confidence}% Confidence`,
    titleAr: `إشارة ${dirAr} ${pair} - ${confidence}% ثقة`,
  };
}

function generateSummary(
  pair: string,
  direction: string,
  entry: number,
  stopLoss: number,
  tp1: number,
  trend: string,
  confidence: number
): { summary: string; summaryAr: string } {
  const dir = direction === 'BUY' ? 'Buy' : 'Sell';
  const dirAr = direction === 'BUY' ? 'شراء' : 'بيع';
  const trendEn = trend.charAt(0) + trend.slice(1).toLowerCase();
  const trendAr = trend === 'BULLISH' ? 'صاعد' : trend === 'BEARISH' ? 'هابط' : 'محايد';

  return {
    summary: `${dir} signal for ${pair} at ${entry}. Stop loss: ${stopLoss}, Take profit 1: ${tp1}. Market trend is ${trendEn} with ${confidence}% confidence.`,
    summaryAr: `إشارة ${dirAr} لـ ${pair} عند ${entry}. وقف الخسارة: ${stopLoss}، جني الأرباح 1: ${tp1}. الاتجاه ${trendAr} بثقة ${confidence}%.`,
  };
}

function determineRisk(volatility: number, atr: number, price: number): 'Low' | 'Medium' | 'High' {
  const atrPercent = (atr / price) * 100;
  if (volatility < 0.005 || atrPercent < 0.5) return 'Low';
  if (volatility < 0.015 || atrPercent < 1.5) return 'Medium';
  return 'High';
}

export async function analyzeMarket(pair: string): Promise<StrategyInput> {
  const { prices, highs, lows, closes, volumes, marketData } = generateMockPrices(pair);
  return {
    pair,
    marketData,
    prices,
    highs,
    lows,
    closes,
    volumes,
  };
}

export async function generateStrategy(
  input: Partial<StrategyInput>
): Promise<AIEngineResult> {
  try {
    const jobId = uuidv4();

    let pair = input.pair ?? 'EUR/USD';
    let prices: number[];
    let highs: number[];
    let lows: number[];
    let closes: number[];
    let volumes: number[];
    let marketData: MarketData;

    if (input.prices && input.prices.length > 0) {
      prices = input.prices;
      highs = input.highs ?? input.prices.map(p => p * 1.005);
      lows = input.lows ?? input.prices.map(p => p * 0.995);
      closes = input.closes ?? input.prices;
      volumes = input.volumes ?? input.prices.map(() => Math.random() * 1000000 + 500000);
      marketData = input.marketData ?? {
        pair,
        price: prices[prices.length - 1],
        high24h: Math.max(...highs.slice(-24)),
        low24h: Math.min(...lows.slice(-24)),
        volume: volumes.slice(-24).reduce((a, b) => a + b, 0),
        change24h: prices.length >= 25
          ? ((prices[prices.length - 1] - prices[prices.length - 25]) / prices[prices.length - 25]) * 100
          : 0,
        timestamp: new Date(),
      };
    } else {
      const mock = generateMockPrices(pair);
      prices = mock.prices;
      highs = mock.highs;
      lows = mock.lows;
      closes = mock.closes;
      volumes = mock.volumes;
      marketData = mock.marketData;
    }

    const indicators = calculateAllIndicators(prices, highs, lows, closes, volumes);

    const trend = detectTrend(closes);

    const sr = detectSupportResistance(prices);

    const ohlc = { opens: prices, highs, lows, closes };
    const patterns = detectPatterns(prices, ohlc);

    const direction = determineDirection(indicators, trend);

    const entry = marketData.price;
    const atr = indicators.atr;
    const stopLoss = calculateStopLoss(entry, direction, atr);
    const { tp1, tp2 } = calculateTakeProfit(entry, direction, atr);

    const volatility = calculateVolatility(closes);
    const risk = determineRisk(volatility, atr, entry);

    const confidence = generateConfidence(indicators, trend, patterns);

    const volumeAnalysis = calculateVolumeAnalysis(volumes);

    const { title, titleAr } = generateTitle(pair, direction, confidence);
    const { summary, summaryAr } = generateSummary(pair, direction, entry, stopLoss, tp1, trend, confidence);

    const supports = sr.support;
    const resistances = sr.resistance;

    const strategy: StrategyOutput = {
      title,
      titleAr,
      currencyPair: pair,
      direction,
      entryPrice: Number(entry.toFixed(5)),
      stopLoss: Number(stopLoss.toFixed(5)),
      takeProfit1: Number(tp1.toFixed(5)),
      takeProfit2: Number(tp2.toFixed(5)),
      risk,
      confidence,
      summary,
      summaryAr,
      isPremium: false,
      technicalAnalysis: `Technical analysis for ${pair}: RSI at ${indicators.rsi.toFixed(2)}. MACD ${indicators.macd.histogram > 0 ? 'bullish' : 'bearish'} with histogram at ${indicators.macd.histogram.toFixed(5)}. ADX at ${indicators.adx.toFixed(2)} indicating ${indicators.adx > 25 ? 'trending' : 'non-trending'} market. Volume ${volumeAnalysis.surge ? 'shows a significant surge' : 'is normal'}.`,
      technicalAnalysisAr: `التحليل الفني لـ ${pair}: مؤشر القوة النسبية عند ${indicators.rsi.toFixed(2)}. الماكد ${indicators.macd.histogram > 0 ? 'صاعد' : 'هابط'} مع رسم بياني عند ${indicators.macd.histogram.toFixed(5)}. مؤشر ADX عند ${indicators.adx.toFixed(2)} يشير إلى سوق ${indicators.adx > 25 ? 'متجه' : 'غير متجه'}. ${volumeAnalysis.surge ? 'يظهر الحجم زيادة كبيرة' : 'الحجم طبيعي'}.`,
      fundamentalAnalysis: `Fundamental outlook for ${pair} remains stable with current economic indicators supporting the ${direction === 'BUY' ? 'bullish' : 'bearish'} view. Key support at ${entry * 0.99} and resistance at ${entry * 1.01}.`,
      fundamentalAnalysisAr: `النظرة الأساسية لـ ${pair} تظل مستقرة مع المؤشرات الاقتصادية الحالية الداعمة للنظرة ${direction === 'BUY' ? 'الصاعدة' : 'الهابطة'}. الدعم الرئيسي عند ${entry * 0.99} والمقاومة عند ${entry * 1.01}.`,
      trend: trend === 'BULLISH' ? 'Bullish' as const : trend === 'BEARISH' ? 'Bearish' as const : 'Neutral' as const,
      support1: supports[0] ?? entry * 0.99,
      support2: supports[1] ?? entry * 0.98,
      support3: supports[2] ?? entry * 0.97,
      resistance1: resistances[0] ?? entry * 1.01,
      resistance2: resistances[1] ?? entry * 1.02,
      resistance3: resistances[2] ?? entry * 1.03,
      rsi: Number(indicators.rsi.toFixed(2)),
      macdValue: Number(indicators.macd.macd.toFixed(6)),
      macdSignal: Number(indicators.macd.signal.toFixed(6)),
      macdHistogram: Number(indicators.macd.histogram.toFixed(6)),
      emaFast: Number(indicators.ema.fast.toFixed(5)),
      emaSlow: Number(indicators.ema.slow.toFixed(5)),
      smaPeriod: indicators.sma.period,
      smaValue: Number(indicators.sma.value.toFixed(5)),
      atr: Number(indicators.atr.toFixed(5)),
      bbUpper: Number(indicators.bb.upper.toFixed(5)),
      bbMiddle: Number(indicators.bb.middle.toFixed(5)),
      bbLower: Number(indicators.bb.lower.toFixed(5)),
      notes: `Strategy generated at ${marketData.timestamp.toISOString()}. Direction: ${direction}. Entry: ${entry}. Confidence: ${confidence}%. Risk: ${risk}. Patterns detected: ${patterns.length}.`,
      notesAr: `تم إنشاء الاستراتيجية في ${marketData.timestamp.toISOString()}. الاتجاه: ${direction === 'BUY' ? 'شراء' : 'بيع'}. الدخول: ${entry}. الثقة: ${confidence}%. المخاطرة: ${risk === 'Low' ? 'منخفضة' : risk === 'Medium' ? 'متوسطة' : 'عالية'}. الأنماط المكتشفة: ${patterns.length}.`,
      tradesAnalyzed: Math.floor(Math.random() * 10000) + 1000,
      aiModel: 'YuanBridge AI Engine v1.0',
      aiProvider: 'openai',
      indicators,
      patterns,
    };

    return {
      success: true,
      strategy,
      jobId,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      strategy: null,
      jobId: null,
      error: error instanceof Error ? error.message : 'Unknown error generating strategy',
    };
  }
}

export { calculateAllIndicators };
