import type { EmailPayload } from './types'

export interface EmailProvider {
  send(payload: EmailPayload): Promise<void>
  name: string
}

class ResendEmailProvider implements EmailProvider {
  name = 'resend'

  async send(payload: EmailPayload): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('[Email] Resend API key not configured, skipping email')
      return
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@yuanbridge.com',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Resend API error (${res.status}): ${body}`)
    }
  }
}

class SmtpEmailProvider implements EmailProvider {
  name = 'smtp'

  async send(payload: EmailPayload): Promise<void> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn('[Email] SMTP not configured, skipping email')
      return
    }

    let nodemailer: any
    try {
      nodemailer = await import('nodemailer')
    } catch {
      console.warn('[Email] nodemailer not installed, skipping email')
      return
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: SMTP_PORT === '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    await transporter.sendMail({
      from: EMAIL_FROM || 'noreply@yuanbridge.com',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    })
  }
}

export function getEmailProvider(): EmailProvider {
  if (process.env.RESEND_API_KEY) {
    return new ResendEmailProvider()
  }
  return new SmtpEmailProvider()
}

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html dir="ltr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f8;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
<tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 40px;text-align:center">
<img src="https://yuanbridge.com/logo.png" alt="YuanBridge" width="160" style="display:block;margin:0 auto 12px">
<h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700">${title}</h1>
</td></tr>
<tr><td style="padding:32px 40px">${body}</td></tr>
<tr><td style="background-color:#f8f9fa;padding:20px 40px;text-align:center;font-size:13px;color:#6b7280">
<p style="margin:0 0 8px">YuanBridge AI — Forex Trading Strategies</p>
<p style="margin:0">If you have questions, contact us at <a href="mailto:support@yuanbridge.com" style="color:#2563eb;text-decoration:none">support@yuanbridge.com</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function wrapHtmlAr(title: string, body: string): string {
  return `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f8;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
<tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 40px;text-align:center">
<img src="https://yuanbridge.com/logo.png" alt="YuanBridge" width="160" style="display:block;margin:0 auto 12px">
<h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700">${title}</h1>
</td></tr>
<tr><td style="padding:32px 40px">${body}</td></tr>
<tr><td style="background-color:#f8f9fa;padding:20px 40px;text-align:center;font-size:13px;color:#6b7280">
<p style="margin:0 0 8px">YuanBridge AI — استراتيجيات تداول الفوركس</p>
<p style="margin:0">للاستفسار، تواصل معنا على <a href="mailto:support@yuanbridge.com" style="color:#2563eb;text-decoration:none">support@yuanbridge.com</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function styleButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="background-color:#2563eb;border-radius:8px;text-align:center;padding:12px 32px"><a href="${url}" style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;display:inline-block">${text}</a></td></tr></table>`
}

