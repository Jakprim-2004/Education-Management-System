import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return NextResponse.json({ message: "ไม่พบบัญชีนี้" }, { status: 404 });
    }

    // Check OTP record
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        userId: user.id,
        otpCode: token,
        purpose: "reset_password",
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return NextResponse.json({ message: "ลิงก์นี้ไม่ถูกต้องหรือถูกใช้งานไปแล้ว" }, { status: 400 });
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ message: "ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว กรุณาขอใหม่" }, { status: 400 });
    }

    // Hash the new password and run in transaction
    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      // Update password
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      }),
      // Mark token as used
      prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }
      })
    ]);

    return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ!" }, { status: 200 });

  } catch (error: any) {
    console.error("Reset pass error:", error);
    return NextResponse.json({ message: "ระบบเกิดข้อผิดพลาด" }, { status: 500 });
  }
}
