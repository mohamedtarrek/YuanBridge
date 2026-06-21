import { NextResponse } from "next/server";

interface NewsletterBody {
  email: string;
}

export async function POST(request: Request) {
  try {
    const body: NewsletterBody = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to the newsletter.",
      email: body.email,
    }, { status: 201 });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
