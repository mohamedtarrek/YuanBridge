import type { PatternResult } from '@/lib/ai/types';

function findPivotHighs(prices: number[], window: number = 3): number[] {
  const pivots: number[] = [];
  for (let i = window; i < prices.length - window; i++) {
    let isPivot = true;
    for (let j = 1; j <= window; j++) {
      if (prices[i] <= prices[i - j] || prices[i] <= prices[i + j]) {
        isPivot = false;
        break;
      }
    }
    if (isPivot) pivots.push(i);
  }
  return pivots;
}

function findPivotLows(prices: number[], window: number = 3): number[] {
  const pivots: number[] = [];
  for (let i = window; i < prices.length - window; i++) {
    let isPivot = true;
    for (let j = 1; j <= window; j++) {
      if (prices[i] >= prices[i - j] || prices[i] >= prices[i + j]) {
        isPivot = false;
        break;
      }
    }
    if (isPivot) pivots.push(i);
  }
  return pivots;
}

function detectHeadAndShoulders(prices: number[]): PatternResult | null {
  const highs = findPivotHighs(prices);
  if (highs.length < 3) return null;
  const lastThree = highs.slice(-3);
  const [left, head, right] = lastThree;
  if (
    prices[head] > prices[left] &&
    prices[head] > prices[right] &&
    Math.abs(prices[left] - prices[right]) / prices[left] < 0.1
  ) {
    return {
      name: 'Head and Shoulders',
      direction: 'SELL',
      confidence: 75,
      description: 'Classic head and shoulders pattern detected, indicating a potential trend reversal to bearish.',
    };
  }
  return null;
}

function detectInverseHeadAndShoulders(prices: number[]): PatternResult | null {
  const lows = findPivotLows(prices);
  if (lows.length < 3) return null;
  const lastThree = lows.slice(-3);
  const [left, head, right] = lastThree;
  if (
    prices[head] < prices[left] &&
    prices[head] < prices[right] &&
    Math.abs(prices[left] - prices[right]) / prices[left] < 0.1
  ) {
    return {
      name: 'Inverse Head and Shoulders',
      direction: 'BUY',
      confidence: 75,
      description: 'Inverse head and shoulders pattern detected, indicating a potential trend reversal to bullish.',
    };
  }
  return null;
}

function detectDoubleTop(prices: number[]): PatternResult | null {
  const highs = findPivotHighs(prices);
  if (highs.length < 2) return null;
  const lastTwo = highs.slice(-2);
  const diff = Math.abs(prices[lastTwo[0]] - prices[lastTwo[1]]);
  const avg = (prices[lastTwo[0]] + prices[lastTwo[1]]) / 2;
  if (diff / avg < 0.03) {
    return {
      name: 'Double Top',
      direction: 'SELL',
      confidence: 70,
      description: 'Double top pattern detected at resistance level, suggesting a bearish reversal.',
    };
  }
  return null;
}

function detectDoubleBottom(prices: number[]): PatternResult | null {
  const lows = findPivotLows(prices);
  if (lows.length < 2) return null;
  const lastTwo = lows.slice(-2);
  const diff = Math.abs(prices[lastTwo[0]] - prices[lastTwo[1]]);
  const avg = (prices[lastTwo[0]] + prices[lastTwo[1]]) / 2;
  if (diff / avg < 0.03) {
    return {
      name: 'Double Bottom',
      direction: 'BUY',
      confidence: 70,
      description: 'Double bottom pattern detected at support level, suggesting a bullish reversal.',
    };
  }
  return null;
}

function detectBullishFlag(prices: number[]): PatternResult | null {
  const len = prices.length;
  if (len < 20) return null;
  const recent = prices.slice(-10);
  const prior = prices.slice(-20, -10);
  const priorRise = (prior[prior.length - 1] - prior[0]) / prior[0];
  const recentRange = Math.max(...recent) - Math.min(...recent);
  const priorRange = Math.max(...prior) - Math.min(...prior);
  if (priorRise > 0.03 && recentRange < priorRange * 0.7) {
    return {
      name: 'Bullish Flag',
      direction: 'BUY',
      confidence: 65,
      description: 'Bullish flag pattern detected, suggesting continuation of the uptrend.',
    };
  }
  return null;
}

function detectBearishFlag(prices: number[]): PatternResult | null {
  const len = prices.length;
  if (len < 20) return null;
  const recent = prices.slice(-10);
  const prior = prices.slice(-20, -10);
  const priorFall = (prior[0] - prior[prior.length - 1]) / prior[0];
  const recentRange = Math.max(...recent) - Math.min(...recent);
  const priorRange = Math.max(...prior) - Math.min(...prior);
  if (priorFall > 0.03 && recentRange < priorRange * 0.7) {
    return {
      name: 'Bearish Flag',
      direction: 'SELL',
      confidence: 65,
      description: 'Bearish flag pattern detected, suggesting continuation of the downtrend.',
    };
  }
  return null;
}

function detectWedge(prices: number[]): PatternResult | null {
  const len = prices.length;
  if (len < 15) return null;
  const recent = prices.slice(-15);
  const slopes: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    slopes.push(recent[i] - recent[i - 1]);
  }
  const avgSlope = slopes.reduce((a, b) => a + b, 0) / slopes.length;
  const absSlope = Math.abs(avgSlope);
  if (absSlope > 0 && absSlope < 0.005) {
    const range = Math.max(...recent) - Math.min(...recent);
    const avgPrice = recent.reduce((a, b) => a + b, 0) / recent.length;
    if (range / avgPrice < 0.05) {
      const direction = avgSlope > 0 ? 'SELL' : 'BUY';
      return {
        name: 'Wedge',
        direction: direction as 'BUY' | 'SELL',
        confidence: 55,
        description: `${avgSlope > 0 ? 'Rising' : 'Falling'} wedge pattern detected, typically a reversal signal.`,
      };
    }
  }
  return null;
}

