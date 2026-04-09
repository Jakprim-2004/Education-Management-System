import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate()) as unknown as PrismaClient;

async function main() {
  const passwordHash = await bcrypt.hash('password', 10);

  // ==================== Faculty & Department ====================
  const faculty = await prisma.faculty.upsert({
    where: { code: 'ENG' },
    update: {},
    create: { name: 'คณะวิศวกรรมศาสตร์', code: 'ENG' }
  });

  const department = await prisma.department.upsert({
    where: { code: 'CPE' },
    update: {},
    create: { name: 'ภาควิชาวิศวกรรมคอมพิวเตอร์', code: 'CPE', facultyId: faculty.id }
  });

  // ==================== Users ====================

  // --- Student ---
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@ku.ac.th' },
    update: { passwordHash },
    create: {
      email: 'student@ku.ac.th',
      passwordHash,
      role: 'student',
      firstName: 'สมชาย',
      lastName: 'เรียนดี',
      phone: '0812345678',
      student: {
        create: {
          studentCode: '6510450001',
          departmentId: department.id,
          admissionYear: 2565,
          status: 'active'
        }
      }
    }
  });

  // --- Student 2 ---
  const student2User = await prisma.user.upsert({
    where: { email: 'student2@ku.ac.th' },
    update: { passwordHash },
    create: {
      email: 'student2@ku.ac.th',
      passwordHash,
      role: 'student',
      firstName: 'สมหญิง',
      lastName: 'ตั้งใจ',
      phone: '0823456789',
      student: {
        create: {
          studentCode: '6510450002',
          departmentId: department.id,
          admissionYear: 2565,
          status: 'active'
        }
      }
    }
  });

  // --- Student 3 ---
  const student3User = await prisma.user.upsert({
    where: { email: 'student3@ku.ac.th' },
    update: { passwordHash },
    create: {
      email: 'student3@ku.ac.th',
      passwordHash,
      role: 'student',
      firstName: 'วิชัย',
      lastName: 'พากเพียร',
      phone: '0834567890',
      student: {
        create: {
          studentCode: '6510450003',
          departmentId: department.id,
          admissionYear: 2565,
          status: 'active'
        }
      }
    }
  });

  // --- Teacher ---
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@ku.ac.th' },
    update: { passwordHash },
    create: {
      email: 'teacher@ku.ac.th',
      passwordHash,
      role: 'teacher',
      firstName: 'ผศ.ดร.สมศักดิ์',
      lastName: 'สอนเก่ง',
      phone: '0898765432',
      teacher: {
        create: {
          teacherCode: 'T001',
          departmentId: department.id,
          position: 'ผู้ช่วยศาสตราจารย์',
          specialization: 'วิศวกรรมซอฟต์แวร์'
        }
      }
    }
  });

  // --- Teacher 2 ---
  const teacher2User = await prisma.user.upsert({
    where: { email: 'teacher2@ku.ac.th' },
    update: { passwordHash },
    create: {
      email: 'teacher2@ku.ac.th',
      passwordHash,
      role: 'teacher',
      firstName: 'รศ.ดร.วิภา',
      lastName: 'ปัญญาดี',
      phone: '0876543210',
      teacher: {
        create: {
          teacherCode: 'T002',
          departmentId: department.id,
          position: 'รองศาสตราจารย์',
          specialization: 'ปัญญาประดิษฐ์'
        }
      }
    }
  });

  // --- Admin ---
  await prisma.user.upsert({
    where: { email: 'admin@ku.ac.th' },
    update: { passwordHash },
    create: {
      email: 'admin@ku.ac.th',
      passwordHash,
      role: 'admin',
      firstName: 'แอดมิน',
      lastName: 'ระบบ',
    }
  });

  // ==================== Semesters ====================
  const sem1 = await prisma.semester.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'ภาคเรียนที่ 1/2568',
      academicYear: 2568,
      semesterNumber: 1,
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-12-15'),
      isCurrent: false
    }
  });

  const sem2 = await prisma.semester.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'ภาคเรียนที่ 2/2568',
      academicYear: 2568,
      semesterNumber: 2,
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-05-15'),
      isCurrent: true
    }
  });

  // ==================== Curriculum ====================
  const curriculum = await prisma.curriculum.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'หลักสูตรวิศวกรรมคอมพิวเตอร์ 2565',
      departmentId: department.id,
      totalCredits: 145,
      year: 2565,
    }
  });

  // ==================== Courses ====================
  const course1 = await prisma.course.upsert({
    where: { code: '01418221' },
    update: {},
    create: { code: '01418221', name: 'โครงสร้างข้อมูล (Data Structures)', credits: 3, type: 'required', departmentId: department.id }
  });

  const course2 = await prisma.course.upsert({
    where: { code: '01418231' },
    update: {},
    create: { code: '01418231', name: 'ระบบปฏิบัติการ (Operating Systems)', credits: 3, type: 'required', departmentId: department.id }
  });

  const course3 = await prisma.course.upsert({
    where: { code: '01418321' },
    update: {},
    create: { code: '01418321', name: 'วิศวกรรมซอฟต์แวร์ (Software Engineering)', credits: 3, type: 'required', departmentId: department.id }
  });

  const course4 = await prisma.course.upsert({
    where: { code: '01418341' },
    update: {},
    create: { code: '01418341', name: 'ปัญญาประดิษฐ์ (Artificial Intelligence)', credits: 3, type: 'elective', departmentId: department.id }
  });

  const course5 = await prisma.course.upsert({
    where: { code: '01418111' },
    update: {},
    create: { code: '01418111', name: 'คอมพิวเตอร์เบื้องต้น (Intro to Computer)', credits: 3, type: 'required', departmentId: department.id }
  });

  // ==================== CurriculumCourse ====================
  const courses = [course1, course2, course3, course4, course5];
  for (let i = 0; i < courses.length; i++) {
    await prisma.curriculumCourse.upsert({
      where: { curriculumId_courseId: { curriculumId: curriculum.id, courseId: courses[i].id } },
      update: {},
      create: {
        curriculumId: curriculum.id,
        courseId: courses[i].id,
        yearLevel: Math.ceil((i + 1) / 2),
        semester: (i % 2) + 1
      }
    });
  }

  // ==================== Get teacher records ====================
  const teacher1 = await prisma.teacher.findUnique({ where: { userId: teacherUser.id } });
  const teacher2 = await prisma.teacher.findUnique({ where: { userId: teacher2User.id } });
  const student = await prisma.student.findUnique({ where: { userId: studentUser.id } });
  const student2 = await prisma.student.findUnique({ where: { userId: student2User.id } });
  const student3 = await prisma.student.findUnique({ where: { userId: student3User.id } });

  if (!teacher1 || !teacher2 || !student || !student2 || !student3) {
    throw new Error('Failed to create teacher/student records');
  }

  // ==================== Course Sections (Current Semester) ====================
  const section1 = await prisma.courseSection.upsert({
    where: { id: 1 },
    update: {},
    create: { courseId: course1.id, semesterId: sem2.id, sectionNumber: '1', teacherId: teacher1.id, maxStudents: 40 }
  });

  const section2 = await prisma.courseSection.upsert({
    where: { id: 2 },
    update: {},
    create: { courseId: course2.id, semesterId: sem2.id, sectionNumber: '1', teacherId: teacher1.id, maxStudents: 40 }
  });

  const section3 = await prisma.courseSection.upsert({
    where: { id: 3 },
    update: {},
    create: { courseId: course3.id, semesterId: sem2.id, sectionNumber: '1', teacherId: teacher1.id, maxStudents: 35 }
  });

  const section4 = await prisma.courseSection.upsert({
    where: { id: 4 },
    update: {},
    create: { courseId: course4.id, semesterId: sem2.id, sectionNumber: '1', teacherId: teacher2.id, maxStudents: 30 }
  });

  // Previous semester sections
  const section5 = await prisma.courseSection.upsert({
    where: { id: 5 },
    update: {},
    create: { courseId: course5.id, semesterId: sem1.id, sectionNumber: '1', teacherId: teacher1.id, maxStudents: 50 }
  });

  const section6 = await prisma.courseSection.upsert({
    where: { id: 6 },
    update: {},
    create: { courseId: course1.id, semesterId: sem1.id, sectionNumber: '1', teacherId: teacher1.id, maxStudents: 40 }
  });

  const section7 = await prisma.courseSection.upsert({
    where: { id: 7 },
    update: {},
    create: { courseId: course2.id, semesterId: sem1.id, sectionNumber: '1', teacherId: teacher2.id, maxStudents: 40 }
  });

  const section8 = await prisma.courseSection.upsert({
    where: { id: 8 },
    update: {},
    create: { courseId: course4.id, semesterId: sem1.id, sectionNumber: '1', teacherId: teacher2.id, maxStudents: 35 }
  });

  // ==================== Schedules ====================
  await prisma.schedule.upsert({ where: { id: 1 }, update: {}, create: { sectionId: section1.id, dayOfWeek: 'MON', startTime: new Date('1970-01-01T09:00:00Z'), endTime: new Date('1970-01-01T12:00:00Z'), room: 'ENG301' } });
  await prisma.schedule.upsert({ where: { id: 2 }, update: {}, create: { sectionId: section2.id, dayOfWeek: 'TUE', startTime: new Date('1970-01-01T13:00:00Z'), endTime: new Date('1970-01-01T16:00:00Z'), room: 'ENG302' } });
  await prisma.schedule.upsert({ where: { id: 3 }, update: {}, create: { sectionId: section3.id, dayOfWeek: 'WED', startTime: new Date('1970-01-01T09:00:00Z'), endTime: new Date('1970-01-01T12:00:00Z'), room: 'ENG201' } });
  await prisma.schedule.upsert({ where: { id: 4 }, update: {}, create: { sectionId: section4.id, dayOfWeek: 'THU', startTime: new Date('1970-01-01T13:00:00Z'), endTime: new Date('1970-01-01T16:00:00Z'), room: 'ENG401' } });
  await prisma.schedule.upsert({ where: { id: 5 }, update: {}, create: { sectionId: section5.id, dayOfWeek: 'FRI', startTime: new Date('1970-01-01T09:00:00Z'), endTime: new Date('1970-01-01T12:00:00Z'), room: 'ENG101' } });

  // ==================== Enrollments ====================
  // Student 1: current semester (no grade yet) + past semester (graded)
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student.id, sectionId: section1.id } }, update: {}, create: { studentId: student.id, sectionId: section1.id, status: 'enrolled' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student.id, sectionId: section2.id } }, update: {}, create: { studentId: student.id, sectionId: section2.id, status: 'enrolled' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student.id, sectionId: section3.id } }, update: {}, create: { studentId: student.id, sectionId: section3.id, status: 'enrolled' } });
  // Past semester — graded
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student.id, sectionId: section5.id } }, update: {}, create: { studentId: student.id, sectionId: section5.id, status: 'completed', grade: 'A' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student.id, sectionId: section6.id } }, update: {}, create: { studentId: student.id, sectionId: section6.id, status: 'completed', grade: 'B+' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student.id, sectionId: section7.id } }, update: {}, create: { studentId: student.id, sectionId: section7.id, status: 'completed', grade: 'A' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student.id, sectionId: section8.id } }, update: {}, create: { studentId: student.id, sectionId: section8.id, status: 'completed', grade: 'B' } });

  // Student 2: current (no grade) + past (graded)
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student2.id, sectionId: section1.id } }, update: {}, create: { studentId: student2.id, sectionId: section1.id, status: 'enrolled' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student2.id, sectionId: section4.id } }, update: {}, create: { studentId: student2.id, sectionId: section4.id, status: 'enrolled' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student2.id, sectionId: section5.id } }, update: {}, create: { studentId: student2.id, sectionId: section5.id, status: 'completed', grade: 'B+' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student2.id, sectionId: section6.id } }, update: {}, create: { studentId: student2.id, sectionId: section6.id, status: 'completed', grade: 'C+' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student2.id, sectionId: section7.id } }, update: {}, create: { studentId: student2.id, sectionId: section7.id, status: 'completed', grade: 'B' } });

  // Student 3: current (no grade) + past (graded)
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student3.id, sectionId: section1.id } }, update: {}, create: { studentId: student3.id, sectionId: section1.id, status: 'enrolled' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student3.id, sectionId: section2.id } }, update: {}, create: { studentId: student3.id, sectionId: section2.id, status: 'enrolled' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student3.id, sectionId: section3.id } }, update: {}, create: { studentId: student3.id, sectionId: section3.id, status: 'enrolled' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student3.id, sectionId: section4.id } }, update: {}, create: { studentId: student3.id, sectionId: section4.id, status: 'enrolled' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student3.id, sectionId: section5.id } }, update: {}, create: { studentId: student3.id, sectionId: section5.id, status: 'completed', grade: 'A' } });
  await prisma.enrollment.upsert({ where: { studentId_sectionId: { studentId: student3.id, sectionId: section6.id } }, update: {}, create: { studentId: student3.id, sectionId: section6.id, status: 'completed', grade: 'A' } });

  // ==================== Announcements ====================
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@ku.ac.th' } });
  const adminId = adminUser!.id;

  await prisma.announcement.upsert({
    where: { id: 1 },
    update: {},
    create: { title: 'กำหนดการลงทะเบียนเรียน ภาค 2/2568', content: 'นิสิตสามารถลงทะเบียนเรียนได้ตั้งแต่วันที่ 5-15 มกราคม 2569', targetRole: 'all', isPinned: true, createdBy: adminId }
  });
  await prisma.announcement.upsert({
    where: { id: 2 },
    update: {},
    create: { title: 'หยุดชดเชยวันสงกรานต์', content: 'มหาวิทยาลัยหยุดชดเชยวันสงกรานต์ 14-16 เมษายน 2569', targetRole: 'all', isPinned: true, createdBy: adminId }
  });
  await prisma.announcement.upsert({
    where: { id: 3 },
    update: {},
    create: { title: 'กำหนดส่งเกรด ภาค 2/2568', content: 'อาจารย์กรุณาส่งเกรดภายในวันที่ 30 พฤษภาคม 2569', targetRole: 'teacher', isPinned: false, createdBy: adminId }
  });
  await prisma.announcement.upsert({
    where: { id: 4 },
    update: {},
    create: { title: 'ประกาศทุนการศึกษา', content: 'นิสิตที่สนใจสมัครทุนสามารถยื่นใบสมัครได้ที่ภาควิชา', targetRole: 'student', isPinned: false, createdBy: adminId }
  });

  console.log('');
  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📌 Demo accounts (password: password):');
  console.log('   🎓 นิสิต:      student@ku.ac.th');
  console.log('   🎓 นิสิต 2:    student2@ku.ac.th');
  console.log('   🎓 นิสิต 3:    student3@ku.ac.th');
  console.log('   👨‍🏫 อาจารย์:    teacher@ku.ac.th');
  console.log('   👨‍🏫 อาจารย์ 2:  teacher2@ku.ac.th');
  console.log('   🔑 ผู้ดูแลระบบ: admin@ku.ac.th');
  console.log('');
  console.log('📚 Courses: 5 | Sections: 5 | Semesters: 2 | Enrollments: 10');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
