"use client";
export const dynamic = "force-dynamic";

import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle, AlertCircle, Bell } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const enrolledCourses = [
    {
      code: "01418221",
      name: "โครงสร้างข้อมูล",
      instructor: "ผศ.ดร. สมศักดิ์ ใจดี",
      status: "in-progress",
      grade: "A",
    },
    {
      code: "01418222",
      name: "อัลกอริทึม",
      instructor: "ผศ.ดร. ประณีต วรรณศิลป์",
      status: "in-progress",
      grade: "B+",
    },
    {
      code: "01418223",
      name: "ระบบฐานข้อมูล",
      instructor: "ดร. กิจเสริมศักดิ์ เล่นชอบ",
      status: "completed",
      grade: "A-",
    },
  ];

  const announcements = [
    { id: 1, title: "ลดราคาค่าหอพักเทอมต่อไป", date: "15 มีนาคม 2025", type: "important" },
    { id: 2, title: "การขยายเวลาการสอบกลางเทอม", date: "14 มีนาคม 2025", type: "update" },
    { id: 3, title: "เปิดลงทะเบียนวิชาเลือกสำหรับเทอมถัดไป", date: "12 มีนาคม 2025", type: "update" },
    { id: 4, title: "เลื่อนวันสอบปลายเทอมไปสัปดาห์ที่ 1 เมษายน", date: "10 มีนาคม 2025", type: "important" },
  ];

  return (
    <Layout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">แดชบอร์ด</h1>
          <p className="text-slate-600 mt-1">ยินดีต้อนรับกลับมา! นี่คือภาพรวมของวิชาที่ลงทะเบียนของคุณ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: "วิชาลงทะเบียน", value: "3", color: "bg-blue-100 text-blue-600" },
            { icon: Clock, label: "กำลังเรียน", value: "2", color: "bg-yellow-100 text-yellow-600" },
            { icon: CheckCircle, label: "เรียนจบแล้ว", value: "5", color: "bg-green-100 text-green-600" },
            { icon: AlertCircle, label: "หน่วยกิตที่ได้", value: "45", color: "bg-purple-100 text-purple-600" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">วิชาที่ลงทะเบียน</h2>
                <Link href="/courses/student">
                  <Button variant="outline" size="sm">ดูทั้งหมด</Button>
                </Link>
              </div>

              <div className="space-y-3">
                {enrolledCourses.map((course) => (
                  <div key={course.code} className="p-4 border border-slate-200 rounded-lg hover:border-primary transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <code className="text-sm font-mono font-bold text-primary">{course.code}</code>
                        <h3 className="font-medium text-slate-900 mt-1">{course.name}</h3>
                        <p className="text-sm text-slate-600">{course.instructor}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${course.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {course.status === "completed" ? "เรียนจบแล้ว" : "กำลังเรียน"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-full bg-slate-200 rounded-full h-2 mr-3">
                        <div className="bg-primary h-2 rounded-full" style={{ width: course.status === "completed" ? "100%" : "75%" }} />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{course.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-6 border border-slate-200 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="text-slate-900" />
              <h3 className="font-bold text-slate-900">ประกาศและข่าวสาร</h3>
            </div>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="pb-3 border-b border-slate-200 last:border-b-0">
                  <div className="flex gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${announcement.type === "important" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                      {announcement.type === "important" ? "สำคัญ" : "ข่าวสาร"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{announcement.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{announcement.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
