import { NextResponse } from "next/server";

interface CancelSubscriptionBody {
  subscriptionId: string;
}

export async function POST(request: Request) {
  try {
    const body: CancelSubscriptionBody = await request.json();

    if (!body.subscriptionId) {
      return NextResponse.json(
        { success: false, message: "subscriptionId is required." },
        { status: 400 }
      );
    }

    const subscription = {
      id: body.subscriptionId,
      userId: "usr_mock_user",
      plan: "premium" as const,
      status: "cancelled" as const,
      paymentMethod: "stripe" as const,
      startedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      cancelledAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully.",
      subscription,
    });
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
