'use client';

import { useMemo, useState, use } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import type { Strategy } from '@/lib/types';

const mockStrategies: Strategy[] = [
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

function DirectionBadge({ direction }: { direction: 'BUY' | 'SELL' }) {
  const { t } = useLanguage();
  const isBuy = direction === 'BUY';
  return (
    <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${
      isBuy ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
    }`}>
      {isBuy ? t('latest.buy') : t('latest.sell')}
    </span>
  );
}

function TrendBadge({ trend }: { trend: 'Bullish' | 'Bearish' | 'Neutral' }) {
  const color = trend === 'Bullish' ? 'text-success border-success/30 bg-success/5' :
    trend === 'Bearish' ? 'text-danger border-danger/30 bg-danger/5' :
    'text-warning border-warning/30 bg-warning/5';
  const icon = trend === 'Bullish' ? (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ) : trend === 'Bearish' ? (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${color}`}>
      {icon}
      {trend}
    </span>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const color = risk === 'Low' ? 'text-success border-success/30 bg-success/5' :
    risk === 'Medium' ? 'text-warning border-warning/30 bg-warning/5' :
    'text-danger border-danger/30 bg-danger/5';
  return (
    <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${color}`}>
      {risk}
    </span>
  );
}

function ConfidenceGauge({ value }: { value: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 85 ? '#00c853' : value >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-3xl font-bold gradient-text"
        >
          {value}%
        </motion.span>
        <span className="text-text-dim text-xs mt-0.5">AI Score</span>
      </div>
    </div>
  );
}

function SectionCard({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card rounded-2xl p-5 md:p-6"
    >
      <h3 className="text-text font-semibold text-base mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-accent-500" />
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function PriceLevelBar({ label, price, color }: { label: string; price: number; color: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-text-dim text-xs w-20 shrink-0">{label}</span>
      <div className="flex-1 h-8 rounded-lg bg-surface-lighter/50 relative overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-lg ${color}`}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <span className="absolute inset-0 flex items-center px-3 text-xs font-medium text-text">
          {price}
        </span>
      </div>
    </div>
  );
}

function IndicatorCard({ name, value, status }: { name: string; value: string | number; status?: 'Bullish' | 'Bearish' | 'Neutral' | string }) {
  const statusColor = status === 'Bullish' ? 'text-success' :
    status === 'Bearish' ? 'text-danger' :
    status === 'Neutral' ? 'text-warning' : 'text-text';

  return (
    <div className="glass rounded-xl p-4 border border-border">
      <div className="text-text-dim text-xs mb-1">{name}</div>
      <div className="text-text font-semibold text-base">{value}</div>
      {status && (
        <div className={`text-xs font-medium mt-1 ${statusColor}`}>{status}</div>
      )}
    </div>
  );
}

function SectionDivider() {
  return <div className="h-px bg-border my-2" />;
}

