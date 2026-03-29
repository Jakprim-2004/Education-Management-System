import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing email or password" },
        { status: 400 }
      );
    }

    // Try to find user by email
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If not found by email, try to find by student or teacher code
    if (!user) {
      const student = await prisma.student.findUnique({ where: { studentCode: email }});
      if (student) {
        user = await prisma.user.findUnique({ where: { id: student.userId }});
      } else {
        const teacher = await prisma.teacher.findUnique({ where: { teacherCode: email }});
        if (teacher) {
          user = await prisma.user.findUnique({ where: { id: teacher.userId }});
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session token
    const token = await signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // Set cookie
    const response = NextResponse.json(
      { message: "Login successful", user: { id: user.id, role: user.role, email: user.email } },
      { status: 200 }
    );

    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
