import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateSignup } from "@/lib/auth/signup";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateSignup({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      phone: String(body.phone ?? ""),
      state: String(body.state ?? ""),
      district: String(body.district ?? ""),
      termsAccepted: body.termsAccepted === true,
      marketingOptIn: body.marketingOptIn === true,
    });

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validation.data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(validation.data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validation.data.name,
        email: validation.data.email,
        passwordHash: hashedPassword,
        phone: validation.data.phone,
        state: validation.data.state,
        district: validation.data.district,
        termsAcceptedAt: new Date(),
        marketingOptIn: validation.data.marketingOptIn,
        role: "STUDENT",
        isActive: true,
      },
    });

    return NextResponse.json(
      { message: "Registration successful", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
