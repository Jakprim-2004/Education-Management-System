import 'dotenv/config';
import prisma from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Resetting database data...');

  // Delete all data in reverse order of dependencies to avoid foreign key constraints
  await prisma.importLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.makeupClass.deleteMany();
  await prisma.coursePlan.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.courseSection.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.curriculumCourse.deleteMany();
  await prisma.coursePrerequisite.deleteMany();
  await prisma.course.deleteMany();
  await prisma.curriculum.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.oTPVerification.deleteMany();
  await prisma.user.deleteMany();

  console.log('Data cleared.');

  // Create Admin Account
  const adminEmail = 'admin@ku.ac.th';
  const adminPassword = 'admin';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'admin',
      firstName: 'System',
      lastName: 'Admin',
      isActive: true,
    },
  });

  console.log('Admin account created:');
  console.log('Email:', admin.email);
  console.log('Password:', adminPassword);

  // ==========================================
  // Create Mock Student (เรียนจบทุกวิชา)
  // ==========================================
  console.log('\nCreating mock student (Completed all courses)...');

  const faculty = await prisma.faculty.create({
    data: { name: 'คณะวิทยาศาสตร์', code: 'SCI' }
  });

  const dept = await prisma.department.create({
    data: { name: 'วิทยาการคอมพิวเตอร์', code: 'CS', facultyId: faculty.id }
  });

  const studentEmail = 'graduated@ku.ac.th';
  const studentPasswordString = '123456';
  const studentHashedPassword = await bcrypt.hash(studentPasswordString, 10);

  const studentUser = await prisma.user.create({
    data: {
      email: studentEmail,
      passwordHash: studentHashedPassword,
      role: 'student',
      firstName: 'เรียนดี',
      lastName: 'จบแน่',
      isActive: true,
      student: {
        create: {
          studentCode: '6310000009',
          departmentId: dept.id,
          admissionYear: 2563,
          status: 'active'
        }
      }
    },
    include: { student: true }
  });

  const sem1 = await prisma.semester.create({ data: { academicYear: 2563, semesterNumber: 1, startDate: new Date('2020-08-01'), endDate: new Date('2020-12-15') }});
  const sem2 = await prisma.semester.create({ data: { academicYear: 2563, semesterNumber: 2, startDate: new Date('2021-01-05'), endDate: new Date('2021-05-15') }});

  const mockCourses = [
    { code: '01418111', name: 'คอมพิวเตอร์เบื้องต้น', credits: 3 },
    { code: '01418112', name: 'การเขียนโปรแกรม 1', credits: 3 },
    { code: '01418113', name: 'การเขียนโปรแกรม 2', credits: 3 },
    { code: '01418221', name: 'โครงสร้างข้อมูล', credits: 3 },
    { code: '01418231', name: 'สถาปัตยกรรมคอมพิวเตอร์', credits: 3 },
    { code: '01418341', name: 'วิศวกรรมซอฟต์แวร์', credits: 3 },
    { code: '01418497', name: 'สัมมนา', credits: 1 },
    { code: '01418499', name: 'โครงงาน', credits: 3 }
  ];

  const grades = ['A', 'B+', 'B', 'C+', 'C'];

  for (let i = 0; i < mockCourses.length; i++) {
    const courseData = mockCourses[i];
    const course = await prisma.course.create({
      data: {
        code: courseData.code,
        name: courseData.name,
        credits: courseData.credits,
        type: 'บังคับ',
        departmentId: dept.id
      }
    });

    const semId = i % 2 === 0 ? sem1.id : sem2.id;
    const section = await prisma.courseSection.create({
      data: {
        courseId: course.id,
        semesterId: semId,
        sectionNumber: '1',
        maxStudents: 30,
        currentStudents: 1
      }
    });

    await prisma.enrollment.create({
      data: {
        studentId: studentUser.student!.id,
        sectionId: section.id,
        status: 'completed',
        grade: grades[Math.floor(Math.random() * grades.length)]
      }
    });
  }

  console.log('Mock student created successfully!');
  console.log('Name: เรียนดี จบแน่');
  console.log('Email:', studentEmail);
  console.log('Student Code:', '6310000009');
  console.log('Password:', studentPasswordString);
  console.log('Completed Courses:', mockCourses.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
