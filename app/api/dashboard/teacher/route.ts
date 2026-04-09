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

    // Get optional semester filter from query params
    const { searchParams } = new URL(request.url);
    const semesterIdParam = searchParams.get("semesterId");

    // 1. Get Teacher Information & their courses
    const teacher = await prisma.teacher.findUnique({
      where: { userId: payload.userId },
      include: {
        courseSections: {
          include: {
            course: true,
            semester: true,
            enrollments: {
              select: { grade: true }
            },
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

    // 2. Build semester list from teacher's sections
    const semesterMap = new Map<number, { id: number; name: string; isCurrent: boolean }>();
    teacher.courseSections.forEach(section => {
      if (!semesterMap.has(section.semester.id)) {
        semesterMap.set(section.semester.id, {
          id: section.semester.id,
          name: `${section.semester.academicYear}/${section.semester.semesterNumber}`,
          isCurrent: section.semester.isCurrent || false,
        });
      }
    });
    const semesters = Array.from(semesterMap.values()).sort((a, b) => {
      // Sort by name descending (latest first)
      return b.name.localeCompare(a.name);
    });

    // Determine which semester to filter by
    let selectedSemesterId: number | null = null;
    if (semesterIdParam) {
      selectedSemesterId = parseInt(semesterIdParam);
    } else {
      // Default = current semester, or the latest one
      const currentSem = semesters.find(s => s.isCurrent);
      selectedSemesterId = currentSem?.id || semesters[0]?.id || null;
    }

    // 3. Fetch Announcements
    const rawAnnouncements = await prisma.announcement.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      where: {
        OR: [{ targetRole: 'all' }, { targetRole: 'teacher' }]
      }
    });

    // 4. Filter courses by selected semester & compute stats
    const filteredSections = selectedSemesterId
      ? teacher.courseSections.filter(s => s.semester.id === selectedSemesterId)
      : teacher.courseSections;

    let totalStudents = 0;
    let totalGradePoints = 0;
    let gradedCount = 0;

    const gradePoints: Record<string, number> = {
      "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0.0
    };

    const myCourses = filteredSections.map((section) => {
      totalStudents += section._count.enrollments;

      // Calculate average grade for this section
      section.enrollments.forEach(enr => {
        if (enr.grade && gradePoints[enr.grade] !== undefined) {
          totalGradePoints += gradePoints[enr.grade];
          gradedCount++;
        }
      });

      return {
        code: section.course.code,
        name: section.course.name,
        students: section._count.enrollments,
        semester: `${section.semester.academicYear}/${section.semester.semesterNumber}`,
        status: section.semester.isCurrent ? "Active" : "Completed"
      };
    });

    // Sort active first
    myCourses.sort((a, b) => (a.status === "Active" ? -1 : 1));

    // Calculate average grade
    const avgGradeValue = gradedCount > 0 ? totalGradePoints / gradedCount : 0;
    let avgGradeLabel = "-";
    if (gradedCount > 0) {
      if (avgGradeValue >= 3.75) avgGradeLabel = "A";
      else if (avgGradeValue >= 3.25) avgGradeLabel = "B+";
      else if (avgGradeValue >= 2.75) avgGradeLabel = "B";
      else if (avgGradeValue >= 2.25) avgGradeLabel = "C+";
      else if (avgGradeValue >= 1.75) avgGradeLabel = "C";
      else if (avgGradeValue >= 1.25) avgGradeLabel = "D+";
      else if (avgGradeValue >= 0.5) avgGradeLabel = "D";
      else avgGradeLabel = "F";
    }

    const stats = [
      { id: "my-courses", label: "วิชาของฉัน", value: filteredSections.length.toString(), color: "bg-blue-100 text-blue-600" },
      { id: "total-students", label: "จำนวนนิสิตทั้งหมด", value: totalStudents.toString(), color: "bg-green-100 text-green-600" },
      { id: "avg-grade", label: "เกรดเฉลี่ยนิสิต", value: avgGradeLabel, color: "bg-purple-100 text-purple-600" },
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
        semesters,
        selectedSemesterId,
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
