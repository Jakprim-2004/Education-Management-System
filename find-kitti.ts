import 'dotenv/config';
import prisma from './src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    where: {
      firstName: { contains: 'กิตติ' },
      lastName: { contains: 'รักเรียน' }
    },
    include: {
      student: {
        include: {
          enrollments: {
            include: {
              section: {
                include: {
                  course: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (users.length === 0) {
     console.log("Not found.");
  }

  for (const user of users) {
    console.log(`User: ${user.firstName} ${user.lastName} (Student Code: ${user.student?.studentCode})`);
    if (user.student && user.student.enrollments) {
      for (const e of user.student.enrollments) {
        console.log(` - ${e.section.course.code}: ${e.section.course.name} (เกรด: ${e.grade || '-'}, สถานะ: ${e.status})`);
      }
    }
  }
}
main().finally(() => prisma.$disconnect());
