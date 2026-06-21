'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import type { Strategy } from '@/lib/types';

const allMockStrategies: Strategy[] = [
  {
    id: '1',
    title: 'EUR/USD Bullish Breakout',
    titleAr: 'انفراج صاعد لليورو مقابل الدولار',
    currencyPair: 'EUR/USD',
    direction: 'BUY',
    entryPrice: 1.08450,
    stopLoss: 1.07800,
    takeProfit1: 1.09200,
    takeProfit2: 1.09800,
    risk: 'Low',
    confidence: 87,
    publishedAt: new Date().toISOString(),
    summary: 'Strong bullish momentum detected with RSI divergence on the 4H timeframe. Price is breaking above key resistance with increased volume.',
    summaryAr: 'تم اكتشاف زخم صاعد قوي مع تباعد في مؤشر RSI على الإطار الزمني 4 ساعات. السعر يخترق فوق المقاومة الرئيسية مع زيادة في الحجم.',
    isPremium: false,
    technicalAnalysis: 'RSI shows bullish divergence on the 4H chart. MACD crossed above signal line with increasing histogram. Price is trading above both EMA50 and SMA50, confirming the bullish trend. Bollinger Bands are expanding, suggesting increased volatility favoring the breakout. Volume analysis shows strong buying pressure with three consecutive bullish candles.',
    technicalAnalysisAr: 'يظهر مؤشر RSI تباعداً صاعداً على الرسم البياني 4 ساعات. تقاطع MACD فوق خط الإشارة مع زيادة في الرسم البياني. السعر يتداول فوق كل من EMA50 و SMA50، مما يؤكد الاتجاه الصاعد. نطاقات بولينجر تتسع، مما يشير إلى زيادة التقلبات لصالح الانفراج. يظهر تحليل الحجم ضغط شراء قوي مع ثلاث شموع صاعدة متتالية.',
    fundamentalAnalysis: 'The US Dollar is weakening following softer-than-expected employment data. The ECB maintains a hawkish stance on interest rates. Eurozone PMI data came in above expectations, supporting the Euro. Market sentiment is risk-on, favoring higher-yielding currencies.',
    fundamentalAnalysisAr: 'الدولار الأمريكي يضعف بعد بيانات التوظيف الأقل من المتوقعة. البنك المركزي الأوروبي يحافظ على موقف متشدد بشأن أسعار الفائدة. جاءت بيانات مؤشر مديري المشتريات في منطقة اليورو أعلى من التوقعات، مما يدعم اليورو. معنويات السوق إيجابية، لصالح العملات ذات العائد المرتفع.',
    trend: 'Bullish',
    support: [1.07800, 1.07500, 1.07000],
    resistance: [1.09200, 1.09800, 1.10500],
    indicators: { rsi: 62, macd: 'Bullish', ema: 'Bullish', sma: 'Above SMA50', atr: 0.0015, bollingerBands: { upper: 1.095, middle: 1.085, lower: 1.075 } },
    notes: 'Consider entering after a minor pullback to the entry zone. Watch for volume confirmation. Set stop loss below the recent swing low.',
    notesAr: 'فكر في الدخول بعد تراجع طفيف إلى منطقة الدخول. راقب تأكيد الحجم. ضع وقف الخسارة أدنى أدنى مستوى تأرجح حديث.',
    tradesAnalyzed: 3421,
    aiModel: 'YuanBridge AI v2.4',
  },
  {
    id: '2',
    title: 'GBP/USD Bearish Reversal',
    titleAr: 'انعكاس هابط للجنيه مقابل الدولار',
    currencyPair: 'GBP/USD',
    direction: 'SELL',
    entryPrice: 1.26500,
    stopLoss: 1.27100,
    takeProfit1: 1.25700,
    takeProfit2: 1.25100,
    risk: 'Medium',
    confidence: 82,
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    summary: 'Bearish engulfing pattern on daily timeframe with overbought RSI. Strong resistance zone identified.',
    summaryAr: 'نمط ابتلاع هابط على الإطار الزمني اليومي مع RSI في منطقة ذروة الشراء. تم تحديد منطقة مقاومة قوية.',
    isPremium: true,
    technicalAnalysis: 'Bearish engulfing candle formed on the daily chart at a key resistance level. RSI is above 70 indicating overbought conditions. MACD shows bearish momentum with histogram declining. Price failed to break above the 200-day moving average. Multiple bearish divergences detected across oscillators.',
    technicalAnalysisAr: 'تشكلت شمعة ابتلاع هابطة على الرسم البياني اليومي عند مستوى مقاومة رئيسي. مؤشر RSI فوق 70 مما يشير إلى ظروف ذروة الشراء. يظهر MACD زخماً هابطاً مع تراجع الرسم البياني. فشل السعر في اختراق المتوسط المتحرك لـ 200 يوم. تم اكتشاف تباعدات هابطة متعددة عبر المؤشرات.',
    fundamentalAnalysis: 'Bank of England signals potential rate cuts amid slowing economic growth. UK inflation data came in below expectations. Political uncertainty surrounding upcoming elections weighs on the Pound. US economic data remains resilient, supporting the Dollar.',
    fundamentalAnalysisAr: 'بنك إنجلترا يشير إلى تخفيضات محتملة في أسعار الفائدة وسط تباطؤ النمو الاقتصادي. جاءت بيانات التضخم في المملكة المتحدة أقل من التوقعات. عدم اليقين السياسي المحيط بالانتخابات المقبلة يثقل كاهل الجنيه. البيانات الاقتصادية الأمريكية تظل مرنة، مما يدعم الدولار.',
    trend: 'Bearish',
    support: [1.25700, 1.25100, 1.24500],
    resistance: [1.27100, 1.27500, 1.28200],
    indicators: { rsi: 72, macd: 'Bearish', ema: 'Bearish', sma: 'Below SMA50', atr: 0.0018, bollingerBands: { upper: 1.275, middle: 1.265, lower: 1.255 } },
    notes: 'Wait for confirmation candle below the engulfing pattern low. Partial profit at TP1, trail remaining to TP2. Tight stop loss recommended.',
    notesAr: 'انتظر شمعة تأكيد أدنى مستوى نمط الابتلاع. أرباح جزئية عند TP1، وتتبع الباقي إلى TP2. يُوصى بوقف خسارة ضيق.',
    tradesAnalyzed: 2810,
    aiModel: 'YuanBridge AI v2.4',
  },
  {
    id: '3',
    title: 'USD/JPY Range Breakout',
    titleAr: 'انفراج نطاق الدولار مقابل الين',
    currencyPair: 'USD/JPY',
    direction: 'BUY',
    entryPrice: 149.350,
    stopLoss: 148.700,
    takeProfit1: 150.200,
    takeProfit2: 150.800,
    risk: 'High',
    confidence: 76,
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    summary: 'Breaking above resistance with increased volume and momentum. Bullish flag pattern identified.',
    summaryAr: 'اختراق فوق المقاومة مع زيادة في الحجم والزخم. تم تحديد نمط العلم الصاعد.',
    isPremium: false,
    technicalAnalysis: 'Price broke out of a consolidation range on the 1H chart with above-average volume. Bullish flag pattern completed with a strong upside move. RSI is at 58 with room to run higher. MACD histogram is rising. EMA9 crossed above EMA21. Short-term momentum indicators all point higher.',
    technicalAnalysisAr: 'اخترق السعر نطاق التماسك على الرسم البياني 1 ساعة بحجم أعلى من المتوسط. اكتمل نمط العلم الصاعد بحركة صاعدة قوية. مؤشر RSI عند 58 مع مساحة للارتفاع. الرسم البياني لـ MACD في ارتفاع. تقاطع EMA9 فوق EMA21. جميع مؤشرات الزخم قصيرة المدى تشير إلى الارتفاع.',
    fundamentalAnalysis: 'Bank of Japan maintains ultra-loose monetary policy. US Treasury yields continue to rise, widening the rate differential. Japanese economic data remains mixed with weak consumer spending. Risk-off sentiment could trigger safe-haven flows into JPY.',
    fundamentalAnalysisAr: 'بنك اليابان يحافظ على السياسة النقدية فائقة التيسير. عوائد الخزانة الأمريكية تستمر في الارتفاع، مما يوسع فارق أسعار الفائدة. البيانات الاقتصادية اليابانية لا تزال مختلطة مع ضعف الإنفاق الاستهلاكي. معنويات الإحجام عن المخاطرة قد تؤدي إلى تدفقات الملاذ الآمن إلى الين.',
    trend: 'Bullish',
    support: [148.700, 148.300, 147.800],
    resistance: [150.200, 150.800, 151.500],
    indicators: { rsi: 58, macd: 'Bullish', ema: 'Bullish', sma: 'Above SMA50', atr: 0.45, bollingerBands: { upper: 150.5, middle: 149.3, lower: 148.1 } },
    notes: 'Breakout trades carry higher risk. Use proper position sizing. Consider waiting for a retest of the breakout level for better entry.',
    notesAr: 'صفقات الاختراق تحمل مخاطرة أعلى. استخدم حجم مركز مناسب. فكر في انتظار إعادة اختبار مستوى الاختراق للحصول على دخول أفضل.',
    tradesAnalyzed: 1890,
    aiModel: 'YuanBridge AI v2.4',
  },
  {
    id: '4',
    title: 'AUD/USD Support Bounce',
    titleAr: 'ارتداد الدعم للاسترالي مقابل الدولار',
    currencyPair: 'AUD/USD',
    direction: 'BUY',
    entryPrice: 0.65200,
    stopLoss: 0.64800,
    takeProfit1: 0.65800,
    takeProfit2: 0.66200,
    risk: 'Low',
    confidence: 91,
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    summary: 'Strong support level holding with bullish hammer pattern. High probability bounce setup.',
    summaryAr: 'مستوى دعم قوي متماسك مع نمط المطرقة الصاعدة. إعداد ارتداد عالي الاحتمال.',
    isPremium: true,
    technicalAnalysis: 'Bullish hammer pattern formed at a key support level that has held multiple times. RSI is at 45, rising from oversold territory. MACD is showing early signs of a bullish crossover. Price is respecting the upward trendline from the recent swing low. Volume spiked during the hammer formation, indicating institutional interest.',
    technicalAnalysisAr: 'تشكل نمط مطرقة صاعد عند مستوى دعم رئيسي صمد عدة مرات. مؤشر RSI عند 45، مرتفعاً من منطقة ذروة البيع. يظهر MACD علامات مبكرة على تقاطع صاعد. السعر يحترم خط الاتجاه الصاعد من أدنى مستوى تأرجح حديث. ارتفع الحجم أثناء تشكل المطرقة، مما يشير إلى اهتمام مؤسسي.',
    fundamentalAnalysis: 'RBA minutes revealed a hawkish tone regarding inflation. Australian employment data exceeded expectations. Iron ore prices are stabilizing, supporting the Aussie. US Dollar faces headwinds from potential rate cuts.',
    fundamentalAnalysisAr: 'كشف محضر اجتماع البنك الاحتياطي الأسترالي عن نبرة متشددة بشأن التضخم. تجاوزت بيانات التوظيف الأسترالية التوقعات. أسعار خام الحديد تستقر، مما يدعم الدولار الأسترالي. الدولار الأمريكي يواجه رياحاً معاكسة من تخفيضات محتملة في أسعار الفائدة.',
    trend: 'Bullish',
    support: [0.64800, 0.64500, 0.64000],
    resistance: [0.65800, 0.66200, 0.66800],
    indicators: { rsi: 45, macd: 'Neutral', ema: 'Bullish', sma: 'Above SMA50', atr: 0.0012, bollingerBands: { upper: 0.660, middle: 0.652, lower: 0.644 } },
    notes: 'Low risk setup with clear invalidation level. Scale in on dips toward support. Book 50% at TP1 and let the rest run to TP2.',
    notesAr: 'إعداد منخفض المخاطرة مع مستوى إلغاء واضح. ادخل تدريجياً عند الانخفاضات نحو الدعم. اغلق 50% عند TP1 واترك الباقي إلى TP2.',
    tradesAnalyzed: 4156,
    aiModel: 'YuanBridge AI v2.4',
  },
  {
    id: '5',
    title: 'USD/CAD Bearish Continuation',
    titleAr: 'استمرارية هابطة للدولار مقابل الكندي',
    currencyPair: 'USD/CAD',
    direction: 'SELL',
    entryPrice: 1.35800,
    stopLoss: 1.36300,
    takeProfit1: 1.35100,
    takeProfit2: 1.34600,
    risk: 'Medium',
    confidence: 79,
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    summary: 'Trendline resistance held with bearish divergence on RSI. Continuation pattern forming.',
    summaryAr: 'مقاومة خط الاتجاه صمدت مع تباعد هابط على RSI. نمط استمرارية يتشكل.',
    isPremium: false,
    technicalAnalysis: 'Price rejected from the descending trendline resistance for the third time. RSI bearish divergence is confirmed on the 4H timeframe. MACD is bearish and below the signal line. Price is trading below both EMA50 and SMA50. The descending channel remains intact with lower highs and lower lows.',
    technicalAnalysisAr: 'تم رفض السعر من مقاومة خط الاتجاه الهابط للمرة الثالثة. تم تأكيد التباعد الهابط لمؤشر RSI على الإطار الزمني 4 ساعات. MACD هابط وأسفل خط الإشارة. السعر يتداول أسفل كل من EMA50 و SMA50. القناة الهابطة لا تزال سليمة مع قمم أدنى وقيعان أدنى.',
    fundamentalAnalysis: 'Oil prices rallying supports the Canadian Dollar. Bank of Canada expected to hold rates steady. US economic data showing mixed signals. CAD strengthened on better-than-expected retail sales data.',
    fundamentalAnalysisAr: 'ارتفاع أسعار النفط يدعم الدولار الكندي. من المتوقع أن يبقي بنك كندا على أسعار الفائدة دون تغيير. البيانات الاقتصادية الأمريكية تظهر إشارات متباينة. قوة الدولار الكندي بعد بيانات مبيعات التجزئة الأفضل من المتوقع.',
    trend: 'Bearish',
    support: [1.35100, 1.34600, 1.34000],
    resistance: [1.36300, 1.36700, 1.37200],
    indicators: { rsi: 38, macd: 'Bearish', ema: 'Bearish', sma: 'Below SMA50', atr: 0.0016, bollingerBands: { upper: 1.365, middle: 1.358, lower: 1.351 } },
    notes: 'Trend-following setup with good risk-reward. Entry on retest of resistance or breakdown of support. Monitor oil prices for additional confirmation.',
    notesAr: 'إعداد متبع للاتجاه مع مخاطرة-عائد جيدة. الدخول عند إعادة اختبار المقاومة أو كسر الدعم. راقب أسعار النفط للحصول على تأكيد إضافي.',
    tradesAnalyzed: 2245,
    aiModel: 'YuanBridge AI v2.4',
  },
  {
    id: '6',
    title: 'NZD/USD Double Bottom',
    titleAr: 'قاع مزدوج للنيوزيلندي مقابل الدولار',
    currencyPair: 'NZD/USD',
    direction: 'BUY',
    entryPrice: 0.60900,
    stopLoss: 0.60400,
    takeProfit1: 0.61550,
    takeProfit2: 0.62000,
    risk: 'Low',
    confidence: 85,
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    summary: 'Double bottom pattern confirmed with bullish RSI divergence. Strong reversal setup.',
    summaryAr: 'تم تأكيد نمط القاع المزدوج مع تباعد صاعد لمؤشر RSI. إعداد انعكاس قوي.',
    isPremium: true,
    technicalAnalysis: 'Clear double bottom pattern formed on the daily chart with the second bottom showing bullish RSI divergence. Neckline resistance at 0.61200. MACD is about to cross above the signal line. Volume is increasing on the bounce. Price broke above the 20-day moving average. Bullish harami candle pattern provides additional confirmation.',
    technicalAnalysisAr: 'تشكل نمط قاع مزدوج واضح على الرسم البياني اليومي مع القاع الثاني يظهر تباعداً صاعداً لمؤشر RSI. مقاومة خط العنق عند 0.61200. MACD على وشك التقاطع فوق خط الإشارة. الحجم يتزايد عند الارتداد. اخترق السعر فوق المتوسط المتحرك لـ 20 يوماً. نمط الشمعة الهرامي الصاعد يوفر تأكيداً إضافياً.',
    fundamentalAnalysis: 'RBNZ signaled potential rate hikes if inflation persists. New Zealand dairy prices remain strong. Chinese economic stimulus measures support NZD. Global risk appetite improving.',
    fundamentalAnalysisAr: 'البنك الاحتياطي النيوزيلندي أشار إلى زيادات محتملة في أسعار الفائدة إذا استمر التضخم. أسعار الألبان النيوزيلندية تظل قوية. إجراءات التحفيز الاقتصادي الصينية تدعم الدولار النيوزيلندي. شهية المخاطرة العالمية تتحسن.',
    trend: 'Bullish',
    support: [0.60400, 0.60000, 0.59500],
    resistance: [0.61550, 0.62000, 0.62500],
    indicators: { rsi: 52, macd: 'Neutral', ema: 'Bullish', sma: 'Above SMA50', atr: 0.0014, bollingerBands: { upper: 0.618, middle: 0.609, lower: 0.600 } },
    notes: 'Classic reversal pattern with high probability. Entry above neckline confirmation. Strong risk-reward ratio of 1:3.',
    notesAr: 'نمط انعكاس كلاسيكي باحتمالية عالية. الدخول بعد تأكيد اختراق خط العنق. نسبة مخاطرة-عائد قوية تبلغ 1:3.',
    tradesAnalyzed: 3120,
    aiModel: 'YuanBridge AI v2.4',
  },
  {
    id: '7',
    title: 'EUR/GBP Bearish Breakdown',
    titleAr: 'انهيار هابط لليورو مقابل الجنيه',
    currencyPair: 'EUR/GBP',
    direction: 'SELL',
    entryPrice: 0.85700,
    stopLoss: 0.86100,
    takeProfit1: 0.85200,
    takeProfit2: 0.84800,
    risk: 'High',
    confidence: 73,
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
    summary: 'Breakdown below support with bearish flag continuation. Momentum favors sellers.',
    summaryAr: 'انهيار أدنى الدعم مع استمرارية العلم الهابط. الزخم لصالح البائعين.',
    isPremium: false,
    technicalAnalysis: 'Price broke below a key support level that held for six weeks. Bearish flag pattern on the 4H chart suggests continuation. RSI is at 35 and declining. MACD bearish crossover confirmed with increasing histogram. EMA9 crossed below EMA21. ATR is elevated, indicating increased selling pressure.',
    technicalAnalysisAr: 'اخترق السعر أدنى مستوى دعم رئيسي صمد لمدة ستة أسابيع. نمط العلم الهابط على الرسم البياني 4 ساعات يشير إلى الاستمرارية. RSI عند 35 وفي انخفاض. تأكيد تقاطع هابط لـ MACD مع زيادة الرسم البياني. تقاطع EMA9 أدنى EMA21. ATR مرتفع، مما يشير إلى زيادة ضغط البيع.',
    fundamentalAnalysis: 'Eurozone economic data continues to disappoint. ECB dovish stance contrasts with BoE cautious approach. Political instability in France adds pressure on the Euro. UK services sector showing resilience.',
    fundamentalAnalysisAr: 'البيانات الاقتصادية في منطقة اليورو تواصل خيبة الأمل. موقف البنك المركزي الأوروبي المتساهل يتناقض مع نهج بنك إنجلترا الحذر. عدم الاستقرار السياسي في فرنسا يضيف ضغطاً على اليورو. قطاع الخدمات في المملكة المتحدة يظهر مرونة.',
    trend: 'Bearish',
    support: [0.85200, 0.84800, 0.84200],
    resistance: [0.86100, 0.86500, 0.87000],
    indicators: { rsi: 35, macd: 'Bearish', ema: 'Bearish', sma: 'Below SMA50', atr: 0.0009, bollingerBands: { upper: 0.862, middle: 0.857, lower: 0.852 } },
    notes: 'High risk due to potential fakeout. Wait for daily close below support. Use smaller position size. Consider 1:2 risk-reward minimum.',
    notesAr: 'مخاطرة عالية بسبب احتمالية الاختراق الكاذب. انتظر إغلاق يومي أدنى الدعم. استخدم حجم مركز أصغر. فكر في نسبة مخاطرة-عائد 1:2 كحد أدنى.',
    tradesAnalyzed: 1578,
    aiModel: 'YuanBridge AI v2.5',
  },
  {
    id: '8',
    title: 'USD/CHF Trend Continuation',
    titleAr: 'استمرارية اتجاه الدولار مقابل الفرنك',
    currencyPair: 'USD/CHF',
    direction: 'BUY',
    entryPrice: 0.89300,
    stopLoss: 0.88800,
    takeProfit1: 0.89900,
    takeProfit2: 0.90400,
    risk: 'Low',
    confidence: 88,
    publishedAt: new Date(Date.now() - 25200000).toISOString(),
    summary: 'Strong uptrend with pullback to EMA50 support. Perfect trend continuation setup.',
    summaryAr: 'اتجاه صاعد قوي مع تراجع إلى دعم EMA50. إعداد استمرارية اتجاه مثالي.',
    isPremium: true,
    technicalAnalysis: 'Price pulled back to the EMA50 support level and bounced sharply. Uptrend remains intact with higher highs and higher lows. RSI reset from overbought to neutral zone at 55, providing room for further upside. MACD bullish structure preserved. Bollinger Bands middle line acted as support. Bullish piercing candle confirmed the bounce.',
    technicalAnalysisAr: 'تراجع السعر إلى مستوى دعم EMA50 وارتد بحدة. الاتجاه الصاعد لا يزال سليماً مع قمم أعلى وقيعان أعلى. إعادة تعيين RSI من منطقة ذروة الشراء إلى المنطقة المحايدة عند 55، مما يوفر مساحة لمزيد من الصعود. هيكل MACD الصاعد محفوظ. خط منتصف بولينجر باند عمل كدعم. شمعة الاختراق الصاعدة أكدت الارتداد.',
    fundamentalAnalysis: 'Swiss National Bank maintains accommodative policy. US economic outperformance continues to attract capital flows. Safe-haven demand for USD remains strong amid global uncertainties. SNB intervention risks limited at current levels.',
    fundamentalAnalysisAr: 'البنك الوطني السويسري يحافظ على سياسة تيسيرية. الأداء الاقتصادي الأمريكي المتفوق يواصل جذب تدفقات رأس المال. الطلب على الدولار كملاذ آمن يظل قوياً وسط حالة عدم اليقين العالمية. مخاطر تدخل البنك الوطني السويسري محدودة عند المستويات الحالية.',
    trend: 'Bullish',
    support: [0.88800, 0.88500, 0.88000],
    resistance: [0.89900, 0.90400, 0.91000],
    indicators: { rsi: 55, macd: 'Bullish', ema: 'Bullish', sma: 'Above SMA50', atr: 0.0013, bollingerBands: { upper: 0.902, middle: 0.893, lower: 0.884 } },
    notes: 'Trend pullback setup with clear risk level. Entry at EMA50 bounce zone. Trail stop to breakeven after TP1 is hit.',
    notesAr: 'إعداد تراجع اتجاهي مع مستوى مخاطرة واضح. الدخول عند منطقة ارتداد EMA50. تابع وقف الخسارة إلى نقطة التعادل بعد الوصول إلى TP1.',
    tradesAnalyzed: 3640,
    aiModel: 'YuanBridge AI v2.5',
  },
  {
    id: '9',
    title: 'GBP/JPY Momentum Trade',
    titleAr: 'صفقة زخم للجنيه مقابل الين',
    currencyPair: 'GBP/JPY',
    direction: 'BUY',
    entryPrice: 188.500,
    stopLoss: 187.200,
    takeProfit1: 190.000,
    takeProfit2: 191.200,
    risk: 'High',
    confidence: 77,
    publishedAt: new Date(Date.now() - 28800000).toISOString(),
    summary: 'Strong momentum breakout with high volatility. Trend following setup on the 1H chart.',
    summaryAr: 'اختراق زخم قوي مع تقلبات عالية. إعداد متبع للاتجاه على الرسم البياني 1 ساعة.',
    isPremium: false,
    technicalAnalysis: 'Explosive breakout from a consolidation pattern with the highest volume in 20 days. RSI is at 65 and rising. MACD bullish crossover with expanding histogram. Price is trading above all major moving averages. ATR has increased by 30% indicating strong momentum. No bearish divergences detected.',
    technicalAnalysisAr: 'اختراق انفجاري من نمط تماسك بأعلى حجم في 20 يوماً. RSI عند 65 وفي ارتفاع. تقاطع صاعد لـ MACD مع توسع الرسم البياني. السعر يتداول فوق جميع المتوسطات المتحركة الرئيسية. زاد ATR بنسبة 30% مما يشير إلى زخم قوي. لم يتم اكتشاف أي تباعد هابط.',
    fundamentalAnalysis: 'UK economic outlook improving with better GDP data. Japan maintains ultra-low rates, widening the rate gap. Carry trade demand supporting GBP/JPY. Global equity markets rallying boosts risk appetite.',
    fundamentalAnalysisAr: 'النظرة الاقتصادية للمملكة المتحدة تتحسن مع بيانات ناتج محلي إجمالي أفضل. اليابان تحافظ على أسعار فائدة منخفضة للغاية، مما يوسع فجوة الأسعار. الطلب على تجارة المناقلة يدعم الجنيه مقابل الين. ارتفاع أسواق الأسهم العالمية يعزز شهية المخاطرة.',
    trend: 'Bullish',
    support: [187.200, 186.500, 185.800],
    resistance: [190.000, 191.200, 192.500],
    indicators: { rsi: 65, macd: 'Bullish', ema: 'Bullish', sma: 'Above SMA50', atr: 0.85, bollingerBands: { upper: 190.8, middle: 188.5, lower: 186.2 } },
    notes: 'High volatility pair requires wider stops. Use reduced position size. Consider partial profit taking at TP1 due to potential sharp reversals.',
    notesAr: 'زوج عالي التقلب يتطلب وقف خسارة أوسع. استخدم حجم مركز مخفض. فكر في جني أرباح جزئية عند TP1 بسبب احتمالية الانعكاسات الحادة.',
    tradesAnalyzed: 2100,
    aiModel: 'YuanBridge AI v2.5',
  },
  {
    id: '10',
    title: 'EUR/JPY Consolidation Breakout',
    titleAr: 'انفراج تماسك لليورو مقابل الين',
    currencyPair: 'EUR/JPY',
    direction: 'BUY',
    entryPrice: 162.800,
    stopLoss: 161.800,
    takeProfit1: 164.000,
    takeProfit2: 165.000,
    risk: 'Medium',
    confidence: 81,
    publishedAt: new Date(Date.now() - 32400000).toISOString(),
    summary: 'Breaking out of a 2-week consolidation range with increasing momentum.',
    summaryAr: 'اختراق نطاق تماسك لمدة أسبوعين مع زيادة الزخم.',
    isPremium: false,
    technicalAnalysis: 'Price consolidated in a tight range for 14 days before breaking to the upside. Bullish pennant pattern completed. RSI broke above 60 for the first time in the consolidation period. MACD bullish crossover on the daily chart. Volume confirmation on the breakout candle. Support turned resistance levels are aligned with the target zones.',
    technicalAnalysisAr: 'تماسك السعر في نطاق ضيق لمدة 14 يوماً قبل الاختراق الصاعد. اكتمل نمط الراية الصاعدة. اخترق RSI فوق 60 لأول مرة في فترة التماسك. تقاطع صاعد لـ MACD على الرسم البياني اليومي. تأكيد الحجم على شمعة الاختراق. مستويات الدعم التي تحولت إلى مقاومة تتماشى مع مناطق الهدف.',
    fundamentalAnalysis: 'Eurozone inflation data supports ECB hawkish stance. Japanese Yen continues to weaken on policy divergence. Cross-border M&A flows supporting EUR/JPY. Technical breakout aligns with fundamental backdrop.',
    fundamentalAnalysisAr: 'بيانات التضخم في منطقة اليورو تدعم موقف البنك المركزي الأوروبي المتشدد. الين الياباني يستمر في الضعف بسبب تباعد السياسات. تدفقات الاندماج والاستحواذ عبر الحدود تدعم اليورو مقابل الين. الاختراق الفني يتماشى مع الخلفية الأساسية.',
    trend: 'Bullish',
    support: [161.800, 161.200, 160.500],
    resistance: [164.000, 165.000, 166.200],
    indicators: { rsi: 61, macd: 'Bullish', ema: 'Bullish', sma: 'Above SMA50', atr: 0.55, bollingerBands: { upper: 164.5, middle: 162.8, lower: 161.1 } },
    notes: 'Breakout from consolidation has good probability. Entry on retest of breakout level preferred. Use TP1 as 50% partial profit target.',
    notesAr: 'الاختراق من التماسك لديه احتمالية جيدة. الدخول عند إعادة اختبار مستوى الاختراق مفضل. استخدم TP1 كهدف ربح جزئي 50%.',
    tradesAnalyzed: 2780,
    aiModel: 'YuanBridge AI v2.4',
  },
];

