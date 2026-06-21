import { NextResponse } from "next/server";

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body: LoginBody = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      token: "mock_jwt_" + crypto.randomUUID().slice(0, 16),
      user: {
        id: "usr_" + crypto.randomUUID().slice(0, 8),
        email: body.email,
        name: "Test User",
        subscription: "free",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
