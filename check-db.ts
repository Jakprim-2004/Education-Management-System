import 'dotenv/config';
import prisma from './src/lib/prisma';

async function main() {
  console.log('Students:', await prisma.student.count());
  console.log('Courses:', await prisma.course.count());
  console.log('Sections:', await prisma.courseSection.count());
  console.log('Enrollments:', await prisma.enrollment.count());
  const sample = await prisma.enrollment.findFirst({ include: { student: true, section: { include: { course: true }} }});
  console.log('Sample Enrollment:', JSON.stringify(sample, null, 2));
}

main().finally(() => prisma.$disconnect());
