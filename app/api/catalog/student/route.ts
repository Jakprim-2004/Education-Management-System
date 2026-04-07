import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const THAI_DAYS: Record<string, string> = {
  "MON": "จ",
  "TUE": "อ",
  "WED": "พ",
  "THU": "พฤ",
  "FRI": "ศ",
  "SAT": "ส",
  "SUN": "อา"
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
};

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

    // Fetch all courses with their sections, schedules, and teacher info
    const courses = await prisma.course.findMany({
      include: {
        department: true,
        courseSections: {
          include: {
            teacher: {
              include: { user: true }
            },
            schedules: true,
            semester: true,
            _count: {
              select: { enrollments: true }
            }
          }
        }
      },
      orderBy: { code: 'asc' }
    });

    const result = courses.map(course => {
      // Get the latest/current section for display
      const latestSection = (course as any).courseSections?.[0];
      const teacher = latestSection?.teacher?.user;
      const schedule = latestSection?.schedules?.[0];
      const semester = latestSection?.semester;

      let scheduleStr = "ไม่ระบุเวลาเรียน";
      if (schedule) {
        const day = THAI_DAYS[schedule.dayOfWeek] || schedule.dayOfWeek;
        const start = formatTime(new Date(schedule.startTime));
        const end = formatTime(new Date(schedule.endTime));
        scheduleStr = `${day} ${start}-${end} น.`;
      }

      const semesterStr = semester
        ? `${semester.academicYear}/${semester.semesterNumber}`
        : "ไม่ระบุ";

      return {
        id: String(course.id),
        code: course.code,
        name: course.name,
        credits: course.credits,
        instructor: teacher ? `${teacher.firstName} ${teacher.lastName}` : "ไม่ระบุอาจารย์",
        semester: semesterStr,
        students: latestSection?._count?.enrollments || 0,
        description: course.description || "ไม่มีคำอธิบายรายวิชา",
        schedule: scheduleStr,
        type: course.type
      };
    });

    // Get available semesters
    const semesters = [...new Set(result.map(c => c.semester).filter(s => s !== "ไม่ระบุ"))];

    return NextResponse.json({
      success: true,
      data: {
        courses: result,
        semesters
      }
    });

  } catch (error: any) {
    console.error("Catalog API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
