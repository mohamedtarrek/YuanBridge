const TELEGRAM_API = 'https://api.telegram.org'

function getBotToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1')
}

export async function sendTelegramMessage(
  chatId: string,
  message: string
): Promise<void> {
  const token = getBotToken()
  if (!token) {
    console.warn('[Telegram] Bot token not configured, skipping message')
    return
  }

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Telegram API error (${res.status}): ${body}`)
  }
}

export async function sendStrategyAlert(
  chatId: string,
  strategy: {
    pair: string
    direction: string
    entryPrice: number
    stopLoss: number
    takeProfit1: number
    takeProfit2: number
    confidence: number
    risk: string
    summary: string
    link?: string
  }
): Promise<void> {
  const dirEmoji = strategy.direction === 'BUY' ? '🟢' : '🔴'
  const dirText = strategy.direction === 'BUY' ? 'BUY' : 'SELL'
  const link = strategy.link || 'https://yuanbridge.com/strategies'

  const message = [
    `${dirEmoji} *New Trading Strategy*`,
    '',
    `*Pair:* ${escapeMarkdown(strategy.pair)}`,
    `*Direction:* ${escapeMarkdown(dirText)}`,
    `*Entry:* $${escapeMarkdown(strategy.entryPrice.toFixed(5))}`,
    `*Stop Loss:* $${escapeMarkdown(strategy.stopLoss.toFixed(5))}`,
    `*TP1:* $${escapeMarkdown(strategy.takeProfit1.toFixed(5))}`,
    `*TP2:* $${escapeMarkdown(strategy.takeProfit2.toFixed(5))}`,
    `*Confidence:* ${escapeMarkdown(String(strategy.confidence))}%`,
    `*Risk:* ${escapeMarkdown(strategy.risk)}`,
    '',
    escapeMarkdown(strategy.summary),
    '',
    `[View Strategy](${escapeMarkdown(link)})`,
  ].join('\n')

  await sendTelegramMessage(chatId, message)
}

export async function sendSubscriptionAlert(
  chatId: string,
  message: string
): Promise<void> {
  const text = [
    'ℹ️ *Subscription Update*',
    '',
    escapeMarkdown(message),
    '',
    '_Manage your subscription at yuanbridge\\.com_',
  ].join('\n')

  await sendTelegramMessage(chatId, text)
}
