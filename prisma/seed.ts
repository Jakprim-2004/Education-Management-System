import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate()) as unknown as PrismaClient;

async function main() {
  const passwordHash = await bcrypt.hash('password', 10);
  
  const faculty = await prisma.faculty.upsert({
    where: { code: 'FAC01' },
    update: {},
    create: { name: 'Faculty of Engineering', code: 'FAC01' }
  });

  const department = await prisma.department.upsert({
    where: { code: 'CPE' },
    update: {},
    create: { name: 'Computer Engineering', code: 'CPE', facultyId: faculty.id }
  });

  // Create Student
  await prisma.user.upsert({
    where: { email: 'student@ku.ac.th' },
    update: { passwordHash },
    create: {
      email: 'student@ku.ac.th',
      passwordHash: passwordHash,
      role: 'student',
      firstName: 'สมชาย',
      lastName: 'เรียนดี',
      phone: '0812345678',
      student: {
        create: {
          studentCode: '6310000001',
          departmentId: department.id,
          admissionYear: 2020,
          status: 'active'
        }
      }
    }
  });

  // Create Teacher
  await prisma.user.upsert({
    where: { email: 'teacher@ku.ac.th' },
    update: { passwordHash },
    create: {
      email: 'teacher@ku.ac.th',
      passwordHash: passwordHash,
      role: 'teacher',
      firstName: 'สมศักดิ์',
      lastName: 'สอนเก่ง',
      phone: '0898765432',
      teacher: {
        create: {
          teacherCode: 'T001',
          departmentId: department.id,
        }
      }
    }
  });

  // Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@ku.ac.th' },
    update: { passwordHash },
    create: {
      email: 'admin@ku.ac.th',
      passwordHash: passwordHash,
      role: 'admin',
      firstName: 'แอดมิน',
      lastName: 'ระบบ',
    }
  });

  console.log('✅ Seed completed successfully! Default users inserted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
