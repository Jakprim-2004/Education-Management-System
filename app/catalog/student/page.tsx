"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Users, Clock } from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  semester: string;
  students: number;
  description: string;
  prerequisite?: string;
  schedule: string;
}

const allCourses: Course[] = [
  {
    id: "1",
    code: "01418221",
    name: "โครงสร้างข้อมูล",
    credits: 3,
    instructor: "ผศ.ดร. สมศักดิ์ ใจดี",
    semester: "2567/1",
    students: 45,
    description: "วิชาที่เรียนเกี่ยวกับโครงสร้างและการจัดการข้อมูลต่างๆ เช่น อาเรย์ ลิงก์ลิสต์ สแตก คิว และต้นไม้",
    prerequisite: "01418101 - การเขียนโปรแกรม",
    schedule: "จ 14:00-16:50 น.",
  },
  {
    id: "2",
    code: "01418222",
    name: "อัลกอริทึม",
    credits: 3,
    instructor: "ผศ.ดร. ประณีต วรรณศิลป์",
    semester: "2567/1",
    students: 38,
    description: "ศึกษาการออกแบบและวิเคราะห์อัลกอริทึมต่างๆ รวมถึงความซับซ้อนของเวลาและพื้นที่",
    prerequisite: "01418221 - โครงสร้างข้อมูล",
    schedule: "พ 13:00-15:50 น.",
  },
  {
    id: "3",
    code: "01418223",
    name: "ระบบฐานข้อมูล",
    credits: 3,
    instructor: "ดร. กิจเสริมศักดิ์ เล่นชอบ",
    semester: "2567/1",
    students: 32,
    description: "วิชาที่สอนเกี่ยวกับการออกแบบและการจัดการฐานข้อมูล รวมถึง SQL และการนำไปใช้",
    prerequisite: "01418101 - การเขียนโปรแกรม",
    schedule: "ศ 10:00-12:50 น.",
  },
  {
    id: "4",
    code: "01418224",
    name: "เว็บแอปพลิเคชัน",
    credits: 3,
    instructor: "อ.สุรพล สัจธรรม",
    semester: "2567/1",
    students: 28,
    description: "การพัฒนาแอปพลิเคชันเว็บ โดยใช้ HTML CSS JavaScript และ frameworks ต่างๆ",
    prerequisite: "01418101 - การเขียนโปรแกรม",
    schedule: "ก 15:00-17:50 น.",
  },
  {
    id: "5",
    code: "01418225",
    name: "ความมั่นคงทางไซเบอร์",
    credits: 3,
    instructor: "ผศ.ดร. ชัยวัฒน์ อมรพร",
    semester: "2567/2",
    students: 25,
    description: "ศึกษาเกี่ยวกับการรักษาความมั่นคงของข้อมูล การเข้ารหัส และการป้องกันการโจมตี",
    prerequisite: "01418223 - ระบบฐานข้อมูล",
    schedule: "จ 16:00-18:50 น.",
  },
  {
    id: "6",
    code: "01418226",
    name: "ปัญญาประดิษฐ์",
    credits: 3,
    instructor: "ดร. ไพรินธร สินสมบูรณ์",
    semester: "2567/2",
    students: 42,
    description: "บทนำสู่ปัญญาประดิษฐ์ และการเรียนรู้ของเครื่อง อัลกอริทึมค้นหา และการแก้ปัญหา",
    prerequisite: "01418222 - อัลกอริทึม",
    schedule: "พ 14:00-16:50 น.",
  },
  {
    id: "7",
    code: "01418227",
    name: "ระบบเครือข่าย",
    credits: 3,
    instructor: "อ.ศิรชัย วงค์พานิช",
    semester: "2567/2",
    students: 35,
    description: "การศึกษาเกี่ยวกับเครือข่ายคอมพิวเตอร์ โปรโตคอล และการสื่อสารข้อมูล",
    prerequisite: "01418101 - การเขียนโปรแกรม",
    schedule: "ศ 13:00-15:50 น.",
  },
  {
    id: "8",
    code: "01418228",
    name: "วิทยาศาสตร์ข้อมูล",
    credits: 3,
    instructor: "ผศ.ดร. นัยนา สวัสดิวัฒน์",
    semester: "2568/1",
    students: 55,
    description: "การวิเคราะห์ข้อมูลขนาดใหญ่ สถิติ การหมายน้ำข้อมูล และการสร้างแบบจำลอง",
    prerequisite: "01418223 - ระบบฐานข้อมูล",
    schedule: "ก 10:00-12:50 น.",
  },
];

export default function CoursesCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("ทั้งหมด");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      course.code.includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester =
      selectedSemester === "ทั้งหมด" || course.semester === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  const semesters = ["ทั้งหมด", ...new Set(allCourses.map((c) => c.semester))];

  return (
    <Layout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">แคตตาล็อกวิชา</h1>
          <p className="text-slate-600 mt-1">ค้นหาและเรียนรู้เกี่ยวกับวิชาที่มีให้</p>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <Input
              placeholder="ค้นหาด้วยรหัสวิชา ชื่อวิชา หรืออาจารย์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border border-slate-300"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSemester === sem
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ภาค {sem}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="p-5 border border-slate-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedCourse(course)}
            >
              <div className="mb-3">
                <code className="text-sm font-mono font-bold text-primary">
                  {course.code}
                </code>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {course.name}
                </h3>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-slate-600">{course.instructor}</p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {course.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex items-center gap-1">
                  <BookOpen size={16} />
                  <span>{course.credits} หน่วยกิต</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{course.students} คน</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span className="truncate">{course.schedule}</span>
                </div>
              </div>

              <Button className="w-full mt-4" size="sm">
                ดูรายละเอียด
              </Button>
            </Card>
          ))}
        </div>

        {/* Course Detail Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl p-8 border border-slate-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <code className="text-sm font-mono font-bold text-primary">
                    {selectedCourse.code}
                  </code>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">
                    {selectedCourse.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    อาจารย์ผู้สอน
                  </label>
                  <p className="text-slate-900">{selectedCourse.instructor}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      หน่วยกิต
                    </label>
                    <p className="text-slate-900">{selectedCourse.credits}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      จำนวนนิสิต
                    </label>
                    <p className="text-slate-900">{selectedCourse.students}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    ตารางเรียน
                  </label>
                  <p className="text-slate-900">{selectedCourse.schedule}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    ภาค
                  </label>
                  <p className="text-slate-900">ภาค {selectedCourse.semester}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    รายละเอียดวิชา
                  </label>
                  <p className="text-slate-900">{selectedCourse.description}</p>
                </div>

                {selectedCourse.prerequisite && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      วิชาบังคับก่อน
                    </label>
                    <p className="text-slate-900">{selectedCourse.prerequisite}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedCourse(null)}
                >
                  ปิด
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
