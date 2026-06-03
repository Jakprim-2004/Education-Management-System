import prisma from './src/lib/prisma';

async function testApi() {
  const plans = [
    {
      year: 1,
      semester: 1,
      courses: [
        { code: "1418131", name: "Programming", credits: 3, type: "วิชาบังคับ" }
      ]
    }
  ];

  const curriculumYear = 2569;
  const firstDept = await prisma.department.findFirst();

  let curriculum = await prisma.curriculum.findFirst({
    where: { departmentId: firstDept.id, year: parseInt(curriculumYear as any) }
  });

  if (!curriculum) {
    console.log("Not found curriculum");
    return;
  }

  // Delete existing curriculum courses mapping
  await prisma.curriculumCourse.deleteMany({
    where: { curriculumId: curriculum.id }
  });

  // Process all courses first to ensure they exist
  for (const plan of plans) {
      for (const course of plan.courses) {
        let dbType = "required";
        if (course.type === "วิชาเลือก") dbType = "elective";
        if (course.type === "วิชาศึกษาทั่วไป") dbType = "general";
        
        await prisma.course.upsert({
          where: { code: course.code },
          update: {
            name: course.name,
            credits: course.credits || 3,
            type: dbType as any,
          },
          create: {
            code: course.code,
            name: course.name,
            credits: course.credits || 3,
            type: dbType as any,
            departmentId: firstDept.id,
            description: "ระบุอัตโนมัติจากหลักสูตร"
          }
        });
      }
  }

  // Rebuild mapping
  for (const plan of plans) {
      for (const course of plan.courses) {
        const dbCourse = await prisma.course.findUnique({
          where: { code: course.code }
        });
        if (dbCourse) {
            await prisma.curriculumCourse.create({
              data: {
                curriculumId: curriculum.id,
                courseId: dbCourse.id,
                semester: plan.semester,
                yearLevel: plan.year
              }
            });
        }
      }
  }

  const fetched = await prisma.curriculum.findFirst({
    where: { id: curriculum.id },
    include: { curriculumCourses: true }
  });
  console.log("Saved mappings:", fetched?.curriculumCourses.length);
}
testApi();