export default function StrategyDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';

  const { id } = use(params);

  const strategy = useMemo(() => {
    return mockStrategies.find((s) => s.id === id) ?? null;
  }, [id]);

  if (!strategy) {
    return (
      <div className="min-h-screen pt-24 md:pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-text-dim mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-text-muted mb-6">{t('common.noData')}</p>
          <Button variant="secondary" href={`/${lang}/strategies`}>{t('detail.back')}</Button>
        </div>
      </div>
    );
  }

  const title = isRTL ? strategy.titleAr : strategy.title;
  const summary = isRTL ? strategy.summaryAr : strategy.summary;
  const technicalAnalysis = isRTL ? strategy.technicalAnalysisAr : strategy.technicalAnalysis;
  const fundamentalAnalysis = isRTL ? strategy.fundamentalAnalysisAr : strategy.fundamentalAnalysis;
  const notes = isRTL ? strategy.notesAr : strategy.notes;

  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-16 relative">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />

      <div className="container-custom relative">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <a
            href={`/${lang}/strategies`}
            className="inline-flex items-center gap-2 text-text-muted hover:text-text transition-all text-sm group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('detail.back')}
          </a>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-6 md:p-8 border border-border mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-accent-500 font-bold text-lg tracking-wider">{strategy.currencyPair}</span>
              <DirectionBadge direction={strategy.direction} />
              <TrendBadge trend={strategy.trend} />
            </div>
            {strategy.isPremium && (
              <span className="inline-flex items-center gap-1.5 text-accent-500 text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {t('pricing.premium')}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">{title}</h1>

          <SectionDivider />

          <div className="flex flex-wrap items-center gap-4 text-xs text-text-dim">
            <span>{t('detail.publishedTime')}: {new Date(strategy.publishedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</span>
            <span className="w-px h-4 bg-border" />
            <span>{strategy.aiModel}</span>
            <span className="w-px h-4 bg-border" />
            <span>{strategy.tradesAnalyzed.toLocaleString()} {t('stats.trades')}</span>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                saved
                  ? 'bg-accent-500/20 text-accent-500 border border-accent-500/40'
                  : 'btn-secondary'
              }`}
            >
              <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {saved ? t('common.save') : t('detail.save')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {shared ? t('common.copied') : t('detail.share')}
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary */}
            <SectionCard title={t('detail.aiSummary')} delay={0.1}>
              <p className="text-text/80 text-sm leading-relaxed">{summary}</p>
            </SectionCard>

            {/* Technical Analysis */}
            <SectionCard title={t('detail.technicalAnalysis')} delay={0.15}>
              <p className="text-text/80 text-sm leading-relaxed">{technicalAnalysis}</p>
            </SectionCard>

            {/* Fundamental Analysis */}
            <SectionCard title={t('detail.fundamentalAnalysis')} delay={0.2}>
              <p className="text-text/80 text-sm leading-relaxed">{fundamentalAnalysis}</p>
            </SectionCard>

            {/* Support & Resistance */}
            <SectionCard title={`${t('detail.support')} & ${t('detail.resistance')}`} delay={0.25}>
              <div className="space-y-3">
                <p className="text-text-dim text-xs font-medium mb-2">{t('detail.resistance')}</p>
                {[...strategy.resistance].reverse().map((price, i) => (
                  <PriceLevelBar key={`res-${i}`} label={`R${strategy.resistance.length - i}`} price={price} color="bg-danger/20" />
                ))}
                <div className="h-px bg-border my-3" />
                <p className="text-text-dim text-xs font-medium mb-2">{t('detail.support')}</p>
                {strategy.support.map((price, i) => (
                  <PriceLevelBar key={`sup-${i}`} label={`S${i + 1}`} price={price} color="bg-success/20" />
                ))}
              </div>
            </SectionCard>

            {/* Indicators Grid */}
            <SectionCard title={t('detail.indicators')} delay={0.3}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <IndicatorCard name="RSI (14)" value={strategy.indicators.rsi} status={strategy.indicators.rsi > 60 ? 'Bullish' : strategy.indicators.rsi < 40 ? 'Bearish' : 'Neutral'} />
                <IndicatorCard name="MACD" value={strategy.indicators.macd} status={strategy.indicators.macd} />
                <IndicatorCard name="EMA" value={strategy.indicators.ema} status={strategy.indicators.ema} />
                <IndicatorCard name="SMA" value={strategy.indicators.sma} status={strategy.indicators.sma.includes('Above') ? 'Bullish' : strategy.indicators.sma.includes('Below') ? 'Bearish' : 'Neutral'} />
                <IndicatorCard name="ATR (14)" value={strategy.indicators.atr} />
                <IndicatorCard
                  name="Bollinger Bands"
                  value={`${strategy.indicators.bollingerBands.upper} / ${strategy.indicators.bollingerBands.middle} / ${strategy.indicators.bollingerBands.lower}`}
                />
              </div>
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Confidence */}
            <SectionCard title={t('detail.confidence')} delay={0.1}>
              <ConfidenceGauge value={strategy.confidence} />
              <div className="w-full h-1.5 rounded-full bg-surface-lighter mt-4 overflow-hidden">
                <motion.div
                  className="h-full rounded-full chart-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${strategy.confidence}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </SectionCard>

            {/* Risk Level */}
            <SectionCard title={t('detail.risk')} delay={0.15}>
              <div className="flex items-center justify-center">
                <RiskBadge risk={strategy.risk} />
              </div>
            </SectionCard>

            {/* Trade Setup */}
            <SectionCard title={t('detail.tradeSetup')} delay={0.2}>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-lighter/50">
                  <span className="text-text-dim text-sm">{t('detail.entryPrice')}</span>
                  <span className="text-text font-semibold">{strategy.entryPrice}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-lighter/50">
                  <span className="text-text-dim text-sm">{t('detail.stopLoss')}</span>
                  <span className="text-danger font-semibold">{strategy.stopLoss}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-lighter/50">
                  <span className="text-text-dim text-sm">{t('detail.takeProfit')} 1</span>
                  <span className="text-success font-semibold">{strategy.takeProfit1}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-lighter/50">
                  <span className="text-text-dim text-sm">{t('detail.takeProfit')} 2</span>
                  <span className="text-success font-semibold">{strategy.takeProfit2}</span>
                </div>
              </div>
            </SectionCard>

            {/* Trade Notes */}
            {notes && (
              <SectionCard title={t('detail.tradeNotes')} delay={0.25}>
                <p className="text-text/80 text-sm leading-relaxed">{notes}</p>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
