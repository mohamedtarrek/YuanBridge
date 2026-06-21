import { NextResponse } from "next/server";

interface CreateSubscriptionBody {
  userId: string;
  plan: "premium";
  paymentMethod: "stripe" | "paypal";
}

export async function POST(request: Request) {
  try {
    const body: CreateSubscriptionBody = await request.json();

    if (!body.userId || !body.plan || !body.paymentMethod) {
      return NextResponse.json(
        { success: false, message: "userId, plan, and paymentMethod are required." },
        { status: 400 }
      );
    }

    if (body.plan !== "premium") {
      return NextResponse.json(
        { success: false, message: "Plan must be 'premium'." },
        { status: 400 }
      );
    }

    if (!["stripe", "paypal"].includes(body.paymentMethod)) {
      return NextResponse.json(
        { success: false, message: "paymentMethod must be 'stripe' or 'paypal'." },
        { status: 400 }
      );
    }

    const now = new Date();
    const endsAt = new Date(now);
    endsAt.setDate(endsAt.getDate() + 30);

    const subscription = {
      id: "sub_" + crypto.randomUUID().slice(0, 12),
      userId: body.userId,
      plan: "premium" as const,
      status: "active" as const,
      paymentMethod: body.paymentMethod,
      startedAt: now.toISOString(),
      endsAt: endsAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Subscription created successfully.",
      subscription,
    }, { status: 201 });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
