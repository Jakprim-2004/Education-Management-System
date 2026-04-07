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

    const teacher = await prisma.teacher.findUnique({
      where: { userId: payload.userId },
      include: {
        courseSections: {
          include: {
            course: true,
            semester: true,
            schedules: true,
            _count: {
              select: { enrollments: true }
            }
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
    }

    // Format for frontend
    const courses = teacher.courseSections.map(section => {
      // Mock class count / announcement count since they don't exist in Prisma
      let classes = 15; 
      let announcements = Math.floor(Math.random() * 5);

      let scheduleStr = "ไม่ได้กำหนด";
      if (section.schedules.length > 0) {
        // e.g. "จ 14:00-16:50 น." (Mapping day to Thai is needed)
        const thaiDays: Record<string, string> = {
          "monday": "จ", "tuesday": "อ", "wednesday": "พ", 
          "thursday": "พฤ", "friday": "ศ", "saturday": "ส", "sunday": "อา"
        };
        const s = section.schedules[0];
        const day = thaiDays[s.dayOfWeek.toLowerCase()] || s.dayOfWeek;
        
        let startTimeStr = "00:00";
        let endTimeStr = "00:00";
        if (s.startTime) {
           const d = new Date(s.startTime);
           startTimeStr = d.toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' });
        }
        if (s.endTime) {
           const d = new Date(s.endTime);
           endTimeStr = d.toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' });
        }
        
        scheduleStr = `${day} ${startTimeStr}-${endTimeStr} น.`;
      }

      return {
        id: section.id.toString(),
        code: section.course.code,
        name: section.course.name,
        semester: `${section.semester.academicYear}/${section.semester.semesterNumber}`,
        students: section._count.enrollments,
        classes,
        announcements,
        schedule: scheduleStr,
        status: section.semester.isCurrent ? "active" : "completed",
      };
    });

    // sort to have active and newest semesters first
    courses.sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      return b.semester.localeCompare(a.semester);
    });

    return NextResponse.json({
      success: true,
      data: courses
    }, { status: 200 });

  } catch (error: any) {
    console.error("Teacher Courses API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
