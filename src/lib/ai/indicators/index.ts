export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period || period <= 0) return 0;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period || period <= 0) return 0;
  const multiplier = 2 / (period + 1);
  const sma = calculateSMA(prices.slice(0, period), period);
  let ema = sma;
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  return ema;
}

export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter(c => c > 0).reduce((s, c) => s + c, 0);
  const losses = recentChanges.filter(c => c < 0).reduce((s, c) => s + Math.abs(c), 0);
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number; signal: number; histogram: number } {
  const macdLine = calculateEMA(prices, fastPeriod) - calculateEMA(prices, slowPeriod);
  const signal = calculateEMA([macdLine], signalPeriod);
  const histogram = macdLine - signal;
  return { macd: macdLine, signal, histogram };
}

export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number {
  if (highs.length < 2) return 0;
  const trueRanges: number[] = [];
  for (let i = 1; i < Math.min(highs.length, period + 1); i++) {
    const hl = highs[i] - lows[i];
    const hc = Math.abs(highs[i] - closes[i - 1]);
    const lc = Math.abs(lows[i] - closes[i - 1]);
    trueRanges.push(Math.max(hl, hc, lc));
  }
  if (trueRanges.length === 0) return 0;
  return trueRanges.reduce((a, b) => a + b, 0) / trueRanges.length;
}

export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number; middle: number; lower: number } {
  const middle = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  const mean = middle;
  const squaredDiffs = slice.map(p => (p - mean) ** 2);
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / slice.length;
  const sd = Math.sqrt(variance);
  return {
    upper: middle + sd * stdDev,
    middle,
    lower: middle - sd * stdDev,
  };
}

export function calculateVWAP(prices: number[], volumes: number[]): number {
  if (prices.length === 0 || volumes.length === 0) return 0;
  const len = Math.min(prices.length, volumes.length);
  let pvSum = 0;
  let volSum = 0;
  for (let i = 0; i < len; i++) {
    pvSum += prices[i] * volumes[i];
    volSum += volumes[i];
  }
  return volSum === 0 ? 0 : pvSum / volSum;
}

function calculateDirectionalMovement(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): { plusDI: number; minusDI: number; dx: number } {
  if (highs.length < period + 1) return { plusDI: 0, minusDI: 0, dx: 0 };
  const trValues: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  for (let i = 1; i <= period; i++) {
    const hl = highs[i] - lows[i];
    const hc = Math.abs(highs[i] - closes[i - 1]);
    const lc = Math.abs(lows[i] - closes[i - 1]);
    trValues.push(Math.max(hl, hc, lc));
    const upMove = highs[i] - highs[i - 1];
    const downMove = lows[i - 1] - lows[i];
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }
  const atr = trValues.reduce((a, b) => a + b, 0) / period;
  const sumPlusDM = plusDM.reduce((a, b) => a + b, 0);
  const sumMinusDM = minusDM.reduce((a, b) => a + b, 0);
  const plusDI = atr === 0 ? 0 : (sumPlusDM / atr) * 100;
  const minusDI = atr === 0 ? 0 : (sumMinusDM / atr) * 100;
  const dx = (plusDI + minusDI) === 0 ? 0 : Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
  return { plusDI, minusDI, dx };
}

