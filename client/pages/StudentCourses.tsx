import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Clock, BookOpen, MessageSquare } from "lucide-react";

interface StudentCourse {
  id: string;
  code: string;
  name: string;
  instructor: string;
  grade: string;
  progress: number;
  status: "active" | "completed";
  announcement: number;
  schedule: string;
}

export default function StudentCourses() {
  const courses: StudentCourse[] = [
    {
      id: "1",
      code: "01418221",
      name: "โครงสร้างข้อมูล",
      instructor: "ผศ.ดร. สมศักดิ์ ใจดี",
      grade: "A",
      progress: 75,
      status: "active",
      announcement: 3,
      schedule: "จ 14:00-16:50 น.",
    },
    {
      id: "2",
      code: "01418222",
      name: "อัลกอริทึม",
      instructor: "ผศ.ดร. ประณีต วรรณศิลป์",
      grade: "B+",
      progress: 65,
      status: "active",
      announcement: 5,
      schedule: "พ 13:00-15:50 น.",
    },
    {
      id: "3",
      code: "01418223",
      name: "ระบบฐานข้อมูล",
      instructor: "ดร. กิจเสริมศักดิ์ เล่นชอบ",
      grade: "A-",
      progress: 100,
      status: "completed",
      announcement: 1,
      schedule: "ศ 10:00-12:50 น.",
    },
  ];

  return (
    <Layout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">วิชาของฉัน</h1>
          <p className="text-slate-600 mt-1">
            ดูและจัดการวิชาที่ลงทะเบียนทั้งหมด
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: BookOpen,
              label: "วิชาเรียนทั้งหมด",
              value: "3",
              color: "bg-blue-100 text-blue-600",
            },
            {
              icon: Clock,
              label: "กำลังเรียน",
              value: "2",
              color: "bg-yellow-100 text-yellow-600",
            },
            {
              icon: BookOpen,
              label: "เรียนจบแล้ว",
              value: "1",
              color: "bg-green-100 text-green-600",
            },
            {
              icon: BarChart3,
              label: "เกรดเฉลี่ย",
              value: "A-",
              color: "bg-purple-100 text-purple-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Active Courses */}
        <Card className="p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            วิชาที่กำลังเรียน
          </h2>
          <div className="space-y-4">
            {courses
              .filter((c) => c.status === "active")
              .map((course) => (
                <div
                  key={course.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono font-bold text-primary">
                          {course.code}
                        </code>
                        {course.announcement > 0 && (
                          <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                            <MessageSquare size={14} />
                            {course.announcement}
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900">
                        {course.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {course.instructor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {course.grade}
                      </p>
                      <p className="text-xs text-slate-500">{course.schedule}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-600">ความก้าวหน้า</span>
                      <span className="text-xs font-medium text-slate-900">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      เข้าเรียน
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      ดูรายละเอียด
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Completed Courses */}
        <Card className="p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            วิชาที่เรียนจบแล้ว
          </h2>
          <div className="space-y-3">
            {courses
              .filter((c) => c.status === "completed")
              .map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-bold text-primary">
                        {course.code}
                      </code>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                        เรียนจบแล้ว
                      </span>
                    </div>
                    <h3 className="font-medium text-slate-900">
                      {course.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {course.grade}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
