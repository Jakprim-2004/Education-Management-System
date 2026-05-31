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
        department: true,
        enrollments: {
          include: {
            section: {
              include: { course: true }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    // Find the curriculum matching student's admissionYear:
    // Get the latest active curriculum where curriculum.year <= student.admissionYear
    const curriculum = await prisma.curriculum.findFirst({
      where: {
        departmentId: student.departmentId,
        status: "active",
        year: { lte: student.admissionYear }
      },
      orderBy: { year: 'desc' },
      include: {
        curriculumCourses: {
          include: {
            course: true
          },
          orderBy: [
            { yearLevel: 'asc' },
            { semester: 'asc' }
          ]
        }
      }
    });

    // Build a map of completed/in-progress courses
    const courseStatusMap = new Map<number, { status: string; grade?: string }>();
    (student as any).enrollments.forEach((enrollment: any) => {
      const courseId = enrollment.section.courseId;
      const hasGrade = enrollment.grade && enrollment.grade !== "-";
      const isEnrolled = enrollment.status === "enrolled";

      if (hasGrade) {
        courseStatusMap.set(courseId, { status: "ผ่าน", grade: enrollment.grade || undefined });
      } else if (isEnrolled && !courseStatusMap.has(courseId)) {
        courseStatusMap.set(courseId, { status: "กำลังเรียน" });
      }
    });

    if (!curriculum) {
      return NextResponse.json({
        success: true,
        data: {
          curriculumName: "ไม่พบหลักสูตร",
          requirements: [],
          stats: { passed: 0, inProgress: 0, remaining: 0, totalCredits: 0, passedCredits: 0, inProgressCredits: 0 }
        }
      });
    }

    // Map curriculum courses to requirements
    const curData = curriculum as any;
    const requirements = curData.curriculumCourses.map((cc: any) => {
      const course = cc.course;
      const courseStatus = courseStatusMap.get(course.id);

      let status = "ยังไม่ลงทะเบียน";
      let grade: string | undefined;

      if (courseStatus) {
        status = courseStatus.status;
        grade = courseStatus.grade;
      }

      // Map course type
      let typeLabel = "วิชาบังคับ";
      switch (course.type) {
        case "required": typeLabel = "วิชาบังคับ"; break;
        case "elective": typeLabel = "วิชาเลือก"; break;
        case "general": typeLabel = "วิชาศึกษาทั่วไป"; break;
      }

      return {
        id: String(cc.id),
        code: course.code,
        name: course.name,
        credits: course.credits,
        type: typeLabel,
        status,
        grade,
        year: cc.yearLevel || 1,
        semester: cc.semester || 1
      };
    });

    const passed = requirements.filter(r => r.status === "ผ่าน");
    const inProgress = requirements.filter(r => r.status === "กำลังเรียน");
    const remaining = requirements.filter(r => r.status === "ยังไม่ลงทะเบียน");
    const totalCredits = requirements.reduce((s, r) => s + r.credits, 0);
    const passedCredits = passed.reduce((s, r) => s + r.credits, 0);
    const inProgressCredits = inProgress.reduce((s, r) => s + r.credits, 0);

    return NextResponse.json({
      success: true,
      data: {
        curriculumName: curData.name,
        totalRequired: curData.totalCredits,
        requirements,
        stats: {
          passed: passed.length,
          inProgress: inProgress.length,
          remaining: remaining.length,
          totalCredits,
          passedCredits,
          inProgressCredits
        }
      }
    });

  } catch (error: any) {
    console.error("Graduation Check API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
