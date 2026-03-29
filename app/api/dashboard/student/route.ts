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

    // 1. Get Student Information
    const student = await prisma.student.findUnique({
      where: { userId: payload.userId },
      include: {
        enrollments: {
          include: {
            section: {
              include: {
                course: true,
                teacher: {
                  include: { user: true }
                }
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    // 2. Fetch Announcements
    // If you don't have an Announcement table, we'll return an empty array or mock ones until the table is populated.
    // Looking at the schema, there is an `Announcement` table.
    const rawAnnouncements = await prisma.announcement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: {
        OR: [{ targetRole: 'all' }, { targetRole: 'student' }]
      }
    });

    // 3. Transform Data Context
    let totalCredits = 0;
    let completedCoursesCount = 0;
    let inProgressCount = 0;

    const enrolledCourses = student.enrollments.map((enrollment) => {
      if (enrollment.status === "completed") {
        totalCredits += enrollment.section.course.credits;
        completedCoursesCount++;
      } else {
        inProgressCount++;
      }

      return {
        code: enrollment.section.course.code,
        name: enrollment.section.course.name,
        instructor: enrollment.section.teacher ? `${enrollment.section.teacher.user.firstName} ${enrollment.section.teacher.user.lastName}` : "",
        status: enrollment.status, // "enrolled" | "in-progress" | "completed" | "dropped"
        grade: enrollment.grade || "-",
      };
    });

    const stats = [
      { id: "registered", label: "วิชาลงทะเบียน", value: student.enrollments.length.toString(), color: "bg-blue-100 text-blue-600" },
      { id: "in-progress", label: "กำลังเรียน", value: inProgressCount.toString(), color: "bg-yellow-100 text-yellow-600" },
      { id: "completed", label: "เรียนจบแล้ว", value: completedCoursesCount.toString(), color: "bg-green-100 text-green-600" },
      { id: "credits", label: "หน่วยกิตที่ได้", value: totalCredits.toString(), color: "bg-purple-100 text-purple-600" },
    ];

    const announcements = rawAnnouncements.map(a => ({
      id: a.id,
      title: a.title,
      date: new Date(a.createdAt).toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' }),
      type: a.isPinned ? "important" : "update"
    }));

    return NextResponse.json({
      success: true,
      data: {
        student: {
          code: student.studentCode,
          status: student.status,
          admissionYear: student.admissionYear
        },
        stats,
        enrolledCourses,
        announcements
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
