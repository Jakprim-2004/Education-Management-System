import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "student") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `avatar_${payload.userId}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Save file
    await fs.writeFile(filePath, buffer);

    const avatarUrl = `/api/uploads/${filename}`;

    // Update database
    await prisma.user.update({
      where: { id: payload.userId },
      data: { avatarUrl }
    });

    return NextResponse.json({
      success: true,
      message: "อัปโหลดรูปภาพสำเร็จ",
      avatarUrl
    });

  } catch (error: any) {
    console.error("Avatar Upload Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