const CURRENCY_PAIRS = ['All', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'USD/CHF', 'GBP/JPY', 'EUR/JPY'];
const RISK_LEVELS = ['All', 'Low', 'Medium', 'High'] as const;
const SORT_OPTIONS = ['newest', 'oldest', 'highest_confidence', 'lowest_confidence'] as const;

const ITEMS_PER_PAGE = 6;

function RiskBadge({ risk }: { risk: string }) {
  const color = risk === 'Low' ? 'text-success border-success/30 bg-success/5' :
    risk === 'Medium' ? 'text-warning border-warning/30 bg-warning/5' :
    'text-danger border-danger/30 bg-danger/5';
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${color}`}>
      {risk}
    </span>
  );
}

function DirectionBadge({ direction }: { direction: 'BUY' | 'SELL' }) {
  const { t } = useLanguage();
  const isBuy = direction === 'BUY';
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
      isBuy ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
    }`}>
      {isBuy ? t('latest.buy') : t('latest.sell')}
    </span>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-accent-500/20 text-accent-500 border border-accent-500/40 shadow-lg shadow-accent-500/5'
          : 'glass text-text-muted border border-border hover:border-border-light hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

function SelectInput({ value, onChange, options, className = '' }: { value: string; onChange: (v: string) => void; options: readonly string[]; className?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input-field text-sm appearance-none cursor-pointer ${className}`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function StrategyCard({ strategy, index }: { strategy: Strategy; index: number }) {
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';

  return (
    <motion.a
      href={`/${lang}/strategies/${strategy.id}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl p-5 group block"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-accent-500 font-bold text-sm tracking-wider">{strategy.currencyPair}</span>
        <DirectionBadge direction={strategy.direction} />
      </div>

      <h3 className="text-text font-semibold text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
        {isRTL ? strategy.titleAr : strategy.title}
      </h3>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-text-dim">{t('latest.entry')}:</span>
          <span className="text-text font-medium">{strategy.entryPrice}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-text-dim">{t('latest.sl')}:</span>
          <span className="text-danger font-medium">{strategy.stopLoss}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-text-dim">{t('latest.tp1')}:</span>
          <span className="text-success font-medium">{strategy.takeProfit1}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-text-dim">{t('latest.tp2')}:</span>
          <span className="text-success font-medium">{strategy.takeProfit2}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <RiskBadge risk={strategy.risk} />
        <div className="text-xs">
          <span className="text-text-dim">{t('latest.confidence')}: </span>
          <span className="font-bold gradient-text">{strategy.confidence}%</span>
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-surface-lighter mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full chart-bar"
          initial={{ width: 0 }}
          animate={{ width: `${strategy.confidence}%` }}
          transition={{ duration: 1, delay: index * 0.08, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-text-dim">
          {new Date(strategy.publishedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {strategy.isPremium && (
          <span className="flex items-center gap-1 text-accent-500 font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t('pricing.premium')}
          </span>
        )}
      </div>
    </motion.a>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-20 rounded bg-surface-lighter" />
        <div className="h-5 w-12 rounded-lg bg-surface-lighter" />
      </div>
      <div className="h-4 w-3/4 rounded bg-surface-lighter mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3 w-full rounded bg-surface-lighter" />
        ))}
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-16 rounded bg-surface-lighter" />
        <div className="h-4 w-20 rounded bg-surface-lighter" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-surface-lighter mb-4" />
      <div className="h-3 w-24 rounded bg-surface-lighter" />
    </div>
  );
}

function Pagination({ current, total, onPage }: { current: number; total: number; onPage: (n: number) => void }) {
  if (total <= 1) return null;
  const pages: (number | string)[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPage(current - 1)}
        disabled={current === 1}
        className="w-10 h-10 rounded-xl glass border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-border-light transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`ellipsis-${i}`} className="w-10 text-center text-text-dim text-sm">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
              p === current
                ? 'bg-accent-500/20 text-accent-500 border border-accent-500/40'
                : 'glass border border-border text-text-muted hover:text-text hover:border-border-light'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPage(current + 1)}
        disabled={current === total}
        className="w-10 h-10 rounded-xl glass border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-border-light transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default function StrategiesPage() {
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [directionFilter, setDirectionFilter] = useState<'All' | 'BUY' | 'SELL'>('All');
  const [premiumFilter, setPremiumFilter] = useState<'All' | 'Premium' | 'Free'>('All');
  const [currencyPair, setCurrencyPair] = useState('All');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<string>('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    let result = [...allMockStrategies];

    if (directionFilter !== 'All') {
      result = result.filter((s) => s.direction === directionFilter);
    }
    if (premiumFilter === 'Premium') {
      result = result.filter((s) => s.isPremium);
    } else if (premiumFilter === 'Free') {
      result = result.filter((s) => !s.isPremium);
    }
    if (currencyPair !== 'All') {
      result = result.filter((s) => s.currencyPair === currencyPair);
    }
    if (riskFilter !== 'All') {
      result = result.filter((s) => s.risk === riskFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.titleAr.includes(q) ||
          s.currencyPair.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.summaryAr.includes(q)
      );
    }

    switch (sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        break;
      case 'highest_confidence':
        result.sort((a, b) => b.confidence - a.confidence);
        break;
      case 'lowest_confidence':
        result.sort((a, b) => a.confidence - b.confidence);
        break;
    }

    return result;
  }, [directionFilter, premiumFilter, currencyPair, riskFilter, search, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [directionFilter, premiumFilter, currencyPair, riskFilter, search, sort]);

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-16 relative">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />

      <div className="container-custom relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">{t('strategies.title')}</h1>
          <p className="text-text-muted max-w-2xl mx-auto text-lg">{t('strategies.subtitle')}</p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 md:p-6 mb-8 border border-border"
        >
          {/* Direction + Premium Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <FilterButton active={directionFilter === 'All'} onClick={() => setDirectionFilter('All')}>
              {t('strategies.filterAll')}
            </FilterButton>
            <FilterButton active={directionFilter === 'BUY'} onClick={() => setDirectionFilter('BUY')}>
              {t('strategies.filterBuy')}
            </FilterButton>
            <FilterButton active={directionFilter === 'SELL'} onClick={() => setDirectionFilter('SELL')}>
              {t('strategies.filterSell')}
            </FilterButton>
            <span className="w-px h-6 bg-border mx-2 hidden sm:block" />
            <FilterButton active={premiumFilter === 'Premium'} onClick={() => setPremiumFilter('Premium')}>
              {t('strategies.filterPremium')}
            </FilterButton>
            <FilterButton active={premiumFilter === 'Free'} onClick={() => setPremiumFilter('Free')}>
              {t('strategies.filterFree')}
            </FilterButton>
          </div>

          {/* Selects + Search + Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SelectInput value={currencyPair} onChange={(v) => setCurrencyPair(v)} options={CURRENCY_PAIRS} />

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as 'All' | 'Low' | 'Medium' | 'High')}
              className="input-field text-sm appearance-none cursor-pointer"
            >
              {RISK_LEVELS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'All' ? t('strategies.filterAll') : t(`strategies.filter${opt}Risk` as any)}
                </option>
              ))}
            </select>

            <div className="relative">
              <svg className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim ${isRTL ? 'right-3' : 'left-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('strategies.search')}
                className={`input-field text-sm ${isRTL ? 'pr-10' : 'pl-10'}`}
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field text-sm appearance-none cursor-pointer"
            >
              <option value="newest">{t('strategies.sortNewest')}</option>
              <option value="oldest">{t('strategies.sortOldest')}</option>
              <option value="highest_confidence">{t('strategies.sortHighestConfidence')}</option>
              <option value="lowest_confidence">{t('strategies.sortLowestConfidence')}</option>
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && paginated.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-12 text-center border border-border"
          >
            <svg className="w-16 h-16 text-text-dim mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-text-muted text-lg">{t('strategies.noResults')}</p>
          </motion.div>
        )}

        {/* Grid */}
        {!loading && paginated.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {paginated.map((strategy, i) => (
                <StrategyCard key={strategy.id} strategy={strategy} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination current={page} total={totalPages} onPage={setPage} />
        )}

        {/* Results Count */}
        {!loading && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-6 text-text-dim text-sm"
          >
            {filtered.length} {t('common.status')}
          </motion.div>
        )}
      </div>
    </div>
  );
}
