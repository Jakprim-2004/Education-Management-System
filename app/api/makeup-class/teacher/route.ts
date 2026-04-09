import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "teacher") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const teacher = await prisma.teacher.findUnique({
      where: { userId: payload.userId },
      include: {
        courseSections: {
          include: {
            course: true,
            enrollments: {
              include: {
                student: {
                  include: {
                    user: true,
                    enrollments: {
                      include: {
                        section: {
                          include: { course: true, schedules: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        makeupClasses: {
          include: { section: { include: { course: true, enrollments: true } } }
        }
      }
    });

    if (!teacher) return NextResponse.json({ message: "Teacher not found" }, { status: 404 });

    // 1. Build a list of teacher's active sections for the course selector
    const sections = teacher.courseSections.map(section => ({
      sectionId: section.id,
      courseCode: section.course.code,
      courseName: section.course.name,
      studentsTotal: section.enrollments.length
    }));

    // 2. Format Students & their full schedules
    const studentsMap = new Map();
    teacher.courseSections.forEach(section => {
      section.enrollments.forEach(enr => {
        const sid = enr.student.id.toString();
        if (!studentsMap.has(sid)) {
          const studentCourses = enr.student.enrollments.map(studentEnr => {
            const sch = studentEnr.section.schedules[0];
            const thaiDays: Record<string, string> = {
              "monday": "จันทร์", "tuesday": "อังคาร", "wednesday": "พุธ", 
              "thursday": "พฤหัสบดี", "friday": "ศุกร์", "saturday": "เสาร์", "sunday": "อาทิตย์"
            };
            const day = sch ? (thaiDays[sch.dayOfWeek.toLowerCase()] || sch.dayOfWeek) : "ไม่ระบุ";
            let time = "-";
            if (sch?.startTime && sch?.endTime) {
              const start = new Date(sch.startTime).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit"});
              const end = new Date(sch.endTime).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit"});
              time = `${start} - ${end}`;
            }

            return {
              code: studentEnr.section.course.code,
              name: studentEnr.section.course.name,
              day,
              time
            };
          });

          studentsMap.set(sid, {
            id: sid,
            studentId: enr.student.studentCode,
            name: `${enr.student.user.firstName} ${enr.student.user.lastName}`,
            courses: studentCourses
          });
        }
      });
    });

    const students = Array.from(studentsMap.values());

    // 3. Format existing makeup class requests (history)
    const requests: any[] = [];

    teacher.makeupClasses.forEach(mc => {
      const start = new Date(mc.startTime).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit"});
      const end = new Date(mc.endTime).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit"});
      
      const thaiDays: Record<number, string> = {
        0: "อาทิตย์", 1: "จันทร์", 2: "อังคาร", 3: "พุธ", 4: "พฤหัสบดี", 5: "ศุกร์", 6: "เสาร์"
      };

      const thaiDateOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

      requests.push({
        id: mc.id.toString(),
        sectionId: mc.sectionId,
        courseCode: mc.section.course.code,
        courseName: mc.section.course.name,
        reason: mc.reason || "ไม่ระบุเหตุผล",
        originalDate: new Date(mc.originalDate).toLocaleDateString("th-TH", thaiDateOptions),
        status: "ส่งนัดแล้ว",
        selectedDate: new Date(mc.makeupDate).toLocaleDateString("th-TH", thaiDateOptions),
        selectedTime: `${thaiDays[new Date(mc.makeupDate).getDay()]} ${start} - ${end}`,
        studentsTotal: mc.section.enrollments.length
      });
    });

    return NextResponse.json({ success: true, data: { sections, requests, students } }, { status: 200 });
  } catch (error: any) {
    console.error("Makeup Class GET API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "teacher") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const teacher = await prisma.teacher.findUnique({ where: { userId: payload.userId } });
    if (!teacher) return NextResponse.json({ message: "Teacher not found" }, { status: 404 });

    const body = await request.json();
    const { sectionId, makeupDate, startTime, endTime, reason } = body;

    if (!sectionId || !makeupDate || !startTime || !endTime) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newMakeup = await prisma.makeupClass.create({
      data: {
        sectionId: parseInt(sectionId),
        originalDate: new Date(),
        makeupDate: new Date(makeupDate),
        startTime: new Date(`1970-01-01T${startTime}:00Z`),
        endTime: new Date(`1970-01-01T${endTime}:00Z`),
        reason: reason || "สอนชดเชย",
        createdBy: teacher.id,
        status: "scheduled"
      }
    });

    return NextResponse.json({ success: true, data: newMakeup }, { status: 201 });
  } catch (error: any) {
    console.error("Makeup Class POST API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
