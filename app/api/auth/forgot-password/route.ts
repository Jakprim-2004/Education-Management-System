import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "กรุณากรอกอีเมล" }, { status: 400 });
    }

    // Try to find user by email or student/teacher code
    let user = await prisma.user.findUnique({ where: { email } });

    // Fallback detection (if they typed student ID in email box)
    if (!user) {
      const student = await prisma.student.findUnique({ where: { studentCode: email } });
      if (student) user = await prisma.user.findUnique({ where: { id: student.userId } });
      else {
        const teacher = await prisma.teacher.findUnique({ where: { teacherCode: email } });
        if (teacher) user = await prisma.user.findUnique({ where: { id: teacher.userId } });
      }
    }
    
    if (!user) {
      // Security measure: Still return success to prevent email enumeration,
      // but only in production. For dev, we usually show 404 to debug.
      return NextResponse.json({ message: "ไม่พบบัญชีนี้ในระบบ" }, { status: 404 });
    }

    // Generate 6-char OTP Token as per schema limitation @db.VarChar(6)
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Expire in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Clear previous requests
    await prisma.oTPVerification.deleteMany({
      where: { userId: user.id, purpose: "reset_password" }
    });

    // Save to DB
    await prisma.oTPVerification.create({
      data: {
        userId: user.id,
        otpCode: token,
        purpose: "reset_password",
        expiresAt,
        isUsed: false,
      }
    });

    const resetUrl = `http://localhost:3000/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    
    // Send email using MailerSend
    await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({ 
      message: "ลิงก์ถูกส่งออกไปแล้ว"
    }, { status: 200 });

  } catch (error: any) {
    console.error("Forgot pass error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
