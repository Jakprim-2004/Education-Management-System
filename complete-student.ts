import 'dotenv/config';
import prisma from './src/lib/prisma';

async function main() {
  const studentCode = '6010000001';
  const student = await prisma.student.findUnique({
    where: { studentCode },
    include: { user: true, enrollments: true }
  });

  if (!student) {
    console.log("Student not found");
    return;
  }

  const grades = ['A', 'B+', 'B', 'C+', 'C'];

  let count = 0;
  for (const enrollment of student.enrollments) {
    const randomGrade = grades[Math.floor(Math.random() * grades.length)];
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'completed',
        grade: randomGrade
      }
    });
    count++;
  }

  console.log(`✅ Updated ${count} courses for student ${student.user.firstName} ${student.user.lastName} (${studentCode}) to COMPLETED with random grades.`);
}
main().finally(() => prisma.$disconnect());