export function calculateADX(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number {
  const { dx } = calculateDirectionalMovement(highs, lows, closes, period);
  return dx;
}

export function calculateCCI(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 20
): number {
  if (highs.length < period) return 0;
  const typicalPrices = highs.map((h, i) => (h + lows[i] + closes[i]) / 3);
  const tpSlice = typicalPrices.slice(-period);
  const sma = tpSlice.reduce((a, b) => a + b, 0) / period;
  const meanDev = tpSlice.reduce((sum, tp) => sum + Math.abs(tp - sma), 0) / period;
  return meanDev === 0 ? 0 : (tpSlice[tpSlice.length - 1] - sma) / (0.015 * meanDev);
}

export function calculateStochasticRSI(
  prices: number[],
  period: number = 14,
  smoothK: number = 3,
  smoothD: number = 3
): { k: number; d: number } {
  if (prices.length < period + period) return { k: 50, d: 50 };
  const rsiValues: number[] = [];
  for (let i = period; i < prices.length; i++) {
    rsiValues.push(calculateRSI(prices.slice(0, i + 1), period));
  }
  if (rsiValues.length < period) return { k: 50, d: 50 };
  const rsiSlice = rsiValues.slice(-period);
  const minRsi = Math.min(...rsiSlice);
  const maxRsi = Math.max(...rsiSlice);
  const currentRsi = rsiSlice[rsiSlice.length - 1];
  const stochK = maxRsi === minRsi ? 50 : ((currentRsi - minRsi) / (maxRsi - minRsi)) * 100;
  const k = stochK;
  const d = k;
  return { k, d };
}

export function calculateIchimoku(
  highs: number[],
  lows: number[],
  closes: number[]
): { tenkan: number; kijun: number; senkouA: number; senkouB: number; chikou: number } {
  const len = highs.length;
  const nineHigh = Math.max(...highs.slice(-9));
  const nineLow = Math.min(...lows.slice(-9));
  const tenkan = (nineHigh + nineLow) / 2;
  const twentySixHigh = Math.max(...highs.slice(-26));
  const twentySixLow = Math.min(...lows.slice(-26));
  const kijun = (twentySixHigh + twentySixLow) / 2;
  const senkouA = (tenkan + kijun) / 2;
  const fiftyTwoHigh = Math.max(...highs.slice(-52));
  const fiftyTwoLow = Math.min(...lows.slice(-52));
  const senkouB = (fiftyTwoHigh + fiftyTwoLow) / 2;
  const chikou = len >= 26 ? closes[len - 26] : closes[0];
  return { tenkan, kijun, senkouA, senkouB, chikou };
}

export function calculateFibonacciRetracement(
  high: number,
  low: number
): { levels: { level: number; price: number }[] } {
  const diff = high - low;
  const levels = [
    { level: 0, price: high },
    { level: 0.236, price: high - diff * 0.236 },
    { level: 0.382, price: high - diff * 0.382 },
    { level: 0.5, price: high - diff * 0.5 },
    { level: 0.618, price: high - diff * 0.618 },
    { level: 0.786, price: high - diff * 0.786 },
    { level: 1, price: low },
  ];
  return { levels };
}

export function calculatePivotPoints(
  high: number,
  low: number,
  close: number
): { pp: number; r1: number; r2: number; s1: number; s2: number } {
  const pp = (high + low + close) / 3;
  const r1 = 2 * pp - low;
  const r2 = pp + (high - low);
  const s1 = 2 * pp - high;
  const s2 = pp - (high - low);
  return { pp, r1, r2, s1, s2 };
}

export function detectSupportResistance(
  prices: number[]
): { support: number[]; resistance: number[] } {
  if (prices.length < 10) return { support: [], resistance: [] };
  const pivotPoints: number[] = [];
  for (let i = 2; i < prices.length - 2; i++) {
    if (prices[i] > prices[i - 1] && prices[i] > prices[i - 2] &&
        prices[i] > prices[i + 1] && prices[i] > prices[i + 2]) {
      pivotPoints.push(prices[i]);
    }
    if (prices[i] < prices[i - 1] && prices[i] < prices[i - 2] &&
        prices[i] < prices[i + 1] && prices[i] < prices[i + 2]) {
      pivotPoints.push(prices[i]);
    }
  }
  const sorted = [...pivotPoints].sort((a, b) => a - b);
  const midpoint = sorted.length / 2;
  const support = sorted.slice(0, Math.floor(midpoint)).reverse();
  const resistance = sorted.slice(Math.ceil(midpoint));
  return {
    support: [...new Set(support)].slice(0, 3),
    resistance: [...new Set(resistance)].slice(0, 3),
  };
}

export function detectTrend(prices: number[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  if (prices.length < 20) return 'NEUTRAL';
  const shortSma = calculateSMA(prices, 10);
  const longSma = calculateSMA(prices, 20);
  const diff = ((shortSma - longSma) / longSma) * 100;
  if (diff > 0.5) return 'BULLISH';
  if (diff < -0.5) return 'BEARISH';
  return 'NEUTRAL';
}

export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance);
}

export function calculateVolumeAnalysis(volumes: number[]): { average: number; surge: boolean } {
  if (volumes.length === 0) return { average: 0, surge: false };
  const average = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const latest = volumes[volumes.length - 1];
  const surge = average > 0 && latest > average * 1.5;
  return { average, surge };
}

export function calculateAllIndicators(
  prices: number[],
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[]
) {
  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const emaFast = calculateEMA(closes, 12);
  const emaSlow = calculateEMA(closes, 26);
  const smaPeriod = 50;
  const smaValue = calculateSMA(closes, smaPeriod);
  const atr = calculateATR(highs, lows, closes);
  const bb = calculateBollingerBands(closes);
  const adx = calculateADX(highs, lows, closes);
  const cci = calculateCCI(highs, lows, closes);
  const stochasticRsi = calculateStochasticRSI(closes);
  const vwap = calculateVWAP(closes, volumes);
  const ichimoku = calculateIchimoku(highs, lows, closes);
  const high = Math.max(...highs);
  const low = Math.min(...lows);
  const close = closes[closes.length - 1];
  const fibonacci = calculateFibonacciRetracement(high, low);
  const pivotPoints = calculatePivotPoints(high, low, close);

  return {
    rsi,
    macd,
    ema: { fast: emaFast, slow: emaSlow },
    sma: { period: smaPeriod, value: smaValue },
    atr,
    bb,
    adx,
    cci,
    stochasticRsi,
    vwap,
    ichimoku,
    fibonacci,
    pivotPoints,
  };
}
