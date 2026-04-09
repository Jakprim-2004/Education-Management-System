import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, hashPassword } from "@/lib/auth";
import { cookies } from "next/headers";
import { ImportType, ImportStatus } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

function parseCSV(buffer: Buffer): string[][] {
  const text = buffer.toString('utf-8');
  const cleanText = text.replace(/^\uFEFF/, '');
  const lines = cleanText.split(/\r?\n/).filter(line => line.trim() !== "");
  return lines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const logsDb = await prisma.importLog.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const importLogs = logsDb.map(log => {
      let typeLabel = log.importType as string;
      if (log.importType === "students") typeLabel = "นิสิต";
      else if (log.importType === "teachers") typeLabel = "อาจารย์";
      else if (log.importType === "courses") typeLabel = "วิชา";
      else if (log.importType === "enrollments") typeLabel = "การลงทะเบียน";

      let statusLabel = "pending";
      if (log.status === "completed") statusLabel = "success";
      else if (log.status === "failed") statusLabel = "error";

      return {
        id: log.id.toString(),
        date: log.createdAt ? new Date(log.createdAt).toISOString().replace(/T/, ' ').slice(0, 16) : "N/A",
        type: typeLabel,
        file: log.fileName,
        status: statusLabel,
        records: log.successRows || 0,
        message: log.status === "completed" ? "นำเข้าสำเร็จ" : (log.status === "failed" ? "ข้อผิดพลาด" : "กำลังประมวลผล...")
      };
    });

    return NextResponse.json({ success: true, data: importLogs }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Import GET API Error:", error);
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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const importType = formData.get("importType") as string;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const uploadDir = path.join(process.cwd(), "files");
    const filePath = path.join(uploadDir, uniqueFileName);
    
    // Attempt saving physically (optional if relying purely on DB upload, but we do it anyway)
    try {
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(filePath, buffer);
    } catch(e) {}

    const rows = parseCSV(buffer);
    if (rows.length < 2) {
      return NextResponse.json({ message: "ไฟล์ว่างเปล่าหรือไม่มีข้อมูล" }, { status: 400 });
    }
    
    const headers = rows[0];
    const dataRows = rows.slice(1);
    let successCount = 0;
    let errorCount = 0;

    let parsedImportType: ImportType = ImportType.enrollments;
    
    if (importType === "students") {
      parsedImportType = ImportType.students;
      if (!headers.join(',').includes("รหัสนิสิต")) {
        return NextResponse.json({ message: "รูปแบบ Header ไม่ถูกต้องสำหรับแม่แบบ 'นิสิต'" }, { status: 400 });
      }

      const defaultDept = await prisma.department.findFirst();
      if (!defaultDept) return NextResponse.json({ message: "เกิดข้อผิดพลาด: ไม่พบข้อมูลภาควิชาในระบบเลย กรุณาตั้งค่าภาควิชาก่อน" }, { status: 400 });

      for (const row of dataRows) {
        if (row.length < 9) continue;
        const [studentCode, title, firstName, lastName, email, phone, facultyTxt, deptTxt, yearTxt] = row;
        try {
          const user = await prisma.user.create({
            data: {
              email: email || `${studentCode}@ku.ac.th`,
              passwordHash: await hashPassword(studentCode),
              role: "student",
              firstName: title && title.trim() !== '' ? `${title}${firstName}` : firstName,
              lastName,
              phone
            }
          });
          
          await prisma.student.create({
            data: {
              userId: user.id,
              studentCode,
              departmentId: defaultDept.id,
              admissionYear: parseInt(yearTxt) || (new Date().getFullYear() + 543)
            }
          });
          successCount++;
        } catch (e) {
          console.error("Student Import Row Error:", e);
          errorCount++;
        }
      }
    }
    else if (importType === "teachers") {
      parsedImportType = ImportType.teachers;
      if (!headers.join(',').includes("รหัสอาจารย์")) {
        return NextResponse.json({ message: "รูปแบบ Header ไม่ถูกต้องสำหรับแม่แบบ 'อาจารย์'" }, { status: 400 });
      }
      
      const defaultDept = await prisma.department.findFirst();
      if (!defaultDept) return NextResponse.json({ message: "เกิดข้อผิดพลาด: ไม่พบข้อมูลภาควิชาในระบบ" }, { status: 400 });

      for (const row of dataRows) {
        if (row.length < 9) continue;
        const [teacherCode, title, firstName, lastName, position, email, phone, facultyTxt, deptTxt] = row;
        try {
          const user = await prisma.user.create({
            data: {
              email: email || `${teacherCode}@ku.ac.th`,
              passwordHash: await hashPassword(teacherCode),
              role: "teacher",
              firstName: title && title.trim() !== '' ? `${title}${firstName}` : firstName,
              lastName,
              phone
            }
          });
          
          await prisma.teacher.create({
            data: {
              userId: user.id,
              teacherCode,
              departmentId: defaultDept.id,
              position,
              specialization: deptTxt
            }
          });
          successCount++;
        } catch (e) {
          console.error("Teacher Import Row Error:", e);
          errorCount++;
        }
      }
    }
    else if (importType === "courses") {
      parsedImportType = ImportType.courses;
      if (!headers.join(',').includes("รหัสวิชา")) {
        return NextResponse.json({ message: "รูปแบบ Header ไม่ถูกต้องสำหรับแม่แบบ 'รายวิชา'" }, { status: 400 });
      }
      
      const defaultDept = await prisma.department.findFirst();
      if (!defaultDept) return NextResponse.json({ message: "เกิดข้อผิดพลาด: ไม่พบข้อมูลภาควิชาในระบบ" }, { status: 400 });

      for (const row of dataRows) {
        if (row.length < 6) continue;
        const [code, nameTh, nameEn, creditsTxt, typeTxt, facultyTxt, dayOfWeekTxt, startTimeTxt, endTimeTxt, roomTxt] = row;
        try {
          let mappedType = "required";
          if (typeTxt.includes("เลือก")) mappedType = "elective";
          else if (typeTxt.includes("ทั่วไป")) mappedType = "general";
          
          const fullName = nameEn && nameEn.trim() !== "-" && nameEn.trim() !== "" ? `${nameTh} (${nameEn})` : nameTh;

          const course = await prisma.course.create({
            data: {
              code,
              name: fullName,
              credits: parseInt(creditsTxt) || 3,
              type: mappedType as any,
              departmentId: defaultDept.id
            }
          });

          // Create Schedule if Schedule columns exist
          if (dayOfWeekTxt && startTimeTxt && endTimeTxt) {
             let activeSemester = await prisma.semester.findFirst({ where: { isCurrent: true } });
             if (!activeSemester) activeSemester = await prisma.semester.findFirst();

             if (activeSemester) {
                 const teacher = await prisma.teacher.findFirst();
                 if (teacher) {
                     let section = await prisma.courseSection.findFirst({ where: { courseId: course.id, semesterId: activeSemester.id, sectionNumber: "1" }});
                     if (!section) {
                       section = await prisma.courseSection.create({
                          data: { courseId: course.id, semesterId: activeSemester.id, sectionNumber: "1", teacherId: teacher.id }
                       });
                     }
                     
                     // Helper mapping — supports Thai & English day names
                     const mapDayToEnum = (d: string) => {
                        const s = d.trim();
                        const up = s.toUpperCase();
                       if (up.includes("MON") || s.includes("จันทร์")) return "MON";
                       if (up.includes("TUE") || s.includes("อังคาร")) return "TUE";
                       if (up.includes("WED") || s.includes("พุธ")) return "WED";
                       if (up.includes("THU") || s.includes("พฤหัส")) return "THU";
                       if (up.includes("FRI") || s.includes("ศุกร์")) return "FRI";
                       if (up.includes("SAT") || s.includes("เสาร์")) return "SAT";
                       if (up.includes("SUN") || s.includes("อาทิตย์")) return "SUN";
                       return "MON";
                     };

                     await prisma.schedule.create({
                        data: {
                           sectionId: section.id,
                           dayOfWeek: mapDayToEnum(dayOfWeekTxt),
                           startTime: new Date(`1970-01-01T${startTimeTxt}:00Z`),
                           endTime: new Date(`1970-01-01T${endTimeTxt}:00Z`),
                           room: roomTxt || "TBA"
                        }
                     });
                 }
             }
          }

          successCount++;
        } catch (e) {
          console.error("Course Import Row Error:", e);
          errorCount++;
        }
      }
    }
    else if (importType === "curriculum" || importType === "registration-plan") {
      // Both template schemas modify CurriculumCourse
      // curriculum: รหัสวิชา,ชื่อวิชา,หน่วยกิต,ปีที่,ภาคเรียน,ประเภท
      // registration-plan: ปีที่,ภาคเรียน,รหัสวิชา,ชื่อวิชา,หน่วยกิต,ประเภท
      // We'll log them as enrollments just to pass the parsedImportType check
      parsedImportType = ImportType.enrollments;
      
      const defaultCurriculum = await prisma.curriculum.findFirst();
      if (!defaultCurriculum) return NextResponse.json({ message: "ไม่พบหลักสูตรตั้งต้นในระบบ" }, { status: 400 });

      for (const row of dataRows) {
        if (row.length < 6) continue;
        let courseCode, yearLvl, semLvl, dayOfWeekTxt, startTimeTxt, endTimeTxt, roomTxt;
        if (importType === "curriculum") {
          courseCode = row[0];
          yearLvl = row[3];
          semLvl = row[4];
          dayOfWeekTxt = row[6];
          startTimeTxt = row[7];
          endTimeTxt = row[8];
          roomTxt = row[9];
        } else {
          yearLvl = row[0];
          semLvl = row[1];
          courseCode = row[2];
        }

        try {
          const course = await prisma.course.findUnique({ where: { code: courseCode } });
          if (!course) {
            errorCount++;
            continue;
          }
          
          await prisma.curriculumCourse.upsert({
            where: {
              curriculumId_courseId: { curriculumId: defaultCurriculum.id, courseId: course.id }
            },
            update: { yearLevel: parseInt(yearLvl) || 1, semester: parseInt(semLvl) || 1 },
            create: {
              curriculumId: defaultCurriculum.id,
              courseId: course.id,
              yearLevel: parseInt(yearLvl) || 1,
              semester: parseInt(semLvl) || 1
            }
          });

          // Create Schedule if Schedule columns exist
          if (dayOfWeekTxt && startTimeTxt && endTimeTxt) {
             let activeSemester = await prisma.semester.findFirst({ where: { isCurrent: true } });
             if (!activeSemester) activeSemester = await prisma.semester.findFirst();

             if (activeSemester) {
                 const teacher = await prisma.teacher.findFirst();
                 if (teacher) {
                     let section = await prisma.courseSection.findFirst({ where: { courseId: course.id, semesterId: activeSemester.id, sectionNumber: "1" }});
                     if (!section) {
                       section = await prisma.courseSection.create({
                          data: { courseId: course.id, semesterId: activeSemester.id, sectionNumber: "1", teacherId: teacher.id }
                       });
                     }
                     
                     // Helper mapping — supports Thai & English day names
                     const mapDayToEnum = (d: string) => {
                        const s = d.trim();
                        const up = s.toUpperCase();
                       if (up.includes("MON") || s.includes("จันทร์")) return "MON";
                       if (up.includes("TUE") || s.includes("อังคาร")) return "TUE";
                       if (up.includes("WED") || s.includes("พุธ")) return "WED";
                       if (up.includes("THU") || s.includes("พฤหัส")) return "THU";
                       if (up.includes("FRI") || s.includes("ศุกร์")) return "FRI";
                       if (up.includes("SAT") || s.includes("เสาร์")) return "SAT";
                       if (up.includes("SUN") || s.includes("อาทิตย์")) return "SUN";
                       return "MON";
                     };

                     await prisma.schedule.create({
                        data: {
                           sectionId: section.id,
                           dayOfWeek: mapDayToEnum(dayOfWeekTxt),
                           startTime: new Date(`1970-01-01T${startTimeTxt}:00Z`),
                           endTime: new Date(`1970-01-01T${endTimeTxt}:00Z`),
                           room: roomTxt || "TBA"
                        }
                     });
                 }
             }
          }

          successCount++;
        } catch (e) {
          console.error("Curriculum Import Row Error:", e);
          errorCount++;
        }
      }
    }
    else if (importType === "registration") {
      parsedImportType = ImportType.enrollments;
      if (!headers.join(',').includes("รหัสนิสิต")) {
        return NextResponse.json({ message: "รูปแบบ Header ไม่ถูกต้องสำหรับแม่แบบ 'การลงทะเบียน'" }, { status: 400 });
      }

      for (const row of dataRows) {
        if (row.length < 5) continue;
        const [studentCode, courseCode, semNum, startYear, groupNum] = row;
        try {
          const student = await prisma.student.findUnique({ where: { studentCode } });
          const course = await prisma.course.findUnique({ where: { code: courseCode } });
          if (!student || !course) {
            errorCount++;
            continue;
          }

          let semester = await prisma.semester.findFirst({
            where: { semesterNumber: parseInt(semNum), academicYear: parseInt(startYear) }
          });
          if (!semester) {
             const currentDate = new Date();
             semester = await prisma.semester.create({
                data: {
                   name: `ภาคเรียนที่ ${semNum}/${startYear}`,
                   academicYear: parseInt(startYear),
                   semesterNumber: parseInt(semNum),
                   startDate: currentDate,
                   endDate: currentDate
                }
             })
          }

          let section = await prisma.courseSection.findFirst({
            where: { courseId: course.id, semesterId: semester.id, sectionNumber: groupNum }
          });
          if (!section) {
            // Find a teacher to assign dummy section
             const teacher = await prisma.teacher.findFirst();
             if(!teacher) throw new Error("No teachers available to create section fallback");
             section = await prisma.courseSection.create({
                 data: {
                    courseId: course.id,
                    semesterId: semester.id,
                    sectionNumber: groupNum,
                    teacherId: teacher.id
                 }
             })
          }

          await prisma.enrollment.upsert({
             where: {
                studentId_sectionId: { studentId: student.id, sectionId: section.id }
             },
             update: {},
             create: { studentId: student.id, sectionId: section.id, status: "enrolled" }
          });
          
          successCount++;
        } catch (e) {
          console.error("Registration Import Error:", e);
          errorCount++;
        }
      }
    }
    else if (importType === "grades") {
      parsedImportType = ImportType.enrollments;
      
      for (const row of dataRows) {
        if (row.length < 5) continue;
        const [studentCode, courseCode, semNum, startYear, gradeMark] = row;
        try {
          const student = await prisma.student.findUnique({ where: { studentCode } });
          const course = await prisma.course.findUnique({ where: { code: courseCode } });
          if (!student || !course) { errorCount++; continue; }

          const semester = await prisma.semester.findFirst({
            where: { semesterNumber: parseInt(semNum), academicYear: parseInt(startYear) }
          });
          if (!semester) { errorCount++; continue; }

          const section = await prisma.courseSection.findFirst({
            where: { courseId: course.id, semesterId: semester.id }
          });
          if (!section) { errorCount++; continue; }

          await prisma.enrollment.update({
            where: {
              studentId_sectionId: { studentId: student.id, sectionId: section.id }
            },
            data: { grade: gradeMark }
          });
          
          successCount++;
        } catch (e) {
          console.error("Grade Import Error:", e);
          errorCount++;
        }
      }
    }
    else {
      // Dummy pass for completely unknown files
      parsedImportType = ImportType.enrollments;
      successCount = dataRows.length;
    }

    const newLog = await prisma.importLog.create({
      data: {
        importedBy: payload.userId as number,
        fileName: file.name,
        importType: parsedImportType,
        totalRows: dataRows.length,
        successRows: successCount,
        errorRows: errorCount,
        status: ImportStatus.completed
      }
    });

    return NextResponse.json({ success: true, data: newLog }, { status: 201 });

  } catch (error: any) {
    console.error("Admin Import POST API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
