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
        coursePlans: {
          include: {
            course: true
          },
          orderBy: [
            { plannedYear: 'asc' },
            { plannedSemester: 'asc' }
          ]
        },
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

    // Build a set of enrolled course IDs to determine status
    const enrolledCourseIds = new Set(
      (student as any).enrollments.map((e: any) => e.section.courseId)
    );
    const completedCourseIds = new Set(
      (student as any).enrollments
        .filter((e: any) => e.grade && e.grade !== "F")
        .map((e: any) => e.section.courseId)
    );

    const courses = (student as any).coursePlans.map((plan: any) => {
      let status: "planned" | "completed" | "in-progress" = plan.status as any || "planned";
      if (completedCourseIds.has(plan.courseId)) {
        status = "completed";
      } else if (enrolledCourseIds.has(plan.courseId)) {
        status = "in-progress";
      }

      const semesterKey = `${plan.plannedYear}/${plan.plannedSemester}`;

      return {
        id: String(plan.id),
        code: plan.course.code,
        name: plan.course.name,
        credits: plan.course.credits,
        semester: semesterKey,
        status
      };
    });

    // Get available semesters from mapped courses
    const mappedSemesters = courses.map(c => c.semester);
    
    // Get custom semesters from student profile
    let custom = [];
    try {
      const studentAny = student as any;
      if (studentAny.customSemesters) {
        // Handle it if it's stored as JSON
        custom = typeof studentAny.customSemesters === 'string' 
          ? JSON.parse(studentAny.customSemesters) 
          : studentAny.customSemesters;
      }
    } catch(e) {}

    const semesters = [...new Set([...mappedSemesters, ...custom])].sort();

    // Fetch all available courses for autocomplete
    const allCourses = await prisma.course.findMany({
      select: { code: true, name: true, credits: true },
      orderBy: { code: 'asc' }
    });

    // Collect enrolled course codes for the frontend to filter
    const enrolledCourseCodes = (student as any).enrollments.map((e: any) => e.section.course.code);

    return NextResponse.json({
      success: true,
      data: {
        courses,
        semesters,
        allCourses,
        enrolledCourseCodes
      }
    });

  } catch (error: any) {
    console.error("Course Planner API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
      where: { userId: payload.userId }
    });

    if (!student) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { courseCode, courseName, credits, semester } = body;

    // Parse semester string "2567/1" -> year=2567, semester=1
    const [yearStr, semStr] = (semester || "2567/1").split("/");
    const plannedYear = parseInt(yearStr) || 2567;
    const plannedSemester = parseInt(semStr) || 1;

    // Find or check if the course exists
    let course = await prisma.course.findUnique({
      where: { code: courseCode }
    });

    if (!course) {
      return NextResponse.json({ message: "ไม่พบรหัสวิชานี้ในระบบ" }, { status: 404 });
    }

    // Create plan entry
    const plan = await prisma.coursePlan.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        plannedSemester,
        plannedYear,
        status: "planned"
      },
      include: { course: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: String(plan.id),
        code: plan.course.code,
        name: plan.course.name,
        credits: plan.course.credits,
        semester: `${plannedYear}/${plannedSemester}`,
        status: "planned"
      }
    });

  } catch (error: any) {
    console.error("Course Planner POST Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("id");

    if (!planId) {
      return NextResponse.json({ message: "Missing plan ID" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: payload.userId }
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Verify ownership
    const plan = await prisma.coursePlan.findFirst({
      where: { id: parseInt(planId), studentId: student.id }
    });

    if (!plan) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    await prisma.coursePlan.delete({
      where: { id: plan.id }
    });

    return NextResponse.json({ success: true, message: "ลบวิชาออกจากแผนสำเร็จ" });

  } catch (error: any) {
    console.error("Course Planner DELETE Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
