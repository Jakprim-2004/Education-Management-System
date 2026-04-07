"use client";
export const dynamic = "force-dynamic";

import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, BarChart3, Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

interface DashboardData {
  stats: {
    id: string;
    label: string;
    value: string;
    color: string;
  }[];
  myCourses: {
    code: string;
    name: string;
    students: number;
    status: string;
  }[];
  announcements: {
    id: number;
    title: string;
    date: string;
    type: string;
  }[];
}

export default function TeacherDashboard() {
  const { data: dashboardResponse, isLoading, isError, error } = useQuery({
    queryKey: ['teacherDashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/teacher');
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <Layout role="teacher">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout role="teacher">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-500 font-medium mb-2">ไม่สามารถโหลดข้อมูลแดชบอร์ดได้</p>
          <p className="text-slate-500 text-sm">{error instanceof Error ? error.message : "เกิดข้อผิดพลาดบางอย่าง"}</p>
        </div>
      </Layout>
    );
  }

  const data: DashboardData = dashboardResponse?.data;

  // Function to map icon string to lucide component dynamically 
  const getIcon = (id: string) => {
    switch (id) {
      case "my-courses": return BookOpen;
      case "total-students": return Users;
      case "avg-grade": return BarChart3;
      default: return BookOpen;
    }
  };

  return (
    <Layout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">แดชบอร์ด</h1>
          <p className="text-slate-600 mt-1">จัดการวิชาและนิสิตของคุณ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.stats.map((stat) => {
            const Icon = getIcon(stat.id);
            return (
              <Card key={stat.id} className="p-4 border border-slate-200">
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

        <Card className="p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">วิชาของฉัน</h2>
            <Link href="/courses/teacher">
              <Button variant="outline" size="sm">ดูทั้งหมด</Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            {data.myCourses.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">รหัสวิชา</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">ชื่อวิชา</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">นิสิต</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.myCourses.map((course) => (
                    <tr key={course.code} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{course.code}</td>
                      <td className="py-3 px-4">{course.name}</td>
                      <td className="py-3 px-4">{course.students}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${course.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                          {course.status === "Active" ? "ใช้งาน" : "สิ้นสุด"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-6 text-slate-500">
                ยังไม่มีวิชาที่อยู่ในความดูแล
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-slate-900" />
            <h3 className="font-bold text-slate-900">ประกาศและข่าวสาร</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.announcements.length > 0 ? data.announcements.map((announcement) => (
              <div key={announcement.id} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${announcement.type === "important" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                    {announcement.type === "important" ? "สำคัญ" : "ข่าวสาร"}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900">{announcement.title}</p>
                <p className="text-xs text-slate-500 mt-2">{announcement.date}</p>
              </div>
            )) : (
              <div className="col-span-full text-sm text-slate-500">ไม่มีประกาศใหม่</div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
