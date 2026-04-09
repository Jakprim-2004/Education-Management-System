"use client";
export const dynamic = "force-dynamic";

import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle, AlertCircle, Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function StudentDashboard() {
  const { data: dashboardData, isLoading, isError, error } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/student");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <Layout role="student">
        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
          <p>กำลังดึงข้อมูลแดชบอร์ด...</p>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout role="student">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          <p className="font-bold mb-1">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <p className="text-sm">{error instanceof Error ? error.message : "โปรดลองใหม่อีกครั้ง"}</p>
        </div>
      </Layout>
    );
  }

  const { stats, enrolledCourses, announcements } = dashboardData?.data || { stats: [], enrolledCourses: [], announcements: [] };

  return (
    <Layout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">แดชบอร์ด</h1>
          <p className="text-slate-600 mt-1">ยินดีต้อนรับกลับมา! นี่คือภาพรวมของวิชาที่ลงทะเบียนของคุณ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat: any) => {
            let Icon = BookOpen;
            if (stat.id === "in-progress") Icon = Clock;
            if (stat.id === "completed") Icon = CheckCircle;
            if (stat.id === "credits") Icon = AlertCircle;
            
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
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((course: any) => (
                    <div key={course.code} className="p-4 border border-slate-200 rounded-lg hover:border-primary transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <code className="text-sm font-mono font-bold text-primary">{course.code}</code>
                          <h3 className="font-medium text-slate-900 mt-1">{course.name}</h3>
                          <p className="text-sm text-slate-600">{course.instructor}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${course.status === "completed" || (course.grade && course.grade !== "-") ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                          {course.status === "completed" || (course.grade && course.grade !== "-") ? "เรียนเสร็จแล้ว" : "กำลังเรียน"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-slate-200 rounded-full h-2 mr-3">
                          <div className="bg-primary h-2 rounded-full" style={{ width: course.status === "completed" || (course.grade && course.grade !== "-") ? "100%" : "75%" }} />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{course.grade}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-sm">ยังไม่มีรายวิชาที่ลงทะเบียนในขณะนี้</div>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-6 border border-slate-200 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="text-slate-900" />
              <h3 className="font-bold text-slate-900">ประกาศและข่าวสาร</h3>
            </div>
            <div className="space-y-3">
              {announcements.length > 0 ? (
                announcements.map((announcement: any) => (
                  <div key={announcement.id} className="pb-3 border-b border-slate-200 last:border-b-0">
                    <div className="flex gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${announcement.type === "important" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {announcement.type === "important" ? "สำคัญ" : "ข่าวสาร"}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{announcement.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{announcement.date}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500 text-sm">ไม่มีประกาศใหม่</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
