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
        coursePlans: {
          include: { course: true },
          orderBy: [{ plannedYear: "asc" }, { plannedSemester: "asc" }],
        },
        enrollments: {
          include: {
            section: { include: { course: true, semester: true } },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    // Find the curriculum for this student's department
    const curriculum = await prisma.curriculum.findFirst({
      where: { departmentId: student.departmentId },
      include: {
        curriculumCourses: {
          include: { course: true },
          orderBy: [{ yearLevel: "asc" }, { semester: "asc" }],
        },
      },
    });

    // Build completed/enrolled course sets
    const completedCourseIds = new Set(
      student.enrollments
        .filter((e: any) => e.grade && e.grade !== "F")
        .map((e: any) => e.section.courseId)
    );
    const enrolledCourseIds = new Set(
      student.enrollments.map((e: any) => e.section.courseId)
    );

    // Build required courses from curriculum (grouped by year/semester)
    const requiredCourses: any[] = [];
    if (curriculum) {
      for (const cc of curriculum.curriculumCourses) {
        const course = cc.course;
        let status: "completed" | "in-progress" | "planned" = "planned";
        if (completedCourseIds.has(course.id)) status = "completed";
        else if (enrolledCourseIds.has(course.id)) status = "in-progress";

        requiredCourses.push({
          id: `req-${cc.id}`,
          courseId: course.id,
          code: course.code,
          name: course.name,
          credits: course.credits,
          type: course.type, // required | elective | general
          yearLevel: cc.yearLevel || 1,
          semester: cc.semester || 1,
          status,
          isRequired: true, // can't delete
        });
      }
    }

    // Build custom planned courses (elective/general added by student)
    const customCourses: any[] = student.coursePlans.map((plan: any) => {
      let status: "completed" | "in-progress" | "planned" =
        (plan.status as any) || "planned";
      if (completedCourseIds.has(plan.courseId)) status = "completed";
      else if (enrolledCourseIds.has(plan.courseId)) status = "in-progress";

      return {
        id: `plan-${plan.id}`,
        courseId: plan.courseId,
        code: plan.course.code,
        name: plan.course.name,
        credits: plan.course.credits,
        type: plan.course.type,
        yearLevel: plan.plannedYear,
        semester: plan.plannedSemester,
        status,
        isRequired: false, // can delete
      };
    });

    // Merge and deduplicate (custom overrides required if same course)
    const requiredCourseIds = new Set(requiredCourses.map((c) => c.courseId));
    const filteredCustom = customCourses.filter(
      (c) => !requiredCourseIds.has(c.courseId)
    );
    const allCourses = [...requiredCourses, ...filteredCustom];

    // Determine max year levels
    const maxYear = Math.max(
      4,
      ...allCourses.map((c) => c.yearLevel)
    );

    // Fetch elective/general courses for "add" autocomplete
    const availableCourses = await prisma.course.findMany({
      where: {
        type: { in: ["elective", "general"] },
      },
      select: { id: true, code: true, name: true, credits: true, type: true },
      orderBy: { code: "asc" },
    });

    // Also include required courses not in curriculum
    const allAvailable = await prisma.course.findMany({
      select: { id: true, code: true, name: true, credits: true, type: true },
      orderBy: { code: "asc" },
    });

    // Filter out courses already in the plan
    const plannedCourseIds = new Set(allCourses.map((c) => c.courseId));
    const addableCourses = allAvailable.filter(
      (c) => !plannedCourseIds.has(c.id)
    );

    return NextResponse.json({
      success: true,
      data: {
        courses: allCourses,
        maxYear,
        addableCourses,
        curriculumName: curriculum?.name || null,
      },
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
      where: { userId: payload.userId },
    });

    if (!student) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { courseCode, yearLevel, semester } = body;

    const course = await prisma.course.findUnique({
      where: { code: courseCode },
    });

    if (!course) {
      return NextResponse.json({ message: "ไม่พบรหัสวิชานี้ในระบบ" }, { status: 404 });
    }

    // Check duplicate
    const existing = await prisma.coursePlan.findFirst({
      where: { studentId: student.id, courseId: course.id },
    });
    if (existing) {
      return NextResponse.json({ message: "วิชานี้อยู่ในแผนแล้ว" }, { status: 400 });
    }

    const plan = await prisma.coursePlan.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        plannedSemester: parseInt(semester) || 1,
        plannedYear: parseInt(yearLevel) || 1,
        status: "planned",
      },
      include: { course: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: `plan-${plan.id}`,
        code: plan.course.code,
        name: plan.course.name,
        credits: plan.course.credits,
        type: plan.course.type,
        yearLevel: plan.plannedYear,
        semester: plan.plannedSemester,
        status: "planned",
        isRequired: false,
      },
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
    const rawId = searchParams.get("id"); // "plan-123"

    if (!rawId || !rawId.startsWith("plan-")) {
      return NextResponse.json({ message: "ไม่สามารถลบวิชาบังคับได้" }, { status: 400 });
    }

    const planId = parseInt(rawId.replace("plan-", ""));

    const student = await prisma.student.findUnique({
      where: { userId: payload.userId },
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    const plan = await prisma.coursePlan.findFirst({
      where: { id: planId, studentId: student.id },
    });

    if (!plan) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 });
    }

    await prisma.coursePlan.delete({ where: { id: plan.id } });

    return NextResponse.json({ success: true, message: "ลบวิชาออกจากแผนสำเร็จ" });
  } catch (error: any) {
    console.error("Course Planner DELETE Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
