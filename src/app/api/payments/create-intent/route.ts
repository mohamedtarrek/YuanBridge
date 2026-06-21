import { NextResponse } from "next/server";

interface CreateIntentBody {
  amount: number;
  currency: string;
}

export async function POST(request: Request) {
  try {
    const body: CreateIntentBody = await request.json();

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Amount must be a positive number." },
        { status: 400 }
      );
    }

    if (!body.currency || body.currency.length !== 3) {
      return NextResponse.json(
        { success: false, message: "Currency must be a 3-letter code (e.g. USD)." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      clientSecret: "pi_" + crypto.randomUUID().slice(0, 16) + "_secret_" + crypto.randomUUID().slice(0, 16),
      amount: body.amount,
      currency: body.currency.toUpperCase(),
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
