import { NextResponse } from "next/server";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body: RegisterBody = await request.json();

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (!validateEmail(body.email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: "usr_" + crypto.randomUUID().slice(0, 8),
        name: body.name,
        email: body.email,
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
