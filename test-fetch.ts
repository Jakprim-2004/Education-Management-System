import { testSave } from './test-save.ts'; // wait, test-save doesn't export. I will just query using prisma directly

import prisma from './src/lib/prisma';

async function test() {
  const firstDept = await prisma.department.findFirst();
  let curriculum = await prisma.curriculum.findFirst({
    where: { departmentId: firstDept.id, year: 2569 }
  });

  if (!curriculum) {
    console.log("No curriculum 2569");
    return;
  }

  // Create mapping manually
  const course = await prisma.course.findFirst();
  if (course) {
    await prisma.curriculumCourse.create({
      data: {
        curriculumId: curriculum.id,
        courseId: course.id,
        semester: 1,
        yearLevel: 1
      }
    });
    console.log(`Created mapping for ${course.code}`);
  }

  // Fetch it
  const fetched = await prisma.curriculum.findFirst({
    where: { id: curriculum.id },
    include: {
      curriculumCourses: {
        include: { course: true }
      }
    }
  });
  console.log("Fetched courses count:", fetched?.curriculumCourses.length);
}
test();
