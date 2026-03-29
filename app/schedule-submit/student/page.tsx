"use client";
export const dynamic = "force-dynamic";

import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, BookOpen, Bell } from "lucide-react";

interface RegisteredCourse {
  code: string;
  name: string;
  day: string;
  time: string;
  room: string;
  instructor: string;
}

interface MakeupNotification {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  reason: string;
  originalDate: string;
  makeupDate: string;
  makeupTime: string;
  makeupRoom: string;
  sentAt: string;
  status: "กำลังรอ" | "ยืนยันแล้ว";
}

export default function StudentScheduleSubmit() {
  // ตารางเรียนของนิสิต (ดึงจากระบบลงทะเบียนอัตโนมัติ)
  const registeredCourses: RegisteredCourse[] = [
    { code: "01418221", name: "โครงสร้างข้อมูล", day: "จันทร์", time: "14:00 - 16:50", room: "SC2-105", instructor: "ผศ.ดร. สมศักดิ์ ใจดี" },
    { code: "01175112", name: "ภาษาอังกฤษระดับกลาง", day: "อังคาร", time: "10:00 - 12:50", room: "HM-302", instructor: "อ.สมหญิง สุขใจ" },
    { code: "01418222", name: "อัลกอริทึม", day: "พุธ", time: "13:00 - 15:50", room: "SC2-201", instructor: "ผศ.ดร. ประณีต วรรณศิลป์" },
    { code: "01418224", name: "เว็บแอปพลิเคชัน", day: "พฤหัสบดี", time: "14:00 - 16:50", room: "SC2-Lab3", instructor: "อ.สุรพล สัจธรรม" },
    { code: "01418223", name: "ระบบฐานข้อมูล", day: "ศุกร์", time: "10:00 - 12:50", room: "SC2-109", instructor: "ดร. กิจเสริมศักดิ์ เล่นชอบ" },
  ];

  // แจ้งเตือนนัดสอนชดเชยจากอาจารย์
  const notifications: MakeupNotification[] = [
    {
      id: "1",
      courseCode: "01418221",
      courseName: "โครงสร้างข้อมูล",
      instructor: "ผศ.ดร. สมศักดิ์ ใจดี",
      reason: "ชดเชยวันหยุดราชการ (วันมาฆบูชา)",
      originalDate: "จันทร์ 26 ก.พ. 2567 เวลา 14:00 - 16:50",
      makeupDate: "เสาร์ 2 มี.ค. 2567",
      makeupTime: "09:00 - 11:50",
      makeupRoom: "SC2-105",
      sentAt: "20 ก.พ. 2567 เวลา 10:30",
      status: "กำลังรอ",
    },
    {
      id: "2",
      courseCode: "01418222",
      courseName: "อัลกอริทึม",
      instructor: "ผศ.ดร. ประณีต วรรณศิลป์",
      reason: "อาจารย์ไปราชการต่างจังหวัด",
      originalDate: "พุธ 12 มี.ค. 2567 เวลา 13:00 - 15:50",
      makeupDate: "ศุกร์ 16 มี.ค. 2567",
      makeupTime: "15:00 - 17:50",
      makeupRoom: "SC2-201",
      sentAt: "8 มี.ค. 2567 เวลา 14:15",
      status: "ยืนยันแล้ว",
    },
  ];

  const pendingNotifs = notifications.filter((n) => n.status === "กำลังรอ");
  const confirmedNotifs = notifications.filter((n) => n.status === "ยืนยันแล้ว");

  return (
    <Layout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">แจ้งตารางเรียน</h1>
          <p className="text-slate-600 mt-1">
            ตารางเรียนของคุณในภาคเรียนนี้ และแจ้งเตือนนัดสอนชดเชยจากอาจารย์
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600">วิชาที่ลงทะเบียน</p>
                <p className="text-2xl font-bold text-slate-900">{registeredCourses.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <Bell size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600">นัดชดเชยรอดำเนินการ</p>
                <p className="text-2xl font-bold text-slate-900">{pendingNotifs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600">ยืนยันแล้ว</p>
                <p className="text-2xl font-bold text-slate-900">{confirmedNotifs.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Makeup Notifications */}
        {notifications.length > 0 && (
          <Card className="p-6 border border-yellow-200 bg-yellow-50">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-yellow-600" />
              แจ้งเตือนนัดสอนชดเชยจากอาจารย์ ({notifications.length})
            </h2>
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border ${
                    notif.status === "กำลังรอ"
                      ? "border-yellow-300 bg-white"
                      : "border-green-300 bg-green-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono font-bold text-primary">{notif.courseCode}</code>
                        <span className="font-bold text-slate-900">{notif.courseName}</span>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          notif.status === "กำลังรอ"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {notif.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        อาจารย์: <span className="font-medium">{notif.instructor}</span>
                      </p>
                      <p className="text-sm text-slate-600 mb-3">เหตุผล: {notif.reason}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-600 font-medium mb-1">❌ วันเรียนเดิม (งดสอน)</p>
                          <p className="text-red-800">{notif.originalDate}</p>
                        </div>
                        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs text-green-600 font-medium mb-1">✅ วันนัดสอนชดเชย</p>
                          <p className="text-green-800 font-bold">{notif.makeupDate}</p>
                          <p className="text-green-700">เวลา {notif.makeupTime} • ห้อง {notif.makeupRoom}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mt-2">
                        📩 แจ้งเตือนเมื่อ: {notif.sentAt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* My Schedule */}
        <Card className="p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            ตารางเรียนของฉัน — ภาคเรียนที่ 1/2567
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            รายวิชาที่ลงทะเบียนเรียนแล้ว ({registeredCourses.length} วิชา • {registeredCourses.length * 3} หน่วยกิต)
          </p>
          <div className="space-y-3">
            {registeredCourses.map((course, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <div className="min-w-[80px] text-center">
                  <p className="text-sm font-bold text-primary">{course.day}</p>
                  <p className="text-xs text-slate-500">{course.time}</p>
                </div>
                <div className="h-10 w-px bg-slate-300" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono font-bold text-primary">{course.code}</code>
                    <span className="text-sm font-bold text-slate-900">{course.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>🏫 ห้อง {course.room}</span>
                    <span>👤 {course.instructor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
