"use client";
export const dynamic = "force-dynamic";

import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Clock, MessageSquare } from "lucide-react";

interface TeacherCourse {
  id: string;
  code: string;
  name: string;
  semester: string;
  students: number;
  classes: number;
  announcements: number;
  schedule: string;
  status: "active" | "completed";
}

export default function TeacherCourses() {
  const courses: TeacherCourse[] = [
    {
      id: "1",
      code: "01418221",
      name: "โครงสร้างข้อมูล",
      semester: "2567/1",
      students: 45,
      classes: 15,
      announcements: 3,
      schedule: "จ 14:00-16:50 น.",
      status: "active",
    },
    {
      id: "2",
      code: "01418222",
      name: "อัลกอริทึม",
      semester: "2567/1",
      students: 38,
      classes: 14,
      announcements: 5,
      schedule: "พ 13:00-15:50 น.",
      status: "active",
    },
    {
      id: "3",
      code: "01418223",
      name: "ระบบฐานข้อมูล",
      semester: "2567/1",
      students: 32,
      classes: 13,
      announcements: 2,
      schedule: "ศ 10:00-12:50 น.",
      status: "active",
    },
    {
      id: "4",
      code: "01418110",
      name: "การเขียนโปรแกรม",
      semester: "2566/2",
      students: 58,
      classes: 16,
      announcements: 0,
      schedule: "ก 10:00-12:50 น.",
      status: "completed",
    },
  ];

  const activeCourses = courses.filter((c) => c.status === "active");
  const completedCourses = courses.filter((c) => c.status === "completed");
  const totalStudents = activeCourses.reduce((sum, c) => sum + c.students, 0);

  return (
    <Layout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">วิชาของฉัน</h1>
          <p className="text-slate-600 mt-1">จัดการวิชาและชั้นเรียนทั้งหมด</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: BookOpen,
              label: "วิชาที่สอน",
              value: activeCourses.length,
              color: "bg-blue-100 text-blue-600",
            },
            {
              icon: Users,
              label: "นิสิตทั้งหมด",
              value: totalStudents,
              color: "bg-green-100 text-green-600",
            },
            {
              icon: Clock,
              label: "เรียนจบแล้ว",
              value: completedCourses.length,
              color: "bg-purple-100 text-purple-600",
            },
            {
              icon: MessageSquare,
              label: "ประกาศ",
              value: activeCourses.reduce((sum, c) => sum + c.announcements, 0),
              color: "bg-orange-100 text-orange-600",
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
                    <p className="text-2xl font-bold text-slate-900">
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
            วิชาที่กำลังสอน ({activeCourses.length})
          </h2>
          <div className="space-y-4">
            {activeCourses.map((course) => (
              <div
                key={course.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-bold text-primary">
                        {course.code}
                      </code>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                        ใช้งาน
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900">
                      {course.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {course.schedule}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {course.students}
                    </p>
                    <p className="text-xs text-slate-500">นิสิต</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-center text-sm border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-slate-600">ชั่วโมงเรียน</p>
                    <p className="font-bold text-slate-900">{course.classes}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">ประกาศ</p>
                    <p className="font-bold text-slate-900">
                      {course.announcements}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">ภาค</p>
                    <p className="font-bold text-slate-900">{course.semester}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    เข้าชั้นเรียน
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    ตั้งค่า
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              วิชาที่เรียนจบแล้ว ({completedCourses.length})
            </h2>
            <div className="space-y-3">
              {completedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-bold text-primary">
                        {course.code}
                      </code>
                      <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded font-medium">
                        เสร็จสิ้น
                      </span>
                    </div>
                    <h3 className="font-medium text-slate-900">
                      {course.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {course.students} นิสิต
                    </p>
                    <p className="text-xs text-slate-500">ภาค {course.semester}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
