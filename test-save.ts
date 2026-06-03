import prisma from './src/lib/prisma';

async function testSave() {
  const firstDept = await prisma.department.findFirst();
  let curriculum = await prisma.curriculum.findFirst({
    where: { departmentId: firstDept.id, year: 2026 }
  });

  const safePlans = [
    {
      year: 1,
      semester: 1,
      courses: [
        { code: "01418112", name: "Computer Prog", credits: 3, type: "วิชาบังคับ" }
      ]
    }
  ];

  try {
    for (const plan of safePlans) {
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
               departmentId: firstDept!.id,
               description: "ระบุอัตโนมัติจากหลักสูตร"
             }
           });
         }
      }

      await prisma.curriculumCourse.deleteMany({
        where: { curriculumId: curriculum!.id }
      });

      for (const plan of safePlans) {
         for (const course of plan.courses) {
            const dbCourse = await prisma.course.findUnique({
              where: { code: course.code }
            });
            if (dbCourse) {
               await prisma.curriculumCourse.create({
                 data: {
                   curriculumId: curriculum!.id,
                   courseId: dbCourse.id,
                   semester: plan.semester,
                   yearLevel: plan.year
                 }
               });
            }
         }
      }
      console.log("Success");
  } catch(e) {
    console.error(e);
  }
}
testSave();
