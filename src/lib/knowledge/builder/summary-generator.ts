import type { TradingRules } from '@/lib/knowledge/types'

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function rulesToBullets(rules: TradingRules): string {
  const parts: string[] = []

  if (rules.entryConditions.length > 0) {
    parts.push(`Entry: ${rules.entryConditions.slice(0, 3).join('; ')}`)
  }
  if (rules.exitConditions.length > 0) {
    parts.push(`Exit: ${rules.exitConditions.slice(0, 3).join('; ')}`)
  }
  if (rules.stopLossRules.length > 0) {
    parts.push(`Stop Loss: ${rules.stopLossRules.slice(0, 2).join('; ')}`)
  }
  if (rules.positionSizing.length > 0) {
    parts.push(`Sizing: ${rules.positionSizing.slice(0, 2).join('; ')}`)
  }
  if (rules.indicators.length > 0) {
    parts.push(`Indicators: ${rules.indicators.join(', ')}`)
  }
  if (rules.timeframes.length > 0) {
    parts.push(`Timeframes: ${rules.timeframes.join(', ')}`)
  }
  if (rules.marketCondition.length > 0) {
    parts.push(`Market: ${rules.marketCondition.join(', ')}`)
  }

  return parts.join('. ')
}

function rulesToBulletsAr(rules: TradingRules): string {
  const parts: string[] = []

  if (rules.entryConditions.length > 0) {
    parts.push(`الدخول: ${rules.entryConditions.slice(0, 3).join('; ')}`)
  }
  if (rules.exitConditions.length > 0) {
    parts.push(`الخروج: ${rules.exitConditions.slice(0, 3).join('; ')}`)
  }
  if (rules.stopLossRules.length > 0) {
    parts.push(`وقف الخسارة: ${rules.stopLossRules.slice(0, 2).join('; ')}`)
  }
  if (rules.positionSizing.length > 0) {
    parts.push(`حجم الصفقة: ${rules.positionSizing.slice(0, 2).join('; ')}`)
  }
  if (rules.indicators.length > 0) {
    parts.push(`المؤشرات: ${rules.indicators.join('، ')}`)
  }
  if (rules.timeframes.length > 0) {
    parts.push(`الأطر الزمنية: ${rules.timeframes.join('، ')}`)
  }
  if (rules.marketCondition.length > 0) {
    parts.push(`السوق: ${rules.marketCondition.join('، ')}`)
  }

  return parts.join('. ')
}

const DIRECTION_EN: Record<string, string> = { BUY: 'Buy', SELL: 'Sell' }
const DIRECTION_AR: Record<string, string> = { BUY: 'شراء', SELL: 'بيع' }

export function generateSummary(
  rules: TradingRules,
  direction: string,
  pair: string,
): string {
  const dir = DIRECTION_EN[direction] ?? direction
  const rulesSummary = rulesToBullets(rules)

  const sentences: string[] = [
    `${dir} signal detected on ${pair}.`,
  ]

  if (rulesSummary) {
    sentences.push(rulesSummary)
  }

  if (rules.entryConditions.length > 0) {
    sentences.push(`Look for ${rules.entryConditions[0].toLowerCase()} to confirm.`)
  }

  if (rules.stopLossRules.length > 0) {
    sentences.push(`Protect capital with ${rules.stopLossRules[0].toLowerCase()}.`)
  }

  if (rules.riskLevel && rules.riskLevel !== 'medium') {
    sentences.push(`Risk level: ${capitalize(rules.riskLevel)}.`)
  }

  return sentences.join(' ')
}

export function generateArabicSummary(
  rules: TradingRules,
  direction: string,
  pair: string,
): string {
  const dir = DIRECTION_AR[direction] ?? direction
  const rulesSummary = rulesToBulletsAr(rules)

  const sentences: string[] = [
    `إشارة ${dir} على زوج ${pair}.`,
  ]

  if (rulesSummary) {
    sentences.push(rulesSummary)
  }

  if (rules.entryConditions.length > 0) {
    sentences.push(`ابحث عن ${rules.entryConditions[0].toLowerCase()} للتأكيد.`)
  }

  if (rules.stopLossRules.length > 0) {
    sentences.push(`احم رأس مالك باستخدام ${rules.stopLossRules[0].toLowerCase()}.`)
  }

  if (rules.riskLevel && rules.riskLevel !== 'medium') {
    const riskAr: Record<string, string> = { low: 'منخفض', high: 'مرتفع' }
    sentences.push(`مستوى المخاطرة: ${riskAr[rules.riskLevel] ?? rules.riskLevel}.`)
  }

  return sentences.join(' ')
}

export function generateTechnicalAnalysis(rules: TradingRules): string {
  const parts: string[] = [
    'Technical Analysis:',
  ]

  if (rules.indicators.length > 0) {
    const indicatorAnalysis = rules.indicators.map((ind) => {
      if (ind === 'RSI') return 'RSI is being monitored for overbought/oversold conditions'
      if (ind === 'MACD') return 'MACD is showing potential momentum shifts'
      if (ind === 'Bollinger Bands') return 'Bollinger Bands indicate volatility levels'
      if (ind === 'Fibonacci') return 'Fibonacci levels provide key support/resistance zones'
      if (ind === 'EMA' || ind === 'SMA') return `${ind} is used to identify trend direction`
      return `${ind} is part of the analysis framework`
    })
    parts.push(...indicatorAnalysis)
  }

  if (rules.marketCondition.length > 0) {
    parts.push(`Market conditions suggest a ${rules.marketCondition.join('/')} environment.`)
  }

  if (rules.timeframes.length > 0) {
    parts.push(`Analysis is based on ${rules.timeframes.join('/')} timeframe${rules.timeframes.length > 1 ? 's' : ''}.`)
  }

  return parts.join(' ')
}

export function generateFundamentalAnalysis(pair: string): string {
  const base = pair.split('/')[0]
  const quote = pair.split('/')[1]

  if (!base || !quote) return 'Fundamental analysis available upon deeper market review.'

  const centralBanks: Record<string, string> = {
    USD: 'Federal Reserve (Fed)',
    EUR: 'European Central Bank (ECB)',
    GBP: 'Bank of England (BoE)',
    JPY: 'Bank of Japan (BoJ)',
    CHF: 'Swiss National Bank (SNB)',
    CAD: 'Bank of Canada (BoC)',
    AUD: 'Reserve Bank of Australia (RBA)',
    NZD: 'Reserve Bank of New Zealand (RBNZ)',
  }

  const cbBase = centralBanks[base]
  const cbQuote = centralBanks[quote]

  const sentences: string[] = [
    `Fundamental analysis for ${pair}:`,
  ]

  if (cbBase) {
    sentences.push(`${cbBase} monetary policy decisions impact ${base} strength.`)
  }
  if (cbQuote) {
    sentences.push(`${cbQuote} policy stance influences ${quote} valuation.`)
  }

  const commodityCurrencies: Record<string, string> = {
    AUD: 'commodity prices (iron ore, coal)',
    CAD: 'oil prices',
    NZD: 'dairy prices',
    NOK: 'oil prices',
  }

  if (commodityCurrencies[base]) {
    sentences.push(`Watch ${commodityCurrencies[base]} for ${base} direction.`)
  }
  if (commodityCurrencies[quote]) {
    sentences.push(`${quote} is sensitive to ${commodityCurrencies[quote]}.`)
  }

  sentences.push('Monitor economic calendars for key data releases affecting this pair.')

  return sentences.join(' ')
}
