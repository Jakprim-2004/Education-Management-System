import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, firstName, lastName, email, phone, password, role } = body;

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (role !== "student" && role !== "teacher") {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "อีเมลนี้มีการใช้งานแล้ว" },
        { status: 409 }
      );
    }

    if (studentId) {
      if (role === "student") {
        const existingStudent = await prisma.student.findUnique({
          where: { studentCode: studentId },
        });
        if (existingStudent) {
          return NextResponse.json(
            { message: "รหัสนิสิตนี้มีการลงทะเบียนแล้วในระบบ" },
            { status: 409 }
          );
        }
      } else if (role === "teacher") {
        const existingTeacher = await prisma.teacher.findUnique({
          where: { teacherCode: studentId },
        });
        if (existingTeacher) {
          return NextResponse.json(
            { message: "รหัสอาจารย์นี้มีการลงทะเบียนแล้วในระบบ" },
            { status: 409 }
          );
        }
      }
    }

    const passwordHash = await hashPassword(password);

    // Create user and profile in a transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: role as any,
          firstName,
          lastName,
          phone: phone || null,
        },
      });

      // Get or create a default department for registration
      let dept = await tx.department.findFirst();
      if (!dept) {
        const fac = await tx.faculty.create({
          data: { name: "Faculty of Defaults", code: "FAC01" },
        });
        dept = await tx.department.create({
          data: { name: "Default Department", code: "DEP01", facultyId: fac.id },
        });
      }

      if (role === "student") {
        await tx.student.create({
          data: {
            studentCode: studentId || `S${user.id}`,
            userId: user.id,
            departmentId: dept.id,
            admissionYear: new Date().getFullYear(),
            status: "active",
          },
        });
      } else if (role === "teacher") {
        await tx.teacher.create({
          data: {
            teacherCode: studentId || `T${user.id}`,
            userId: user.id,
            departmentId: dept.id,
          },
        });
      }
    });

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
