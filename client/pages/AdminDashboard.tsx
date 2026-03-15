import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Upload, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const stats = [
    { icon: Users, label: "ผู้ใช้ทั้งหมด", value: "1,245", color: "bg-blue-100 text-blue-600" },
    { icon: BookOpen, label: "วิชาทั้งหมด", value: "128", color: "bg-green-100 text-green-600" },
    {
      icon: Users,
      label: "นิสิตที่ใช้งาน",
      value: "892",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="text-slate-600 mt-1">ภาพรวมระบบและเครื่องมือจัดการ</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => {
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

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Management */}
          <Card className="p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">จัดการข้อมูล</h2>
                <p className="text-sm text-slate-600 mt-1">นำเข้าและจัดการข้อมูลระบบ</p>
              </div>
              <Upload className="text-primary" size={24} />
            </div>

            <div className="space-y-2">
              <Link to="/import/admin">
                <Button className="w-full justify-start" variant="outline">
                  นำเข้าข้อมูล
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                ส่งออกข้อมูล
              </Button>
              <Button className="w-full justify-start" variant="outline">
                สำรองระบบ
              </Button>
            </div>
          </Card>

          {/* User Management */}
          <Card className="p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">จัดการผู้ใช้</h2>
                <p className="text-sm text-slate-600 mt-1">จัดการผู้ใช้และสิทธิ์การใช้งาน</p>
              </div>
              <Users className="text-primary" size={24} />
            </div>

            <div className="space-y-2">
              <Link to="/users/admin">
                <Button className="w-full justify-start" variant="outline">
                  ดูผู้ใช้
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                เพิ่มผู้ใช้
              </Button>
              <Button className="w-full justify-start" variant="outline">
                จัดการบทบาท
              </Button>
            </div>
          </Card>

          {/* System Settings */}
          <Card className="p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">ตั้งค่าระบบ</h2>
                <p className="text-sm text-slate-600 mt-1">กำหนดค่าพารามิเตอร์ระบบ</p>
              </div>
              <Settings className="text-primary" size={24} />
            </div>

            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                การตั้งค่าระบบ
              </Button>
              <Button className="w-full justify-start" variant="outline">
                ตั้งค่าอีเมล
              </Button>
              <Button className="w-full justify-start" variant="outline">
                สำรองและคืนค่า
              </Button>
            </div>
          </Card>

          {/* Courses Management */}
          <Card className="p-6 border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">วิชา</h2>
                <p className="text-sm text-slate-600 mt-1">จัดการวิชาและหลักสูตร</p>
              </div>
              <BookOpen className="text-primary" size={24} />
            </div>

            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                ดูวิชา
              </Button>
              <Button className="w-full justify-start" variant="outline">
                สร้างวิชา
              </Button>
              <Button className="w-full justify-start" variant="outline">
                จัดการหลักสูตร
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
