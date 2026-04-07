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

    const student = await prisma.student.findUnique({
      where: { userId: payload.userId },
      include: {
        enrollments: {
          include: {
            section: {
              include: {
                course: true,
                semester: true
              }
            }
          },
          orderBy: { enrolledAt: 'desc' }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    // Map enrollment status to registration status
    const mapStatus = (status: string | null): "approved" | "pending" | "rejected" => {
      switch (status) {
        case "enrolled": return "approved";
        case "dropped": return "rejected";
        case "withdrawn": return "rejected";
        default: return "pending";
      }
    };

    const registrations = (student as any).enrollments.map((enrollment: any) => {
      const course = enrollment.section.course;
      const enrolledDate = enrollment.enrolledAt
        ? new Date(enrollment.enrolledAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })
        : "ไม่ระบุวันที่";

      const status = mapStatus(enrollment.status);

      let reason = "";
      if (status === "rejected") {
        reason = enrollment.status === "dropped"
          ? "ถอนวิชา"
          : "ถอนวิชาโดยได้รับ W";
      }

      return {
        id: String(enrollment.id),
        code: course.code,
        name: course.name,
        credits: course.credits,
        status,
        registrationDate: enrolledDate,
        reason
      };
    });

    const approved = registrations.filter(r => r.status === "approved");
    const pending = registrations.filter(r => r.status === "pending");
    const rejected = registrations.filter(r => r.status === "rejected");
    const totalApprovedCredits = approved.reduce((sum, r) => sum + r.credits, 0);

    return NextResponse.json({
      success: true,
      data: {
        registrations,
        stats: {
          approved: approved.length,
          pending: pending.length,
          rejected: rejected.length,
          totalApprovedCredits
        }
      }
    });

  } catch (error: any) {
    console.error("Registration API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
