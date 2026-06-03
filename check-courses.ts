import prisma from './src/lib/prisma';

async function check() {
  const count = await prisma.course.count();
  console.log(`Total courses in DB: ${count}`);
}
check();