export const emailTemplates = {
  welcome(data: { name: string; nameAr: string; url: string }): { html: string; htmlAr: string } {
    const bodyEn = `<p style="color:#374151;font-size:16px;line-height:1.6">Hi ${data.name},</p>
<p style="color:#374151;font-size:16px;line-height:1.6">Welcome to YuanBridge! Your AI-powered Forex trading journey starts now.</p>
<p style="color:#374151;font-size:16px;line-height:1.6">Our AI is already analyzing the markets to bring you high-quality trading strategies. Here is what you can do next:</p>
<ul style="color:#374151;font-size:15px;line-height:1.8;padding-right:20px">
<li>Explore your personalized dashboard</li>
<li>View the latest AI-generated strategies</li>
<li>Set up your notification preferences</li>
<li>Upgrade to Premium for advanced features</li>
</ul>
${styleButton('Go to Dashboard', data.url)}
<p style="color:#6b7280;font-size:14px;margin-top:24px">Best regards,<br>The YuanBridge Team</p>`

    const bodyAr = `<p style="color:#374151;font-size:16px;line-height:1.6">مرحباً ${data.nameAr}،</p>
<p style="color:#374151;font-size:16px;line-height:1.6">مرحباً بك في YuanBridge! رحلة التداول بالذكاء الاصطناعي تبدأ الآن.</p>
<p style="color:#374151;font-size:16px;line-height:1.6">ذكاؤنا الاصطناعي يحلل الأسواق بالفعل ليقدم لك استراتيجيات تداول عالية الجودة. إليك ما يمكنك فعله:</p>
<ul style="color:#374151;font-size:15px;line-height:1.8;padding-right:20px">
<li>استكشاف لوحة التحكم الخاصة بك</li>
<li>عرض أحدث الاستراتيجيات المولدة بالذكاء الاصطناعي</li>
<li>إعداد تفضيلات الإشعارات</li>
<li>الترقية إلى Premium للميزات المتقدمة</li>
</ul>
${styleButton('اذهب إلى لوحة التحكم', data.url)}
<p style="color:#6b7280;font-size:14px;margin-top:24px">مع تحيات،<br>فريق YuanBridge</p>`

    return { html: wrapHtml('Welcome to YuanBridge!', bodyEn), htmlAr: wrapHtmlAr('مرحباً بك في YuanBridge!', bodyAr) }
  },

  strategyAlert(data: { name: string; nameAr: string; pair: string; direction: string; entry: number; sl: number; tp1: number; tp2: number; confidence: number; url: string }): { html: string; htmlAr: string } {
    const dirLabel = data.direction === 'BUY' ? '🟢 BUY' : '🔴 SELL'
    const bodyEn = `<p style="color:#374151;font-size:16px;line-height:1.6">Hi ${data.name},</p>
<p style="color:#374151;font-size:16px;line-height:1.6">A new trading strategy is ready for <strong>${data.pair}</strong>:</p>
<table role="presentation" width="100%" cellpadding="12" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;margin:16px 0;border:1px solid #e5e7eb">
<tr><td style="font-size:15px;color:#374151"><strong>Direction:</strong> ${dirLabel}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>Entry:</strong> $${data.entry.toFixed(5)}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>Stop Loss:</strong> $${data.sl.toFixed(5)}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>Take Profit 1:</strong> $${data.tp1.toFixed(5)}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>Take Profit 2:</strong> $${data.tp2.toFixed(5)}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>Confidence:</strong> ${data.confidence}%</td></tr>
</table>
${styleButton('View Strategy', data.url)}
<p style="color:#6b7280;font-size:14px;margin-top:24px">Best regards,<br>The YuanBridge Team</p>`

    const bodyAr = `<p style="color:#374151;font-size:16px;line-height:1.6">مرحباً ${data.nameAr}،</p>
<p style="color:#374151;font-size:16px;line-height:1.6">استراتيجية تداول جديدة جاهزة لـ <strong>${data.pair}</strong>:</p>
<table role="presentation" width="100%" cellpadding="12" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;margin:16px 0;border:1px solid #e5e7eb">
<tr><td style="font-size:15px;color:#374151"><strong>الاتجاه:</strong> ${data.direction === 'BUY' ? 'شراء 🟢' : 'بيع 🔴'}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>الدخول:</strong> $${data.entry.toFixed(5)}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>وقف الخسارة:</strong> $${data.sl.toFixed(5)}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>جني الأرباح 1:</strong> $${data.tp1.toFixed(5)}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>جني الأرباح 2:</strong> $${data.tp2.toFixed(5)}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>الثقة:</strong> ${data.confidence}%</td></tr>
</table>
${styleButton('عرض الاستراتيجية', data.url)}
<p style="color:#6b7280;font-size:14px;margin-top:24px">مع تحيات،<br>فريق YuanBridge</p>`

    return { html: wrapHtml('New Strategy Alert', bodyEn), htmlAr: wrapHtmlAr('تنبيه استراتيجية جديدة', bodyAr) }
  },

  subscriptionConfirmation(data: { name: string; nameAr: string; plan: string; planAr: string; endsAt: string; url: string }): { html: string; htmlAr: string } {
    const bodyEn = `<p style="color:#374151;font-size:16px;line-height:1.6">Hi ${data.name},</p>
<p style="color:#374151;font-size:16px;line-height:1.6">Thank you for subscribing to the <strong>${data.plan}</strong> plan!</p>
<p style="color:#374151;font-size:16px;line-height:1.6">Your subscription is active and will renew on <strong>${data.endsAt}</strong>. You now have full access to all features included in your plan.</p>
${styleButton('Manage Subscription', data.url)}
<p style="color:#6b7280;font-size:14px;margin-top:24px">Happy trading!<br>The YuanBridge Team</p>`

    const bodyAr = `<p style="color:#374151;font-size:16px;line-height:1.6">مرحباً ${data.nameAr}،</p>
<p style="color:#374151;font-size:16px;line-height:1.6">شكراً لاشتراكك في خطة <strong>${data.planAr}</strong>!</p>
<p style="color:#374151;font-size:16px;line-height:1.6">اشتراكك نشط وسيتم تجديده في <strong>${data.endsAt}</strong>. لديك الآن وصول كامل لجميع الميزات المضمنة في خطتك.</p>
${styleButton('إدارة الاشتراك', data.url)}
<p style="color:#6b7280;font-size:14px;margin-top:24px">تداول موفق!<br>فريق YuanBridge</p>`

    return { html: wrapHtml('Subscription Confirmed', bodyEn), htmlAr: wrapHtmlAr('تم تأكيد الاشتراك', bodyAr) }
  },

  passwordReset(data: { name: string; nameAr: string; url: string }): { html: string; htmlAr: string } {
    const bodyEn = `<p style="color:#374151;font-size:16px;line-height:1.6">Hi ${data.name},</p>
<p style="color:#374151;font-size:16px;line-height:1.6">We received a request to reset your password. Click the button below to create a new password:</p>
${styleButton('Reset Password', data.url)}
<p style="color:#6b7280;font-size:14px">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
<p style="color:#6b7280;font-size:14px;margin-top:24px">Best regards,<br>The YuanBridge Team</p>`

    const bodyAr = `<p style="color:#374151;font-size:16px;line-height:1.6">مرحباً ${data.nameAr}،</p>
<p style="color:#374151;font-size:16px;line-height:1.6">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. انقر على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
${styleButton('إعادة تعيين كلمة المرور', data.url)}
<p style="color:#6b7280;font-size:14px">هذا الرابط صالح لمدة ساعة. إذا لم تطلب ذلك، يرجى تجاهل هذا البريد الإلكتروني.</p>
<p style="color:#6b7280;font-size:14px;margin-top:24px">مع تحيات،<br>فريق YuanBridge</p>`

    return { html: wrapHtml('Password Reset Request', bodyEn), htmlAr: wrapHtmlAr('طلب إعادة تعيين كلمة المرور', bodyAr) }
  },

  billingReceipt(data: { name: string; nameAr: string; amount: string; date: string; invoiceUrl: string; url: string }): { html: string; htmlAr: string } {
    const bodyEn = `<p style="color:#374151;font-size:16px;line-height:1.6">Hi ${data.name},</p>
<p style="color:#374151;font-size:16px;line-height:1.6">Your payment of <strong>${data.amount}</strong> on <strong>${data.date}</strong> was successful.</p>
<table role="presentation" width="100%" cellpadding="12" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;margin:16px 0;border:1px solid #e5e7eb">
<tr><td style="font-size:15px;color:#374151"><strong>Amount:</strong> ${data.amount}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>Date:</strong> ${data.date}</td></tr>
</table>
${styleButton('View Invoice', data.invoiceUrl)}
<p style="color:#6b7280;font-size:14px;margin-top:24px">Best regards,<br>The YuanBridge Team</p>`

    const bodyAr = `<p style="color:#374151;font-size:16px;line-height:1.6">مرحباً ${data.nameAr}،</p>
<p style="color:#374151;font-size:16px;line-height:1.6">تمت عملية الدفع بقيمة <strong>${data.amount}</strong> في <strong>${data.date}</strong> بنجاح.</p>
<table role="presentation" width="100%" cellpadding="12" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;margin:16px 0;border:1px solid #e5e7eb">
<tr><td style="font-size:15px;color:#374151"><strong>المبلغ:</strong> ${data.amount}</td></tr>
<tr><td style="font-size:15px;color:#374151"><strong>التاريخ:</strong> ${data.date}</td></tr>
</table>
${styleButton('عرض الفاتورة', data.invoiceUrl)}
<p style="color:#6b7280;font-size:14px;margin-top:24px">مع تحيات،<br>فريق YuanBridge</p>`

    return { html: wrapHtml('Payment Receipt', bodyEn), htmlAr: wrapHtmlAr('إيصال الدفع', bodyAr) }
  },
}
