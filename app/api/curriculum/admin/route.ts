import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { CourseType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const searchParams = request.nextUrl.searchParams;
    const deptParam = searchParams.get("departmentId");
    
    // Fallback to department ID 1 if not specified
    let departmentId = deptParam ? parseInt(deptParam) : undefined;
    
    if (!departmentId) {
      const firstDept = await prisma.department.findFirst();
      if (!firstDept) {
        return NextResponse.json({ success: true, data: { plans: [], department: null } }, { status: 200 });
      }
      departmentId = firstDept.id;
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    const curriculum = await prisma.curriculum.findFirst({
      where: { 
        departmentId: departmentId,
        status: "active"
      },
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

    if (!curriculum) {
       return NextResponse.json({ 
        success: true, 
        data: { 
          plans: [], 
          department: department?.name || "ไม่ระบุภาควิชา" 
        } 
      }, { status: 200 });
    }

    // Group into semesters
    const plansMap = new Map();

    for (const curCourse of (curriculum as any).curriculumCourses) {
      if (!curCourse.yearLevel || !curCourse.semester) continue;
      
      const key = `${curCourse.yearLevel}-${curCourse.semester}`;
      if (!plansMap.has(key)) {
        plansMap.set(key, {
          year: curCourse.yearLevel,
          semester: curCourse.semester,
          courses: []
        });
      }
      
      const plan = plansMap.get(key);
      
      let typeLabel = "วิชาเลือกเสรี";
      switch (curCourse.course.type) {
        case CourseType.required: typeLabel = "วิชาบังคับ"; break;
        case CourseType.elective: typeLabel = "วิชาเลือก"; break;
        case CourseType.general: typeLabel = "วิชาศึกษาทั่วไป"; break;
      }
      
      plan.courses.push({
        id: curCourse.id.toString(),
        code: curCourse.course.code,
        name: curCourse.course.name,
        credits: curCourse.course.credits,
        type: typeLabel,
        prerequisite: undefined // No prerequisite field directly on Course without mapping table
      });
    }

    const plans = Array.from(plansMap.values());
    
    // Sort plans by year then semester
    plans.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.semester - b.semester;
    });

    return NextResponse.json({ 
      success: true, 
      data: { 
        plans, 
        department: department?.name || "ไม่ระบุภาควิชา" 
      } 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Curriculum GET API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const plans = body.plans || [];

    // Find first active curriculum
    const firstDept = await prisma.department.findFirst();
    if (!firstDept) {
      return NextResponse.json({ message: "No department found" }, { status: 400 });
    }

    let curriculum = await prisma.curriculum.findFirst({
      where: { departmentId: firstDept.id, status: "active" }
    });

    if (!curriculum) {
      // Create one if none exists
      curriculum = await prisma.curriculum.create({
        data: {
          name: "หลักสูตรปกติ",
          year: new Date().getFullYear(),
          totalCredits: 120,
          departmentId: firstDept.id,
          status: "active"
        }
      });
    }

    // Process all courses first to ensure they exist
    for (const plan of plans) {
       for (const course of plan.courses) {
         let dbType: CourseType = CourseType.required;
         if (course.type === "วิชาเลือก") dbType = CourseType.elective;
         if (course.type === "วิชาศึกษาทั่วไป") dbType = CourseType.general;
         
         await prisma.course.upsert({
           where: { code: course.code },
           update: {
             name: course.name,
             credits: course.credits || 3,
             type: dbType,
           },
           create: {
             code: course.code,
             name: course.name,
             credits: course.credits || 3,
             type: dbType,
             departmentId: firstDept.id,
             description: "ระบุอัตโนมัติจากหลักสูตร"
           }
         });
       }
    }

    // Delete existing curriculum courses mapping
    await prisma.curriculumCourse.deleteMany({
      where: { curriculumId: curriculum.id }
    });

    // Rebuild mapping
    for (const plan of plans) {
       for (const course of plan.courses) {
          const dbCourse = await prisma.course.findUnique({
            where: { code: course.code }
          });
          if (dbCourse) {
             await prisma.curriculumCourse.create({
               data: {
                 curriculumId: curriculum.id,
                 courseId: dbCourse.id,
                 semester: plan.semester,
                 yearLevel: plan.year
               }
             });
          }
       }
    }

    return NextResponse.json({ success: true, message: "Curriculum saved successfully" });

  } catch (error: any) {
    console.error("Admin Curriculum POST API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

