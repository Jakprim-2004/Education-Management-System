import 'dotenv/config';
import prisma from './src/lib/prisma';
import fs from 'fs';

function parseCSV(text: string): string[][] {
  const cleanText = text.replace(/^\uFEFF/, '');
  const lines = cleanText.split(/\r?\n/).filter(line => line.trim() !== "");
  return lines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
}

async function main() {
  const fileContent = fs.readFileSync('C:\\Users\\GIGABYTE\\Downloads\\นำเข้าข้อมูล\\เกรด.csv', 'utf8');
  const rows = parseCSV(fileContent);
  const dataRows = rows.slice(1);
  
  let matchCount = 0;
  let unmatchCount = 0;

  for (const row of dataRows) {
    if (row.length < 5) continue;
    const [studentCode, courseCode, semNum, startYear, gradeMark] = row;
    
    const student = await prisma.student.findUnique({ where: { studentCode } });
    const course = await prisma.course.findUnique({ where: { code: courseCode } });
    
    if (!student || !course) {
       unmatchCount++;
       continue;
    }

    const semester = await prisma.semester.findFirst({
      where: { semesterNumber: parseInt(semNum), academicYear: parseInt(startYear) }
    });
    
    if (!semester) {
       unmatchCount++;
       continue;
    }

    const section = await prisma.courseSection.findFirst({
      where: { courseId: course.id, semesterId: semester.id }
    });
    
    if (!section) {
       unmatchCount++;
       continue;
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_sectionId: { studentId: student.id, sectionId: section.id }
      }
    });

    if (enrollment) {
      matchCount++;
      console.log(`✅ ตรง! รหัส: ${studentCode} วิชา: ${courseCode} เทอม: ${semNum}/${startYear} เกรด: ${gradeMark}`);
    } else {
      unmatchCount++;
    }
  }

  console.log(`\nสรุป: ตรง ${matchCount} รายการ, ไม่ตรง (หาไม่เจอ) ${unmatchCount} รายการ`);
}

main().finally(() => prisma.$disconnect());