function detectTriangle(prices: number[]): PatternResult | null {
  const len = prices.length;
  if (len < 15) return null;
  const recent = prices.slice(-15);
  const highs_local = findPivotHighs(recent);
  const lows_local = findPivotLows(recent);
  const highPrices = highs_local.map(i => recent[i]);
  const lowPrices = lows_local.map(i => recent[i]);
  if (highPrices.length < 2 || lowPrices.length < 2) return null;
  const highSlope = (highPrices[highPrices.length - 1] - highPrices[0]) / highPrices.length;
  const lowSlope = (lowPrices[lowPrices.length - 1] - lowPrices[0]) / lowPrices.length;
  if (Math.abs(highSlope) < 0.001 && Math.abs(lowSlope) < 0.001) {
    return {
      name: 'Rectangle',
      direction: 'NEUTRAL',
      confidence: 50,
      description: 'Rectangle consolidation pattern detected. Watch for a breakout.',
    };
  }
  if (highSlope < 0 && lowSlope > 0) {
    return {
      name: 'Symmetrical Triangle',
      direction: 'NEUTRAL',
      confidence: 60,
      description: 'Symmetrical triangle pattern detected. Expect a breakout in either direction.',
    };
  }
  if (highSlope < 0 && lowSlope < 0) {
    return {
      name: 'Descending Triangle',
      direction: 'SELL',
      confidence: 55,
      description: 'Descending triangle pattern detected, suggesting bearish breakout potential.',
    };
  }
  if (highSlope > 0 && lowSlope > 0) {
    return {
      name: 'Ascending Triangle',
      direction: 'BUY',
      confidence: 55,
      description: 'Ascending triangle pattern detected, suggesting bullish breakout potential.',
    };
  }
  return null;
}

function detectSingleCandlePatterns(
  open: number,
  high: number,
  low: number,
  close: number
): PatternResult[] {
  const patterns: PatternResult[] = [];
  const body = Math.abs(close - open);
  const upperShadow = high - Math.max(open, close);
  const lowerShadow = Math.min(open, close) - low;
  const totalRange = high - low;

  if (totalRange === 0) return patterns;

  if (body / totalRange < 0.1 && upperShadow > body * 2 && lowerShadow > body * 2) {
    patterns.push({
      name: 'Doji',
      direction: 'NEUTRAL',
      confidence: 40,
      description: 'Doji candle indicates indecision in the market. Potential reversal signal.',
    });
  }

  if (body / totalRange > 0.3 && lowerShadow / totalRange > 0.6) {
    patterns.push({
      name: 'Hammer',
      direction: close > open ? 'BUY' : 'SELL',
      confidence: 60,
      description: 'Hammer candlestick detected, suggesting a potential bullish reversal.',
    });
  }

  if (body / totalRange > 0.3 && upperShadow / totalRange > 0.6) {
    patterns.push({
      name: 'Shooting Star',
      direction: close < open ? 'SELL' : 'BUY',
      confidence: 55,
      description: 'Shooting star candlestick detected, suggesting a potential bearish reversal.',
    });
  }

  return patterns;
}

function detectEngulfing(
  prevOpen: number,
  prevClose: number,
  currOpen: number,
  currClose: number
): PatternResult | null {
  const prevBullish = prevClose > prevOpen;
  const prevBearish = prevClose < prevOpen;
  const currBullish = currClose > currOpen;
  const currBearish = currClose < currOpen;

  if (prevBearish && currBullish && currOpen < prevClose && currClose > prevOpen) {
    return {
      name: 'Bullish Engulfing',
      direction: 'BUY',
      confidence: 70,
      description: 'Bullish engulfing pattern detected, strong reversal signal to the upside.',
    };
  }

  if (prevBullish && currBearish && currOpen > prevClose && currClose < prevOpen) {
    return {
      name: 'Bearish Engulfing',
      direction: 'SELL',
      confidence: 70,
      description: 'Bearish engulfing pattern detected, strong reversal signal to the downside.',
    };
  }

  return null;
}

export function detectPatterns(
  prices: number[],
  ohlc?: { opens: number[]; highs: number[]; lows: number[]; closes: number[] }
): PatternResult[] {
  const patterns: PatternResult[] = [];

  const hs = detectHeadAndShoulders(prices);
  if (hs) patterns.push(hs);

  const ihs = detectInverseHeadAndShoulders(prices);
  if (ihs) patterns.push(ihs);

  const dt = detectDoubleTop(prices);
  if (dt) patterns.push(dt);

  const db = detectDoubleBottom(prices);
  if (db) patterns.push(db);

  const bf = detectBullishFlag(prices);
  if (bf) patterns.push(bf);

  const baf = detectBearishFlag(prices);
  if (baf) patterns.push(baf);

  const wedge = detectWedge(prices);
  if (wedge) patterns.push(wedge);

  const triangle = detectTriangle(prices);
  if (triangle) patterns.push(triangle);

  if (ohlc) {
    const { opens, highs, lows, closes } = ohlc;
    if (opens.length > 0 && closes.length > 0) {
      const lastIdx = opens.length - 1;

      if (lastIdx >= 0) {
        const candles = detectSingleCandlePatterns(
          opens[lastIdx],
          highs[lastIdx],
          lows[lastIdx],
          closes[lastIdx]
        );
        patterns.push(...candles);
      }

      if (lastIdx >= 1) {
        const engulfing = detectEngulfing(
          opens[lastIdx - 1],
          closes[lastIdx - 1],
          opens[lastIdx],
          closes[lastIdx]
        );
        if (engulfing) patterns.push(engulfing);
      }
    }
  }

  return patterns;
}
