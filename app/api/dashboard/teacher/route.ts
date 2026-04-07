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
    if (!payload || payload.role !== "teacher") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 1. Get Teacher Information & their courses
    const teacher = await prisma.teacher.findUnique({
      where: { userId: payload.userId },
      include: {
        courseSections: {
          include: {
            course: true,
            semester: true,
            _count: {
              select: { enrollments: true }
            }
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({ message: "Teacher profile not found" }, { status: 404 });
    }

    // 2. Fetch Announcements
    const rawAnnouncements = await prisma.announcement.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      where: {
        OR: [{ targetRole: 'all' }, { targetRole: 'teacher' }]
      }
    });

    // 3. Overview Stats Calculation
    let activeCoursesCount = 0;
    let totalStudents = 0;

    const myCourses = teacher.courseSections.map((section) => {
      if (section.semester.isCurrent) {
        activeCoursesCount++;
        totalStudents += section._count.enrollments;
      }
      return {
        code: section.course.code,
        name: section.course.name,
        students: section._count.enrollments,
        status: section.semester.isCurrent ? "Active" : "Completed"
      };
    });

    // Sort to show active first
    myCourses.sort((a, b) => (a.status === "Active" ? -1 : 1));

    const stats = [
      { id: "my-courses", label: "วิชาของฉัน", value: activeCoursesCount.toString(), color: "bg-blue-100 text-blue-600" },
      { id: "total-students", label: "จำนวนนิสิตทั้งหมด", value: totalStudents.toString(), color: "bg-green-100 text-green-600" },
      { id: "avg-grade", label: "เกรดเฉลี่ย", value: "B+", color: "bg-purple-100 text-purple-600" }, // Mock average grade for now
    ];

    const announcements = rawAnnouncements.map(a => ({
      id: a.id,
      title: a.title,
      date: new Date(a.createdAt || new Date()).toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' }),
      type: a.isPinned ? "important" : "update"
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats,
        myCourses,
        announcements
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Teacher Dashboard API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
