import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getIp } from "@/lib/utils";
import type { OrderFormData } from "@/types";

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

function formatTelegramMessage(data: OrderFormData): string {
  const lines: string[] = [];

  lines.push("═══════════════════════════════════════");
  lines.push("           * NEW PURCHASE ORDER *");
  lines.push("═══════════════════════════════════════\n");

  lines.push("*👤 CUSTOMER INFORMATION*");
  lines.push("─────────────────────────────────────");
  lines.push(`*Full Name:*        ${escapeMarkdown(data.customer.fullName)}`);
  lines.push(`*Mobile:*           ${escapeMarkdown(data.customer.mobileNumber)}`);
  if (data.customer.whatsappNumber) {
    lines.push(`*WhatsApp:*         ${escapeMarkdown(data.customer.whatsappNumber)}`);
  }
  if (data.customer.telegramUsername) {
    lines.push(`*Telegram:*         ${escapeMarkdown(data.customer.telegramUsername)}`);
  }
  lines.push(`*Email:*            ${escapeMarkdown(data.customer.email)}`);
  lines.push(`*Country:*          ${escapeMarkdown(data.customer.country)}`);
  lines.push(`*City:*             ${escapeMarkdown(data.customer.city)}`);
  lines.push(`*Address:*          ${escapeMarkdown(data.customer.shippingAddress)}`);
  if (data.customer.postalCode) {
    lines.push(`*Postal Code:*      ${escapeMarkdown(data.customer.postalCode)}`);
  }
  lines.push("");

  lines.push("*📦 PRODUCT DETAILS*");
  lines.push("─────────────────────────────────────");
  lines.push(`*Product URL:*      ${escapeMarkdown(data.product.url)}`);
  lines.push(`*Product Name:*     ${escapeMarkdown(data.product.name)}`);
  if (data.product.variant) {
    lines.push(`*Variant:*          ${escapeMarkdown(data.product.variant)}`);
  }
  if (data.product.color) {
    lines.push(`*Color:*            ${escapeMarkdown(data.product.color)}`);
  }
  if (data.product.size) {
    lines.push(`*Size:*             ${escapeMarkdown(data.product.size)}`);
  }
  lines.push(`*Quantity:*         ${data.product.quantity}`);
  if (data.product.notes) {
    lines.push(`*Product Notes:*    ${escapeMarkdown(data.product.notes)}`);
  }
  lines.push("");

  lines.push("*🚚 SHIPPING INFORMATION*");
  lines.push("─────────────────────────────────────");
  lines.push(`*Method:*           ${escapeMarkdown(data.shipping.method)}`);
  lines.push(`*Speed:*            ${escapeMarkdown(data.shipping.speed)}`);
  if (data.shipping.notes) {
    lines.push(`*Notes:*            ${escapeMarkdown(data.shipping.notes)}`);
  }
  lines.push("");

  lines.push("*💳 PAYMENT INFORMATION*");
  lines.push("─────────────────────────────────────");
  lines.push(`*Currency:*         ${escapeMarkdown(data.payment.currency)}`);
  lines.push(`*Budget:*           ${escapeMarkdown(data.payment.budget || "Not specified")}`);
  lines.push(`*Payment Method:*   ${escapeMarkdown(data.payment.method)}`);
  lines.push("");

  if (data.additional.requests || data.additional.instructions) {
    lines.push("*📝 ADDITIONAL NOTES*");
    lines.push("─────────────────────────────────────");
    if (data.additional.requests) {
      lines.push(`*Special Requests:* ${escapeMarkdown(data.additional.requests)}`);
    }
    if (data.additional.instructions) {
      lines.push(`*Extra Instr:*      ${escapeMarkdown(data.additional.instructions)}`);
    }
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

    if (!data.customer?.fullName || !data.customer?.email || !data.product?.url || !data.product?.name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const message = formatTelegramMessage(data);
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
    });
  } catch (error) {
    console.error("Order submission error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
