import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

    // Fetch user and student details
    const student = await prisma.student.findUnique({
      where: { userId: payload.userId },
      include: {
        user: true,
        department: {
          include: {
            faculty: true
          }
        },
        advisor: {
          include: { user: true }
        },
        enrollments: {
          include: {
            section: { include: { course: true } }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    // Calculate GPA and Total Credits
    let totalCredits = 0;
    let earnedPoints = 0;
    let countedCredits = 0;

    const gradePoints: Record<string, number> = {
      "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0.0
    };

    student.enrollments.forEach(enrollment => {
      if (enrollment.grade) {
        const credits = enrollment.section.course.credits;
        totalCredits += credits;
        
        if (gradePoints[enrollment.grade] !== undefined) {
          earnedPoints += gradePoints[enrollment.grade] * credits;
          countedCredits += credits;
        }
      }
    });

    const gpa = countedCredits > 0 ? (earnedPoints / countedCredits).toFixed(2) : "0.00";

    return NextResponse.json({
      success: true,
      data: {
        studentId: student.studentCode,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        email: student.user.email,
        phone: student.user.phone || "-",
        department: student.department?.name || "ไม่ระบุภาควิชา",
        faculty: student.department?.faculty?.name || "ไม่ระบุคณะ",
        admissionYear: String(student.admissionYear),
        gpa: gpa,
        totalCredits: String(totalCredits),
        academicAdvisor: student.advisor ? `${student.advisor.user.firstName} ${student.advisor.user.lastName}` : "",
        address: "", // Mock specific fixed field
        avatarUrl: student.user.avatarUrl || null
      }
    });

  } catch (error: any) {
    console.error("Profile API GET Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { firstName, lastName, phone } = body;

    // Identify user
    const student = await prisma.student.findUnique({
      where: { userId: payload.userId }
    });

    if (!student) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    // Update the User table
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        firstName,
        lastName,
        phone
      }
    });

    return NextResponse.json({
      success: true,
      message: "อัปเดตข้อมูลโปรไฟล์สำเร็จ",
      data: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone
      }
    });

  } catch (error: any) {
    console.error("Profile API PATCH Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
