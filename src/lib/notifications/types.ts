export interface NotificationPayload {
  userId: string
  title: string
  titleAr: string
  message: string
  messageAr: string
  type: 'STRATEGY' | 'SYSTEM' | 'BILLING' | 'ALERT'
  link?: string
}

export interface EmailPayload {
  to: string
  subject: string
  subjectAr: string
  html: string
  htmlAr: string
}

export interface TelegramPayload {
  chatId: string
  message: string
}
