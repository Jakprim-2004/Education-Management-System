import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("🌱 เริ่ม Seed ข้อมูลใหม่ทั้งหมด...");

  // ========== ลบข้อมูลเก่าทั้งหมด (ตามลำดับ FK) ==========
  await prisma.coursePrerequisite.deleteMany();
  await prisma.coursePlan.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.makeupClass.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.courseSection.deleteMany();
  await prisma.curriculumCourse.deleteMany();
  await prisma.curriculum.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.importLog.deleteMany();
  await prisma.oTPVerification.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.course.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ ลบข้อมูลเก่าเรียบร้อย");

  // ========== 1. Faculty & Department ==========
  const faculty = await prisma.faculty.create({
    data: { name: "คณะวิศวกรรมศาสตร์ กำแพงแสน", code: "ENG" },
  });
  const dept = await prisma.department.create({
    data: { facultyId: faculty.id, name: "ภาควิชาวิศวกรรมคอมพิวเตอร์", code: "CPE" },
  });
  console.log("✅ Faculty & Department");

  // ========== 2. Users — Password ทุกคน = "password" ==========
  const pw = await hashPassword("password");

  // --- Admin ---
  const adminUser = await prisma.user.create({
    data: { email: "admin@ku.ac.th", passwordHash: pw, role: "admin", firstName: "แอดมิน", lastName: "ระบบ", phone: "0800000000" },
  });

  // --- Teachers (5 คน) ---
  const teacherData = [
    { email: "teacher@ku.ac.th", firstName: "ผศ.ดร.สมศักดิ์", lastName: "สอนเก่ง", phone: "0898765432", code: "T001", position: "ผู้ช่วยศาสตราจารย์", spec: "วิศวกรรมซอฟต์แวร์" },
    { email: "teacher2@ku.ac.th", firstName: "รศ.ดร.วิภา", lastName: "ปัญญาดี", phone: "0876543210", code: "T002", position: "รองศาสตราจารย์", spec: "ปัญญาประดิษฐ์" },
    { email: "teacher3@ku.ac.th", firstName: "อ.ดร.กิตติ", lastName: "เชี่ยวชาญ", phone: "0856781234", code: "T003", position: "อาจารย์", spec: "เครือข่ายและความมั่นคง" },
    { email: "teacher4@ku.ac.th", firstName: "ผศ.ดร.นภา", lastName: "สว่างจิต", phone: "0845671234", code: "T004", position: "ผู้ช่วยศาสตราจารย์", spec: "ฐานข้อมูลและคลาวด์" },
    { email: "teacher5@ku.ac.th", firstName: "อ.ดร.ธนา", lastName: "ก้าวหน้า", phone: "0834561234", code: "T005", position: "อาจารย์", spec: "ระบบสมองกลฝังตัวและ IoT" },
  ];
  const teachers: any[] = [];
  for (const t of teacherData) {
    const user = await prisma.user.create({
      data: { email: t.email, passwordHash: pw, role: "teacher", firstName: t.firstName, lastName: t.lastName, phone: t.phone },
    });
    const teacher = await prisma.teacher.create({
      data: { userId: user.id, teacherCode: t.code, departmentId: dept.id, position: t.position, specialization: t.spec },
    });
    teachers.push(teacher);
  }
  console.log("✅ Teachers (5 คน)");

  // --- Students (5 demo accounts: year1-5) ---
  const studentData = [
    { email: "year1@ku.ac.th", code: "6810450001", firstName: "ปวีณ", lastName: "สดใส", admission: 2568, phone: "0911111111" },
    { email: "year2@ku.ac.th", code: "6710450001", firstName: "กมลชนก", lastName: "ขยันเรียน", admission: 2567, phone: "0922222222" },
    { email: "year3@ku.ac.th", code: "6610450001", firstName: "วิชัย", lastName: "พากเพียร", admission: 2566, phone: "0933333333" },
    { email: "year4@ku.ac.th", code: "6510450001", firstName: "สมชาย", lastName: "เรียนดี", admission: 2565, phone: "0944444444" },
    { email: "year5@ku.ac.th", code: "6410450001", firstName: "อนุชา", lastName: "รุ่นพี่", admission: 2564, phone: "0955555555" },
    // เก็บ legacy accounts ไว้ด้วย
    { email: "student@ku.ac.th", code: "6510450099", firstName: "นิสิต", lastName: "ทดสอบ", admission: 2565, phone: "0812345678" },
  ];
  const students: any[] = [];
  for (const s of studentData) {
    const user = await prisma.user.create({
      data: { email: s.email, passwordHash: pw, role: "student", firstName: s.firstName, lastName: s.lastName, phone: s.phone },
    });
    const student = await prisma.student.create({
      data: { userId: user.id, studentCode: s.code, departmentId: dept.id, admissionYear: s.admission, status: "active" },
    });
    students.push({ ...student, admissionYear: s.admission, label: s.email });
  }
  console.log("✅ Students (6 คน — 5 demo + 1 legacy)");

  // ========== 3. Semesters (ย้อนหลัง 5 ปี) ==========
  const semesterRecords: any[] = [];
  const semesterYears = [2564, 2565, 2566, 2567, 2568];
  for (const y of semesterYears) {
    const calYear = y - 543; // พ.ศ. → ค.ศ.
    const s1 = await prisma.semester.create({
      data: {
        name: `ภาคเรียนที่ 1/${y}`,
        academicYear: y,
        semesterNumber: 1,
        startDate: new Date(`${calYear}-06-15`),
        endDate: new Date(`${calYear}-10-15`),
        isCurrent: false,
      },
    });
    const s2 = await prisma.semester.create({
      data: {
        name: `ภาคเรียนที่ 2/${y}`,
        academicYear: y,
        semesterNumber: 2,
        startDate: new Date(`${calYear + 1}-01-05`),
        endDate: new Date(`${calYear + 1}-05-15`),
        isCurrent: y === 2568, // 2/2568 = current
      },
    });
    semesterRecords.push(s1, s2);
  }
  // Quick lookup: semesterRecords[idx] where idx = (yearIdx * 2) + (semNum - 1)
  function findSemester(academicYear: number, semNum: number) {
    return semesterRecords.find((s) => s.academicYear === academicYear && s.semesterNumber === semNum);
  }
  console.log("✅ Semesters (10 เทอม: 1/2564 — 2/2568)");

  // ========== 4. Courses (~45 วิชา) ==========
  interface CourseInput {
    code: string;
    name: string;
    credits: number;
    type: "required" | "elective" | "general";
    desc?: string;
  }

  const courseInputs: CourseInput[] = [
    // --- วิชาศึกษาทั่วไป (GE) ---
    { code: "01999111", name: "ภาษาอังกฤษ 1 (English I)", credits: 3, type: "general" },
    { code: "01999112", name: "ภาษาอังกฤษ 2 (English II)", credits: 3, type: "general" },
    { code: "01999211", name: "ภาษาอังกฤษ 3 (English III)", credits: 3, type: "general" },
    { code: "01355101", name: "มนุษย์กับสังคม (Man and Society)", credits: 3, type: "general" },
    { code: "01175111", name: "กีฬาเพื่อสุขภาพ (Sports for Health)", credits: 1, type: "general" },

    // --- วิชาพื้นฐานวิทย์-คณิต ---
    { code: "01417111", name: "แคลคูลัส 1 (Calculus I)", credits: 3, type: "required" },
    { code: "01417112", name: "แคลคูลัส 2 (Calculus II)", credits: 3, type: "required" },
    { code: "01417211", name: "สมการเชิงอนุพันธ์ (Differential Equations)", credits: 3, type: "required" },
    { code: "01420111", name: "ฟิสิกส์ 1 (Physics I)", credits: 3, type: "required" },
    { code: "01420112", name: "ฟิสิกส์ 2 (Physics II)", credits: 3, type: "required" },
    { code: "01422111", name: "สถิติวิศวกรรม (Engineering Statistics)", credits: 3, type: "required" },

    // --- วิชาแกนวิศวกรรม ---
    { code: "01418111", name: "คอมพิวเตอร์เบื้องต้น (Intro to Computer)", credits: 3, type: "required" },
    { code: "01418112", name: "การเขียนโปรแกรมภาษาซี (C Programming)", credits: 3, type: "required" },
    { code: "01418113", name: "คณิตศาสตร์ไม่ต่อเนื่อง (Discrete Mathematics)", credits: 3, type: "required" },
    { code: "01418114", name: "การเขียนโปรแกรมเชิงวัตถุ (Object-Oriented Programming)", credits: 3, type: "required" },

    // --- วิชาบังคับ CPE ปี 2-3 ---
    { code: "01418221", name: "โครงสร้างข้อมูล (Data Structures)", credits: 3, type: "required" },
    { code: "01418222", name: "การออกแบบวงจรดิจิทัล (Digital Logic Design)", credits: 3, type: "required" },
    { code: "01418223", name: "สถาปัตยกรรมคอมพิวเตอร์ (Computer Architecture)", credits: 3, type: "required" },
    { code: "01418231", name: "ระบบปฏิบัติการ (Operating Systems)", credits: 3, type: "required" },
    { code: "01418232", name: "การวิเคราะห์ขั้นตอนวิธี (Algorithm Analysis)", credits: 3, type: "required" },
    { code: "01418233", name: "ภาษาโปรแกรมเชิงฟังก์ชัน (Functional Programming)", credits: 3, type: "required" },

    // --- วิชาบังคับ CPE ปี 3-4 ---
    { code: "01418321", name: "วิศวกรรมซอฟต์แวร์ (Software Engineering)", credits: 3, type: "required" },
    { code: "01418331", name: "ฐานข้อมูล (Database Systems)", credits: 3, type: "required" },
    { code: "01418332", name: "เครือข่ายคอมพิวเตอร์ (Computer Networks)", credits: 3, type: "required" },
    { code: "01418341", name: "ปัญญาประดิษฐ์ (Artificial Intelligence)", credits: 3, type: "required" },
    { code: "01418351", name: "คอมไพเลอร์ (Compiler Design)", credits: 3, type: "required" },
    { code: "01418390", name: "สัมมนา (Seminar)", credits: 1, type: "required" },
    { code: "01418490", name: "โครงงานวิศวกรรมคอมพิวเตอร์ 1 (Senior Project I)", credits: 1, type: "required" },
    { code: "01418491", name: "โครงงานวิศวกรรมคอมพิวเตอร์ 2 (Senior Project II)", credits: 2, type: "required" },

    // --- วิชาเลือก (ทั้ง 2 หลักสูตร) ---
    { code: "01418442", name: "การเรียนรู้ของเครื่อง (Machine Learning)", credits: 3, type: "elective" },
    { code: "01418443", name: "ระบบสมองกลฝังตัว (Embedded Systems)", credits: 3, type: "elective" },
    { code: "01418444", name: "การพัฒนาแอปมือถือ (Mobile App Development)", credits: 3, type: "elective" },
    { code: "01418445", name: "ความมั่นคงไซเบอร์ (Cybersecurity)", credits: 3, type: "elective" },
    { code: "01418446", name: "อินเทอร์เน็ตของสรรพสิ่ง (IoT)", credits: 3, type: "elective" },
    { code: "01418447", name: "คอมพิวเตอร์กราฟิกส์ (Computer Graphics)", credits: 3, type: "elective" },

    // --- เฉพาะหลักสูตร 60 (ไม่มีในหลักสูตร 65) ---
    { code: "01418224", name: "ภาษาแอสเซมบลี (Assembly Language)", credits: 3, type: "required" },
    { code: "01418322", name: "การทดสอบซอฟต์แวร์ (Software Testing)", credits: 3, type: "required" },

    // --- เฉพาะหลักสูตร 65 (ใหม่) ---
    { code: "01418361", name: "DevOps และ CI/CD (DevOps & CI/CD)", credits: 3, type: "required" },
    { code: "01418362", name: "วิทยาการข้อมูลเบื้องต้น (Data Science Fundamentals)", credits: 3, type: "required" },
    { code: "01418448", name: "การประมวลผลบนคลาวด์ (Cloud Computing)", credits: 3, type: "elective" },
    { code: "01418449", name: "การพัฒนาเว็บสมัยใหม่ (Modern Web Development)", credits: 3, type: "elective" },
  ];

  const courses: Record<string, any> = {};
  for (const c of courseInputs) {
    const course = await prisma.course.create({
      data: {
        code: c.code,
        name: c.name,
        credits: c.credits,
        type: c.type,
        departmentId: dept.id,
        description: c.desc || null,
      },
    });
    courses[c.code] = course;
  }
  console.log(`✅ Courses (${Object.keys(courses).length} วิชา)`);

  // ========== 5. Curriculums (60 & 65) ==========
  const curriculum60 = await prisma.curriculum.create({
    data: { name: "หลักสูตรวิศวกรรมคอมพิวเตอร์ 2560", departmentId: dept.id, year: 2560, totalCredits: 140, status: "active" },
  });
  const curriculum65 = await prisma.curriculum.create({
    data: { name: "หลักสูตรวิศวกรรมคอมพิวเตอร์ 2565", departmentId: dept.id, year: 2565, totalCredits: 135, status: "active" },
  });
  console.log("✅ Curriculums (60, 65)");

  // ========== 6. CurriculumCourses — ผังวิชาต่อปี/เทอม ==========
  // type YS = { code: string; year: number; sem: number };

  // --- หลักสูตร 65 ---
  const cur65Plan = [
    // ปี 1 เทอม 1
    { code: "01999111", year: 1, sem: 1 }, // ภาษาอังกฤษ 1
    { code: "01417111", year: 1, sem: 1 }, // แคลคูลัส 1
    { code: "01420111", year: 1, sem: 1 }, // ฟิสิกส์ 1
    { code: "01418111", year: 1, sem: 1 }, // คอมพิวเตอร์เบื้องต้น
    { code: "01355101", year: 1, sem: 1 }, // มนุษย์กับสังคม
    { code: "01175111", year: 1, sem: 1 }, // กีฬาเพื่อสุขภาพ
    // ปี 1 เทอม 2
    { code: "01999112", year: 1, sem: 2 }, // ภาษาอังกฤษ 2
    { code: "01417112", year: 1, sem: 2 }, // แคลคูลัส 2
    { code: "01420112", year: 1, sem: 2 }, // ฟิสิกส์ 2
    { code: "01418112", year: 1, sem: 2 }, // C Programming
    { code: "01418113", year: 1, sem: 2 }, // Discrete Math
    // ปี 2 เทอม 1
    { code: "01999211", year: 2, sem: 1 }, // ภาษาอังกฤษ 3
    { code: "01417211", year: 2, sem: 1 }, // สมการเชิงอนุพันธ์
    { code: "01418114", year: 2, sem: 1 }, // OOP
    { code: "01418221", year: 2, sem: 1 }, // Data Structures
    { code: "01418222", year: 2, sem: 1 }, // Digital Logic
    // ปี 2 เทอม 2
    { code: "01422111", year: 2, sem: 2 }, // สถิติวิศวกรรม
    { code: "01418223", year: 2, sem: 2 }, // Computer Architecture
    { code: "01418232", year: 2, sem: 2 }, // Algorithm Analysis
    { code: "01418233", year: 2, sem: 2 }, // Functional Programming
    { code: "01418231", year: 2, sem: 2 }, // OS
    // ปี 3 เทอม 1
    { code: "01418321", year: 3, sem: 1 }, // Software Eng
    { code: "01418331", year: 3, sem: 1 }, // Database
    { code: "01418332", year: 3, sem: 1 }, // Networks
    { code: "01418341", year: 3, sem: 1 }, // AI
    { code: "01418390", year: 3, sem: 1 }, // สัมมนา
    // ปี 3 เทอม 2
    { code: "01418351", year: 3, sem: 2 }, // Compiler
    { code: "01418361", year: 3, sem: 2 }, // DevOps (ใหม่ 65)
    { code: "01418362", year: 3, sem: 2 }, // Data Science (ใหม่ 65)
    // ปี 4 เทอม 1
    { code: "01418490", year: 4, sem: 1 }, // Senior Project I
    // เลือก 2 วิชา (ใส่ตัวอย่าง)
    { code: "01418442", year: 4, sem: 1 }, // Machine Learning
    { code: "01418448", year: 4, sem: 1 }, // Cloud Computing (ใหม่ 65)
    // ปี 4 เทอม 2
    { code: "01418491", year: 4, sem: 2 }, // Senior Project II
    { code: "01418444", year: 4, sem: 2 }, // Mobile Dev
    { code: "01418449", year: 4, sem: 2 }, // Modern Web Dev (ใหม่ 65)
  ];

  // --- หลักสูตร 60 (ต่างจาก 65 บางวิชา) ---
  const cur60Plan = [
    // ปี 1 เทอม 1
    { code: "01999111", year: 1, sem: 1 },
    { code: "01417111", year: 1, sem: 1 },
    { code: "01420111", year: 1, sem: 1 },
    { code: "01418111", year: 1, sem: 1 },
    { code: "01355101", year: 1, sem: 1 },
    { code: "01175111", year: 1, sem: 1 },
    // ปี 1 เทอม 2
    { code: "01999112", year: 1, sem: 2 },
    { code: "01417112", year: 1, sem: 2 },
    { code: "01420112", year: 1, sem: 2 },
    { code: "01418112", year: 1, sem: 2 },
    { code: "01418113", year: 1, sem: 2 },
    // ปี 2 เทอม 1
    { code: "01999211", year: 2, sem: 1 },
    { code: "01417211", year: 2, sem: 1 },
    { code: "01418114", year: 2, sem: 1 },
    { code: "01418221", year: 2, sem: 1 },
    { code: "01418222", year: 2, sem: 1 },
    // ปี 2 เทอม 2
    { code: "01422111", year: 2, sem: 2 },
    { code: "01418223", year: 2, sem: 2 },
    { code: "01418224", year: 2, sem: 2 }, // Assembly (เฉพาะ 60)
    { code: "01418232", year: 2, sem: 2 },
    { code: "01418231", year: 2, sem: 2 },
    // ปี 3 เทอม 1
    { code: "01418321", year: 3, sem: 1 },
    { code: "01418322", year: 3, sem: 1 }, // Software Testing (เฉพาะ 60)
    { code: "01418331", year: 3, sem: 1 },
    { code: "01418332", year: 3, sem: 1 },
    { code: "01418341", year: 3, sem: 1 },
    { code: "01418390", year: 3, sem: 1 },
    // ปี 3 เทอม 2
    { code: "01418351", year: 3, sem: 2 },
    { code: "01418233", year: 3, sem: 2 }, // Functional Prog ย้ายมาปี 3 ใน 60
    // ปี 4 เทอม 1
    { code: "01418490", year: 4, sem: 1 },
    { code: "01418442", year: 4, sem: 1 },
    { code: "01418443", year: 4, sem: 1 }, // Embedded
    // ปี 4 เทอม 2
    { code: "01418491", year: 4, sem: 2 },
    { code: "01418445", year: 4, sem: 2 }, // Cybersecurity
    { code: "01418446", year: 4, sem: 2 }, // IoT
  ];

  for (const item of cur65Plan) {
    await prisma.curriculumCourse.create({
      data: { curriculumId: curriculum65.id, courseId: courses[item.code].id, yearLevel: item.year, semester: item.sem },
    });
  }
  for (const item of cur60Plan) {
    await prisma.curriculumCourse.create({
      data: { curriculumId: curriculum60.id, courseId: courses[item.code].id, yearLevel: item.year, semester: item.sem },
    });
  }
  console.log("✅ CurriculumCourses (หลักสูตร 60 & 65)");

  // ========== 7. Prerequisites ==========
  const prereqs: [string, string][] = [
    // [วิชา, ต้องผ่านก่อน]
    ["01999112", "01999111"], // อังกฤษ 2 ← อังกฤษ 1
    ["01999211", "01999112"], // อังกฤษ 3 ← อังกฤษ 2
    ["01417112", "01417111"], // แคลคูลัส 2 ← แคลคูลัส 1
    ["01417211", "01417112"], // สมการเชิงอนุพันธ์ ← แคลคูลัส 2
    ["01420112", "01420111"], // ฟิสิกส์ 2 ← ฟิสิกส์ 1
    ["01418112", "01418111"], // C Programming ← คอมพิวเตอร์เบื้องต้น
    ["01418114", "01418112"], // OOP ← C Programming
    ["01418221", "01418112"], // Data Structures ← C Programming
    ["01418221", "01418113"], // Data Structures ← Discrete Math
    ["01418222", "01418111"], // Digital Logic ← คอมพิวเตอร์เบื้องต้น
    ["01418223", "01418222"], // Computer Architecture ← Digital Logic
    ["01418231", "01418221"], // OS ← Data Structures
    ["01418232", "01418221"], // Algorithm Analysis ← Data Structures
    ["01418233", "01418112"], // Functional Programming ← C Programming
    ["01418321", "01418221"], // Software Eng ← Data Structures
    ["01418321", "01418114"], // Software Eng ← OOP
    ["01418331", "01418221"], // Database ← Data Structures
    ["01418332", "01418231"], // Networks ← OS
    ["01418341", "01418221"], // AI ← Data Structures
    ["01418341", "01418232"], // AI ← Algorithm Analysis
    ["01418351", "01418221"], // Compiler ← Data Structures
    ["01418351", "01418232"], // Compiler ← Algorithm Analysis
    ["01418442", "01418341"], // Machine Learning ← AI
    ["01418443", "01418223"], // Embedded ← Computer Architecture
    ["01418444", "01418114"], // Mobile Dev ← OOP
    ["01418445", "01418332"], // Cybersecurity ← Networks
    ["01418446", "01418443"], // IoT ← Embedded
    ["01418447", "01418232"], // Computer Graphics ← Algorithm Analysis
    ["01418448", "01418331"], // Cloud Computing ← Database
    ["01418448", "01418332"], // Cloud Computing ← Networks
    ["01418449", "01418114"], // Modern Web Dev ← OOP
    ["01418361", "01418321"], // DevOps ← Software Eng
    ["01418362", "01418341"], // Data Science ← AI
    ["01418224", "01418222"], // Assembly ← Digital Logic (เฉพาะ 60)
    ["01418322", "01418321"], // Software Testing ← Software Eng (เฉพาะ 60)
    ["01418490", "01418390"], // Senior Project I ← Seminar
    ["01418491", "01418490"], // Senior Project II ← Senior Project I
  ];

  for (const [courseCode, prereqCode] of prereqs) {
    if (courses[courseCode] && courses[prereqCode]) {
      await prisma.coursePrerequisite.create({
        data: { courseId: courses[courseCode].id, prerequisiteId: courses[prereqCode].id },
      });
    }
  }
  console.log(`✅ Prerequisites (${prereqs.length} pairs)`);

  // ========== 8. Course Sections & Schedules ==========
  // สร้าง sections สำหรับเทอมที่ต้องใช้
  const days = ["MON", "TUE", "WED", "THU", "FRI"] as const;
  const timeSlots = [
    { start: "08:00", end: "11:00" },
    { start: "09:00", end: "12:00" },
    { start: "13:00", end: "16:00" },
    { start: "14:00", end: "17:00" },
  ];
  const rooms = ["ENG101", "ENG102", "ENG201", "ENG202", "ENG301", "ENG302", "ENG401", "ENG402", "LAB1", "LAB2"];

  // เก็บ sectionId สำหรับใช้ enrollment ทีหลัง
  const sectionMap: Record<string, any> = {}; // key: "courseCode-academicYear-semNum"

  // สร้าง sections สำหรับทุกเทอมที่นิสิตแต่ละปีต้องใช้
  const coursesToCreateSections = new Set<string>();
  [...cur65Plan, ...cur60Plan].forEach((item) => {
    coursesToCreateSections.add(item.code);
  });

  let sectionCounter = 0;
  for (const sem of semesterRecords) {
    // สร้าง sections สำหรับวิชาที่เปิดสอนในเทอมนี้
    const allCourseCodes = Array.from(coursesToCreateSections);
    for (const code of allCourseCodes) {
      if (!courses[code]) continue;
      const dayIdx = sectionCounter % 5;
      const timeIdx = sectionCounter % 4;
      const roomIdx = sectionCounter % 10;
      const teacherIdx = sectionCounter % 5;

      const section = await prisma.courseSection.create({
        data: {
          courseId: courses[code].id,
          semesterId: sem.id,
          sectionNumber: "1",
          teacherId: teachers[teacherIdx].id,
          maxStudents: 50,
          currentStudents: 0,
        },
      });

      // Schedule
      await prisma.schedule.create({
        data: {
          sectionId: section.id,
          dayOfWeek: days[dayIdx],
          startTime: new Date(`2000-01-01T${timeSlots[timeIdx].start}:00`),
          endTime: new Date(`2000-01-01T${timeSlots[timeIdx].end}:00`),
          room: rooms[roomIdx],
          building: "อาคารวิศวกรรม",
        },
      });

      sectionMap[`${code}-${sem.academicYear}-${sem.semesterNumber}`] = section;
      sectionCounter++;
    }
  }
  console.log(`✅ Course Sections & Schedules (${sectionCounter} sections)`);

  // ========== 9. Enrollments & Grades ==========
  // Helper: สร้าง enrollment
  async function enroll(studentId: number, sectionId: number, status: string, grade?: string) {
    try {
      await prisma.enrollment.create({
        data: {
          studentId,
          sectionId,
          status: status as any,
          grade: grade || null,
          enrolledAt: new Date(),
        },
      });
      // update current students count
      await prisma.courseSection.update({
        where: { id: sectionId },
        data: { currentStudents: { increment: 1 } },
      });
    } catch (e) {
      // skip duplicates
    }
  }

  function getSection(code: string, year: number, sem: number) {
    return sectionMap[`${code}-${year}-${sem}`];
  }

  const grades = ["A", "B+", "B", "C+", "C", "D+", "D"];
  function randomGrade(seed: number) {
    return grades[seed % grades.length];
  }

  // ---- นิสิตปี 1 (รหัส 68, admission 2568) ----
  // เทอม 1/2568: กำลังเรียน (เกรดเสร็จแล้ว)
  const y1 = students[0]; // year1@ku.ac.th
  const y1sem1Courses = ["01999111", "01417111", "01420111", "01418111", "01355101", "01175111"];
  for (let i = 0; i < y1sem1Courses.length; i++) {
    const sec = getSection(y1sem1Courses[i], 2568, 1);
    if (sec) await enroll(y1.id, sec.id, "completed", randomGrade(i));
  }
  // เทอม 2/2568: กำลังเรียน (ยังไม่มีเกรด)
  const y1sem2Courses = ["01999112", "01417112", "01420112", "01418112", "01418113"];
  for (const code of y1sem2Courses) {
    const sec = getSection(code, 2568, 2);
    if (sec) await enroll(y1.id, sec.id, "enrolled");
  }

  // ---- นิสิตปี 2 (รหัส 67, admission 2567) ----
  const y2 = students[1]; // year2@ku.ac.th
  // ปี 1 (2567) เสร็จหมด
  const y2y1s1 = ["01999111", "01417111", "01420111", "01418111", "01355101", "01175111"];
  for (let i = 0; i < y2y1s1.length; i++) {
    const sec = getSection(y2y1s1[i], 2567, 1);
    if (sec) await enroll(y2.id, sec.id, "completed", randomGrade(i + 1));
  }
  const y2y1s2 = ["01999112", "01417112", "01420112", "01418112", "01418113"];
  for (let i = 0; i < y2y1s2.length; i++) {
    const sec = getSection(y2y1s2[i], 2567, 2);
    if (sec) await enroll(y2.id, sec.id, "completed", randomGrade(i + 2));
  }
  // ปี 2 เทอม 1 (1/2568) เสร็จแล้ว
  const y2y2s1 = ["01999211", "01417211", "01418114", "01418221", "01418222"];
  for (let i = 0; i < y2y2s1.length; i++) {
    const sec = getSection(y2y2s1[i], 2568, 1);
    if (sec) await enroll(y2.id, sec.id, "completed", randomGrade(i + 3));
  }
  // ปี 2 เทอม 2 (2/2568) กำลังเรียน
  const y2y2s2 = ["01422111", "01418223", "01418232", "01418233", "01418231"];
  for (const code of y2y2s2) {
    const sec = getSection(code, 2568, 2);
    if (sec) await enroll(y2.id, sec.id, "enrolled");
  }

  // ---- นิสิตปี 3 (รหัส 66, admission 2566) ----
  const y3 = students[2]; // year3@ku.ac.th
  // ปี 1 (2566) เสร็จ
  for (let i = 0; i < y2y1s1.length; i++) {
    const sec = getSection(y2y1s1[i], 2566, 1);
    if (sec) await enroll(y3.id, sec.id, "completed", randomGrade(i + 5));
  }
  for (let i = 0; i < y2y1s2.length; i++) {
    const sec = getSection(y2y1s2[i], 2566, 2);
    if (sec) await enroll(y3.id, sec.id, "completed", randomGrade(i + 6));
  }
  // ปี 2 (2567) เสร็จ
  for (let i = 0; i < y2y2s1.length; i++) {
    const sec = getSection(y2y2s1[i], 2567, 1);
    if (sec) await enroll(y3.id, sec.id, "completed", randomGrade(i + 7));
  }
  const y3y2s2 = ["01422111", "01418223", "01418232", "01418233", "01418231"];
  for (let i = 0; i < y3y2s2.length; i++) {
    const sec = getSection(y3y2s2[i], 2567, 2);
    if (sec) await enroll(y3.id, sec.id, "completed", randomGrade(i + 8));
  }
  // ปี 3 เทอม 1 (1/2568) เสร็จ
  const y3y3s1 = ["01418321", "01418331", "01418332", "01418341", "01418390"];
  for (let i = 0; i < y3y3s1.length; i++) {
    const sec = getSection(y3y3s1[i], 2568, 1);
    if (sec) await enroll(y3.id, sec.id, "completed", randomGrade(i + 9));
  }
  // ปี 3 เทอม 2 (2/2568) กำลังเรียน
  const y3y3s2 = ["01418351", "01418361", "01418362"];
  for (const code of y3y3s2) {
    const sec = getSection(code, 2568, 2);
    if (sec) await enroll(y3.id, sec.id, "enrolled");
  }

  // ---- นิสิตปี 4 (รหัส 65, admission 2565, หลักสูตร 65) ----
  const y4 = students[3]; // year4@ku.ac.th
  // ปี 1-3 ผ่านหมด
  const y4completed = [
    // ปี 1/1
    ...y2y1s1.map((c) => ({ code: c, ay: 2565, sem: 1 })),
    // ปี 1/2
    ...y2y1s2.map((c) => ({ code: c, ay: 2565, sem: 2 })),
    // ปี 2/1
    ...y2y2s1.map((c) => ({ code: c, ay: 2566, sem: 1 })),
    // ปี 2/2
    ...y3y2s2.map((c) => ({ code: c, ay: 2566, sem: 2 })),
    // ปี 3/1
    ...y3y3s1.map((c) => ({ code: c, ay: 2567, sem: 1 })),
    // ปี 3/2
    { code: "01418351", ay: 2567, sem: 2 },
    { code: "01418361", ay: 2567, sem: 2 },
    { code: "01418362", ay: 2567, sem: 2 },
    // ปี 4/1
    { code: "01418490", ay: 2568, sem: 1 },
    { code: "01418442", ay: 2568, sem: 1 },
    { code: "01418448", ay: 2568, sem: 1 },
  ];
  for (let i = 0; i < y4completed.length; i++) {
    const sec = getSection(y4completed[i].code, y4completed[i].ay, y4completed[i].sem);
    if (sec) await enroll(y4.id, sec.id, "completed", randomGrade(i + 10));
  }
  // ปี 4/2 (2/2568) กำลังเรียน
  const y4current = ["01418491", "01418444", "01418449"];
  for (const code of y4current) {
    const sec = getSection(code, 2568, 2);
    if (sec) await enroll(y4.id, sec.id, "enrolled");
  }

  // ---- นิสิตปี 5 (รหัส 64, admission 2564, หลักสูตร 60!) ----
  const y5 = students[4]; // year5@ku.ac.th
  // ปี 1-3 ผ่านเกือบหมด แต่มีวิชา F!
  const y5completed = [
    // ปี 1
    ...y2y1s1.map((c) => ({ code: c, ay: 2564, sem: 1 })),
    ...y2y1s2.map((c) => ({ code: c, ay: 2564, sem: 2 })),
    // ปี 2
    ...["01999211", "01417211", "01418114", "01418221", "01418222"].map((c) => ({ code: c, ay: 2565, sem: 1 })),
    ...["01422111", "01418223", "01418224", "01418232", "01418231"].map((c) => ({ code: c, ay: 2565, sem: 2 })),
    // ปี 3
    ...["01418321", "01418322", "01418331", "01418341", "01418390"].map((c) => ({ code: c, ay: 2566, sem: 1 })),
    { code: "01418351", ay: 2566, sem: 2 },
    { code: "01418233", ay: 2566, sem: 2 },
    // ปี 4
    { code: "01418490", ay: 2567, sem: 1 },
    { code: "01418442", ay: 2567, sem: 1 },
    { code: "01418443", ay: 2567, sem: 1 },
  ];

  for (let i = 0; i < y5completed.length; i++) {
    const sec = getSection(y5completed[i].code, y5completed[i].ay, y5completed[i].sem);
    if (sec) await enroll(y5.id, sec.id, "completed", randomGrade(i + 15));
  }

  // วิชาที่สอบตก (F) — Networks ← ส่งผลให้ลง Cybersecurity ไม่ได้!
  const y5FailSection = getSection("01418332", 2566, 1);
  if (y5FailSection) await enroll(y5.id, y5FailSection.id, "completed", "F");

  // Senior Project II ยังไม่ลง (ตกค้าง)
  // Cybersecurity (เลือก) ลงไม่ได้เพราะ Networks F
  // IoT ลงไม่ได้เพราะไม่ผ่าน Embedded (ผ่าน Embedded แล้วแต่ Networks F block Cybersecurity)

  // ปี 5: กำลังเรียนวิชาที่ตกค้าง
  const y5sec1 = getSection("01418491", 2568, 1); // Senior Project II
  if (y5sec1) await enroll(y5.id, y5sec1.id, "completed", randomGrade(50));
  const y5sec2 = getSection("01418332", 2568, 2); // เรียน Networks ใหม่
  if (y5sec2) await enroll(y5.id, y5sec2.id, "enrolled");
  const y5sec3 = getSection("01418445", 2568, 2); // Cybersecurity (ลองลง)
  // ไม่ลง — เพราะยังไม่ผ่าน Networks

  console.log("✅ Enrollments & Grades (ทุกชั้นปี)");

  // ========== 10. Announcements ==========
  await prisma.announcement.createMany({
    data: [
      { title: "กำหนดการลงทะเบียนเรียน ภาค 2/2568", content: "นิสิตทุกชั้นปีสามารถลงทะเบียนเรียนได้ตั้งแต่วันที่ 5 มกราคม 2569 เป็นต้นไป กรุณาตรวจสอบตารางเรียนก่อนลงทะเบียน", targetRole: "all", isPinned: true, createdBy: adminUser.id },
      { title: "หยุดชดเชยวันสงกรานต์", content: "มหาวิทยาลัยจะหยุดชดเชยวันสงกรานต์ในวันจันทร์ที่ 16 เมษายน 2569 การเรียนการสอนจะดำเนินต่อตามปกติในวันอังคาร", targetRole: "all", isPinned: true, createdBy: adminUser.id },
      { title: "กำหนดส่งเกรด ภาค 2/2568", content: "อาจารย์ผู้สอนกรุณาส่งเกรดผ่านระบบภายในวันที่ 30 พฤษภาคม 2569", targetRole: "teacher", isPinned: false, createdBy: adminUser.id },
      { title: "ประกาศทุนการศึกษา ประจำปี 2569", content: "นิสิตที่สนใจสมัครทุนการศึกษา กรุณาส่งเอกสารที่ฝ่ายกิจการนิสิตภายในวันที่ 28 กุมภาพันธ์ 2569", targetRole: "student", isPinned: false, createdBy: adminUser.id },
      { title: "เปิดลงทะเบียน Senior Project ปี 2569", content: "นิสิตชั้นปี 4 สามารถลงทะเบียน Senior Project ได้แล้ว กรุณาติดต่ออาจารย์ที่ปรึกษา", targetRole: "student", isPinned: true, createdBy: adminUser.id },
      { title: "อบรมการใช้ระบบจัดการการศึกษาใหม่", content: "ขอเชิญอาจารย์ทุกท่านเข้าร่วมอบรมการใช้ระบบจัดการการศึกษาใหม่ ในวันศุกร์ที่ 7 กุมภาพันธ์ 2569 เวลา 13:00-16:00 น. ห้อง ENG201", targetRole: "teacher", isPinned: false, createdBy: adminUser.id },
    ],
  });
  console.log("✅ Announcements (6 รายการ)");

  // ========== 11. MakeupClass ตัวอย่าง ==========
  const mcSection = getSection("01418221", 2568, 2);
  if (mcSection) {
    await prisma.makeupClass.create({
      data: {
        sectionId: mcSection.id,
        originalDate: new Date("2026-04-14"),
        makeupDate: new Date("2026-04-19"),
        startTime: new Date("2000-01-01T09:00:00"),
        endTime: new Date("2000-01-01T12:00:00"),
        room: "ENG301",
        reason: "ชดเชยวันหยุดสงกรานต์",
        status: "scheduled",
        createdBy: teachers[0].id,
      },
    });
    console.log("✅ MakeupClass (1 ตัวอย่าง)");
  }

  // ========== สรุป ==========
  console.log("\n════════════════════════════════════════");
  console.log("🎉 Seed เสร็จสมบูรณ์!");
  console.log("════════════════════════════════════════");
  console.log("\n📋 Demo Login Accounts:");
  console.log("─────────────────────────────────────────");
  console.log("🎓 นิสิตปี 1: year1@ku.ac.th / password  (รหัส 68, หลักสูตร 65)");
  console.log("🎓 นิสิตปี 2: year2@ku.ac.th / password  (รหัส 67, หลักสูตร 65)");
  console.log("🎓 นิสิตปี 3: year3@ku.ac.th / password  (รหัส 66, หลักสูตร 65)");
  console.log("🎓 นิสิตปี 4: year4@ku.ac.th / password  (รหัส 65, หลักสูตร 65)");
  console.log("🎓 นิสิตปี 5: year5@ku.ac.th / password  (รหัส 64, หลักสูตร 60)");
  console.log("👨‍🏫 อาจารย์:  teacher@ku.ac.th / password");
  console.log("👨‍💼 แอดมิน:   admin@ku.ac.th / password");
  console.log("─────────────────────────────────────────");
  console.log("📚 หลักสูตร 60: สำหรับนิสิตรหัส 60-64 (140 หน่วยกิต)");
  console.log("📚 หลักสูตร 65: สำหรับนิสิตรหัส 65+   (135 หน่วยกิต)");
  console.log("⚠️  นิสิตปี 5 มีวิชาตก (Networks=F) → แสดง Reverse Dependency Impact");
  console.log("════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
