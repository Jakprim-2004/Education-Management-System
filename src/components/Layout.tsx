"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CheckCircle,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Megaphone,
  Calendar,
  GraduationCap,
  CalendarCheck,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  role: "student" | "teacher" | "admin";
}

export default function Layout({ children, role }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const getNavItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: "แดชบอร์ด", path: `/dashboard/${role}` },
      { icon: User, label: "โปรไฟล์", path: `/profile/${role}` },
    ];

    if (role === "student") {
      return [
        ...baseItems,
        { icon: BookOpen, label: "วิชาของฉัน", path: `/courses/${role}` },
        { icon: ClipboardList, label: "วางแผนวิชา", path: `/course-planner/${role}` },
        { icon: ClipboardList, label: "แคตตาล็อกวิชา", path: `/catalog/${role}` },
        { icon: CheckCircle, label: "ตรวจสอบการลงทะเบียน", path: `/registration/${role}` },
        { icon: CalendarCheck, label: "ตารางเรียน", path: `/schedule-submit/${role}` },
        { icon: GraduationCap, label: "ตรวจสอบจบ", path: `/graduation-check/${role}` },
      ];
    } else if (role === "teacher") {
      return [
        ...baseItems,
        { icon: BookOpen, label: "วิชาของฉัน", path: `/courses/${role}` },
        { icon: Users, label: "รายชื่อนิสิต", path: `/students/${role}` },
        { icon: Calendar, label: "นัดสอนชดเชย", path: `/makeup-class/${role}` },
      ];
    } else if (role === "admin") {
      return [
        { icon: LayoutDashboard, label: "แดชบอร์ด", path: `/dashboard/${role}` },
        { icon: Users, label: "ผู้ใช้", path: `/users/${role}` },
        { icon: BookOpen, label: "จัดการรายวิชา", path: `/courses/${role}` },
        { icon: ClipboardList, label: "จัดการหลักสูตร", path: `/curriculum/${role}` },
        { icon: CheckCircle, label: "นำเข้าข้อมูล", path: `/import/${role}` },
        { icon: Megaphone, label: "ประกาศข่าวสาร", path: `/announcements/${role}` },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-0"
          } bg-white border-r border-slate-200 transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Image src="/KU_Logo_PNG.png" alt="KU" width={40} height={40} className="object-contain" />
            <span className="text-lg font-bold text-slate-900">มก.กำแพงแสน</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 p-6 absolute bottom-0 w-64">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center gap-2"
          >
            <LogOut size={16} />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {role === "student" ? "นิสิต" : role === "teacher" ? "อาจารย์" : "ผู้ดูแลระบบ"}
              </p>
              <p className="text-xs text-slate-500">
                {role === "student" ? "รหัส 6321651575" : role === "teacher" ? "รหัส T001" : "ระบบ"}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              {role.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
