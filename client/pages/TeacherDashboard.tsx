import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function TeacherDashboard() {
  const courses = [
    { code: "01418221", name: "โครงสร้างข้อมูล", students: 45, status: "Active" },
    { code: "01418222", name: "อัลกอริทึม", students: 38, status: "Active" },
    { code: "01418223", name: "ระบบฐานข้อมูล", students: 32, status: "Active" },
  ];

  return (
    <Layout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">แดชบอร์ด</h1>
          <p className="text-slate-600 mt-1">จัดการวิชาและนิสิตของคุณ</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: BookOpen,
              label: "วิชาของฉัน",
              value: "3",
              color: "bg-blue-100 text-blue-600",
            },
            {
              icon: Users,
              label: "จำนวนนิสิตทั้งหมด",
              value: "115",
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

        {/* Courses List */}
        <Card className="p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">วิชาของฉัน</h2>
            <Link to="/courses/teacher">
              <Button variant="outline" size="sm">
                ดูทั้งหมด
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    รหัสวิชา
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    ชื่อวิชา
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    นิสิต
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.code}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {course.code}
                    </td>
                    <td className="py-3 px-4">{course.name}</td>
                    <td className="py-3 px-4">{course.students}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        ใช้งาน
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">ลิงค์ด่วน</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <Link to="/students/teacher">
              <Button className="w-full justify-start" variant="outline">
                ดูรายชื่อนิสิต
              </Button>
            </Link>
            <Link to="/profile/teacher">
              <Button className="w-full justify-start" variant="outline">
                ดูโปรไฟล์
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
