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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
