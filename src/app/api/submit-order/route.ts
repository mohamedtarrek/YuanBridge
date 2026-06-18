import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { rateLimit } from "@/lib/rate-limit";
import { getIp } from "@/lib/utils";
import type { OrderFormData } from "@/types";

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(4).toString("hex").toUpperCase();
  return `YB-${timestamp}-${random}`;
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

function formatTelegramMessage(data: OrderFormData, orderId: string): string {
  const lines: string[] = [];

  lines.push("═══════════════════════════════════════");
  lines.push("           * NEW PURCHASE ORDER *");
  lines.push("═══════════════════════════════════════\n");

  lines.push(`📋 *Order ID:* \\#${escapeMarkdown(orderId)}`);
  lines.push("");

  lines.push("*👤 CUSTOMER INFORMATION*");
  lines.push("─────────────────────────────────────");
  lines.push(`*Full Name:*        ${escapeMarkdown(data.customer.fullName)}`);
  lines.push(`*Mobile:*           ${escapeMarkdown(data.customer.mobileNumber)}`);
  lines.push(`*WhatsApp:*         ${escapeMarkdown(data.customer.whatsappNumber)}`);
  lines.push(`*Country:*          ${escapeMarkdown(data.customer.country)}`);
  lines.push("");

  lines.push("*📦 PRODUCT DETAILS*");
  lines.push("─────────────────────────────────────");
  lines.push(`*Product URL:*      ${escapeMarkdown(data.product.url)}`);
  lines.push("");

  lines.push("*🚚 SHIPPING INFORMATION*");
  lines.push("─────────────────────────────────────");
  lines.push(`*Method:*           ${escapeMarkdown(data.shipping.method)}`);
  lines.push(`*Speed:*            ${escapeMarkdown(data.shipping.speed)}`);
  lines.push("");

  lines.push("*💳 PAYMENT INFORMATION*");
  lines.push("─────────────────────────────────────");
  lines.push(`*Currency:*         ${escapeMarkdown(data.payment.currency)}`);
  lines.push(`*Payment Method:*   ${escapeMarkdown(data.payment.method)}`);
  lines.push("");
  if (data.additional.notes) {
    lines.push("*📝 ADDITIONAL NOTES*");
    lines.push("─────────────────────────────────────");
    lines.push(`${escapeMarkdown(data.additional.notes)}`);
    lines.push("");
  }

  lines.push("═══════════════════════════════════════");
  lines.push(`*🕐 Order Submitted:* ${new Date().toISOString()}`);
  lines.push("═══════════════════════════════════════");

  return lines.join("\n");
}

export async function POST(request: Request) {
  try {
    const ip = getIp(request);
    const ipCheck = rateLimit(ip);

    if (!ipCheck.success) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json(
        { success: false, message: "Server configuration error." },
        { status: 500 }
      );
    }

    const data: OrderFormData = await request.json();

    if (!data.customer?.fullName || !data.customer?.mobileNumber || !data.customer?.whatsappNumber || !data.customer?.country || !data.product?.url) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const message = formatTelegramMessage(data, orderId);
    const encodedMessage = encodeURIComponent(message);

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodedMessage}&parse_mode=Markdown`;

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("Telegram API error:", result);
      return NextResponse.json(
        { success: false, message: "Failed to submit order. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your order has been submitted successfully!",
      orderId,
    });
  } catch (error) {
    console.error("Order submission error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
