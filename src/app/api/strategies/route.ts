import { NextResponse } from "next/server";
import type { Strategy } from "@/lib/types";
import type { StrategiesResponse } from "@/lib/types/strategy";

const mockStrategies: Strategy[] = [
  {
    id: "strat_001",
    title: "EUR/USD Breakout Strategy",
    titleAr: "استراتيجية اختراق اليورو/دولار",
    currencyPair: "EUR/USD",
    direction: "BUY",
    entryPrice: 1.0850,
    stopLoss: 1.0780,
    takeProfit1: 1.0920,
    takeProfit2: 1.0980,
    risk: "Low",
    confidence: 87,
    publishedAt: new Date().toISOString(),
    summary: "A low-risk EUR/USD breakout setup with strong support levels.",
    summaryAr: "إعداد اختراق منخفض المخاطر لليورو/دولار مع مستويات دعم قوية.",
    isPremium: false,
    technicalAnalysis: "Price is forming a bullish flag pattern on the 4H chart.",
    technicalAnalysisAr: "السعر يشكل نموذج العلم الصاعد على الرسم البياني 4 ساعات.",
    fundamentalAnalysis: "Strong USD weakness due to dovish Fed expectations.",
    fundamentalAnalysisAr: "ضعف الدولار بسبب توقعات الاحتياطي الفيدرالي المتساهلة.",
    trend: "Bullish",
    support: [1.0800, 1.0750, 1.0700],
    resistance: [1.0900, 1.0950, 1.1000],
    indicators: {
      rsi: 62,
      macd: "Bullish crossover",
      ema: "Price above EMA(50)",
      sma: "Price above SMA(200)",
      atr: 0.0025,
      bollingerBands: { upper: 1.0950, middle: 1.0850, lower: 1.0750 },
    },
    notes: "Wait for confirmation candle close above 1.0860.",
    notesAr: "انتظر إغلاق شمعة التأكيد فوق 1.0860.",
    tradesAnalyzed: 1240,
    aiModel: "GPT-4o",
  },
  {
    id: "strat_002",
    title: "GBP/JPY Momentum Trade",
    titleAr: "صفقة زخم الجنيه/ين",
    currencyPair: "GBP/JPY",
    direction: "SELL",
    entryPrice: 192.50,
    stopLoss: 193.80,
    takeProfit1: 191.20,
    takeProfit2: 190.00,
    risk: "High",
    confidence: 76,
    publishedAt: new Date().toISOString(),
    summary: "High-probability sell setup on GBP/JPY overbought conditions.",
    summaryAr: "إعداد بيع عالي الاحتمال على زخم زوج الجنيه/ين في ظروف تشبع شراء.",
    isPremium: true,
    technicalAnalysis: "RSI showing bearish divergence on the daily chart.",
    technicalAnalysisAr: "مؤشر القوة النسبية يظهر انحراف bearish على الرسم البياني اليومي.",
    fundamentalAnalysis: "BoJ intervention concerns driving JPY strength.",
    fundamentalAnalysisAr: "مخاوف تدخل بنك اليابان تقود قوة الين.",
    trend: "Bearish",
    support: [191.00, 190.50, 189.80],
    resistance: [193.00, 193.50, 194.00],
    indicators: {
      rsi: 72,
      macd: "Bearish divergence",
      ema: "Price testing EMA(20)",
      sma: "Price below SMA(50)",
      atr: 0.85,
      bollingerBands: { upper: 194.50, middle: 192.50, lower: 190.50 },
    },
    notes: "Consider partial position at TP1. Risk management is key.",
    notesAr: "فكر في مركز جزئي عند الهدف الأول. إدارة المخاطر أساسية.",
    tradesAnalyzed: 890,
    aiModel: "Claude 3.5 Sonnet",
  },
  {
    id: "strat_003",
    title: "XAU/USD Reversal Play",
    titleAr: "لعبة انعكاس الذهب/دولار",
    currencyPair: "XAU/USD",
    direction: "BUY",
    entryPrice: 2320.00,
    stopLoss: 2290.00,
    takeProfit1: 2350.00,
    takeProfit2: 2380.00,
    risk: "Medium",
    confidence: 82,
    publishedAt: new Date().toISOString(),
    summary: "Gold reversal from key support with strong buying pressure.",
    summaryAr: "انعكاس الذهب من دعم رئيسي مع ضغط شراء قوي.",
    isPremium: false,
    technicalAnalysis: "Double bottom pattern forming on the H1 chart.",
    technicalAnalysisAr: "نموذج القاع المزدوج يتشكل على الرسم البياني ساعة.",
    fundamentalAnalysis: "Geopolitical tensions boosting safe-haven demand.",
    fundamentalAnalysisAr: "التوترات الجيوسياسية تعزز الطلب على الملاذ الآمن.",
    trend: "Bullish",
    support: [2300, 2280, 2250],
    resistance: [2340, 2360, 2400],
    indicators: {
      rsi: 45,
      macd: "Bullish convergence",
      ema: "Price near EMA(50)",
      sma: "Price above SMA(200)",
      atr: 18.5,
      bollingerBands: { upper: 2380, middle: 2320, lower: 2260 },
    },
    notes: "Watch for volume confirmation before entry.",
    notesAr: "راقب تأكيد الحجم قبل الدخول.",
    tradesAnalyzed: 2050,
    aiModel: "Gemini Ultra",
  },
  {
    id: "strat_004",
    title: "BTC/USD Range Scalp",
    titleAr: "سكالبينج نطاق البيتكوين/دولار",
    currencyPair: "BTC/USD",
    direction: "SELL",
    entryPrice: 67500,
    stopLoss: 68500,
    takeProfit1: 66500,
    takeProfit2: 65500,
    risk: "Medium",
    confidence: 71,
    publishedAt: new Date().toISOString(),
    summary: "Scalping opportunity at range resistance with low risk.",
    summaryAr: "فرصة سكالبينج عند مقاومة النطاق مع مخاطر منخفضة.",
    isPremium: true,
    technicalAnalysis: "Price rejected at range high multiple times.",
    technicalAnalysisAr: "السعر رفض عند قمة النطاق عدة مرات.",
    fundamentalAnalysis: "ETF outflows creating short-term selling pressure.",
    fundamentalAnalysisAr: "تدفقات صناديق الاستثمار المتداولة تخلق ضغط بيع قصير المدى.",
    trend: "Neutral",
    support: [66000, 65000, 64000],
    resistance: [68000, 69000, 70000],
    indicators: {
      rsi: 55,
      macd: "Flat",
      ema: "Price between EMA(20) and EMA(50)",
      sma: "Price below SMA(200)",
      atr: 850,
      bollingerBands: { upper: 69000, middle: 67500, lower: 66000 },
    },
    notes: "Tight stop loss. Quick scalp expected.",
    notesAr: "وقف خسارة ضيق. سكالبينج سريع متوقع.",
    tradesAnalyzed: 1670,
    aiModel: "DeepSeek R1",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const direction = searchParams.get("direction") as "BUY" | "SELL" | null;
    const risk = searchParams.get("risk") as "Low" | "Medium" | "High" | null;
    const isPremium = searchParams.get("isPremium");
    const currencyPair = searchParams.get("currencyPair");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") as "newest" | "oldest" | "highest_confidence" | "lowest_confidence" | null;

    let filtered = [...mockStrategies];

    if (direction) {
      filtered = filtered.filter((s) => s.direction === direction);
    }

    if (risk) {
      filtered = filtered.filter((s) => s.risk === risk);
    }

    if (isPremium !== null) {
      const premium = isPremium === "true";
      filtered = filtered.filter((s) => s.isPremium === premium);
    }

    if (currencyPair) {
      filtered = filtered.filter((s) =>
        s.currencyPair.toLowerCase().includes(currencyPair.toLowerCase())
      );
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.currencyPair.toLowerCase().includes(q)
      );
    }

    if (sort === "oldest") {
      filtered.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    } else if (sort === "highest_confidence") {
      filtered.sort((a, b) => b.confidence - a.confidence);
    } else if (sort === "lowest_confidence") {
      filtered.sort((a, b) => a.confidence - b.confidence);
    } else {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const strategies = filtered.slice(start, start + limit);

    const response: StrategiesResponse = {
      strategies,
      total,
      page,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Strategies list error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
