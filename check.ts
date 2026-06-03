import prisma from './src/lib/prisma';

async function checkDB() {
  const currs = await prisma.curriculum.findMany({
    include: {
      curriculumCourses: {
        include: { course: true }
      }
    }
  });

  for (const c of currs) {
    console.log(`Curriculum: ${c.year} - ${c.name}`);
    console.log(`Courses: ${c.curriculumCourses.length}`);
    if (c.curriculumCourses.length > 0) {
      console.log(`Sample: ${c.curriculumCourses[0].course.code}`);
    }
    console.log('---');
  }
}
checkDB();
