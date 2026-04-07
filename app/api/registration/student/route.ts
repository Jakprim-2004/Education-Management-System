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
        user: true,
        department: true,
        advisor: {
          include: {
            user: true
          }
        },
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
        },
        coursePlans: {
          include: {
            course: {
              include: {
                courseSections: {
                  include: {
                    teacher: true,
                    schedules: true
                  }
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
        reason,
        semester: enrollment.section?.semester 
          ? `${enrollment.section.semester.semesterNumber}/${enrollment.section.semester.academicYear}` 
          : "ไม่ระบุภาคเรียน",
        sectionNumber: enrollment.section?.sectionNumber || "-",
        courseType: course.type || "C"
      };
    });

    const approved = registrations.filter(r => r.status === "approved");
    const pending = registrations.filter(r => r.status === "pending");
    const rejected = registrations.filter(r => r.status === "rejected");
    const totalApprovedCredits = approved.reduce((sum, r) => sum + r.credits, 0);

    const studentInfo = {
      studentCode: (student as any).studentCode,
      firstName: (student as any).user?.firstName,
      lastName: (student as any).user?.lastName,
      departmentName: (student as any).department?.name || "",
      advisorName: (student as any).advisor?.user ? `${(student as any).advisor.user.firstName} ${(student as any).advisor.user.lastName}` : ""
    };

    // Format course plans
    const plannedCourses = (student as any).coursePlans.map((plan: any) => {
      return {
        id: plan.id,
        semester: `${plan.plannedSemester}/${plan.plannedYear}`,
        courseId: plan.course.id,
        code: plan.course.code,
        name: plan.course.name,
        credits: plan.course.credits,
        availableSections: plan.course.courseSections.map((sec: any) => ({
          sectionId: sec.id,
          sectionNumber: sec.sectionNumber,
          teacherName: sec.teacher?.name || "ไม่ระบุ",
          currentStudents: sec.currentStudents || 0,
          maxStudents: sec.maxStudents || 50,
          schedules: sec.schedules.map((sch: any) => ({
            day: sch.dayOfWeek,
            time: `${new Date(sch.startTime).toISOString().slice(11, 16)} - ${new Date(sch.endTime).toISOString().slice(11, 16)}`,
            room: sch.room || "TBA"
          }))
        }))
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        studentInfo,
        registrations,
        plannedCourses,
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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "student") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { enrollments } = body; // Array of { courseId, semester }

    if (!Array.isArray(enrollments) || enrollments.length === 0) {
      return NextResponse.json({ message: "No courses selected" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { userId: payload.userId } });
    if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });

    const results = [];
    const errors = [];

    for (const item of enrollments) {
      const { courseId, semester } = item;
      if (!courseId) continue;

      let targetSemesterRec = null;
      if (semester) {
        const [termStr, yearStr] = semester.split('/');
        const semNum = parseInt(termStr);
        const acadYear = parseInt(yearStr);
        
        targetSemesterRec = await prisma.semester.findFirst({
          where: { semesterNumber: semNum, academicYear: acadYear }
        });

        // Auto-create semester record if it doesn't exist
        if (!targetSemesterRec && semNum && acadYear) {
          targetSemesterRec = await prisma.semester.create({
            data: {
              name: `ภาคเรียนที่ ${semNum}/${acadYear}`,
              academicYear: acadYear,
              semesterNumber: semNum,
              startDate: new Date(acadYear - 543, semNum === 1 ? 5 : 10, 1), // approximate
              endDate: new Date(acadYear - 543, semNum === 1 ? 9 : 2, 30),   // approximate
              isCurrent: false
            }
          });
        }
      }

      if (!targetSemesterRec) {
        targetSemesterRec = await prisma.semester.findFirst({ orderBy: { isCurrent: 'desc' } });
      }

      if (!targetSemesterRec) {
        errors.push(`ไม่พบภาคเรียนในระบบ`);
        continue;
      }

      // Fetch course details for friendly error
      const course = await prisma.course.findUnique({ where: { id: Number(courseId) } });

      // Find the first available section for this course IN THE SPECIFIED SEMESTER
      let section = await prisma.courseSection.findFirst({
        where: { courseId: Number(courseId), semesterId: targetSemesterRec.id },
        orderBy: { sectionNumber: 'asc' }
      });

      if (!section) {
        // Auto-create a temporary section so the student can register for this semester
        const teacher = await prisma.teacher.findFirst();

        if (teacher) {
          section = await prisma.courseSection.create({
            data: {
              courseId: Number(courseId),
              semesterId: targetSemesterRec.id,
              teacherId: teacher.id,
              sectionNumber: "Auto",
              maxStudents: 999,
            }
          });
        } else {
          errors.push(`ระบบยังไม่ได้ตั้งค่าปีการศึกษาหรืออาจารย์ (วิชา ${course?.code || courseId})`);
          continue;
        }
      }
      
      const sectionId = section.id;

      // Check if already enrolled or pending
      const existing = await prisma.enrollment.findUnique({
        where: {
          studentId_sectionId: {
            studentId: student.id,
            sectionId: sectionId
          }
        }
      });

      if (existing) {
        errors.push(`วิชา ${course?.code || courseId} ลงทะเบียนซ้ำแล้ว`);
        continue;
      }

      if ((section.currentStudents || 0) >= (section.maxStudents || 50)) {
        errors.push(`วิชา ${course?.code || courseId} ที่นั่งเต็มแล้ว`);
        continue;
      }

      // Create enrollment as pending (awaiting advisor)
      const newEnrollment = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          sectionId: sectionId,
          status: "pending", 
          enrolledAt: new Date()
        }
      });

      // Increase currentStudents counter
      await prisma.courseSection.update({
        where: { id: sectionId },
        data: { currentStudents: { increment: 1 } }
      });

      // Remove from course plan since it is now being enrolled
      await prisma.coursePlan.deleteMany({
        where: { studentId: student.id, courseId: section.courseId }
      });

      results.push(newEnrollment);
    }

    return NextResponse.json({ success: true, results, errors });
  } catch (error: any) {
    console.error("Registration POST Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
