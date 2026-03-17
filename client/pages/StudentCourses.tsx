import { useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { BarChart3, Clock, BookOpen, MessageSquare } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
}

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
  announcements: Announcement[];
}

export default function StudentCourses() {
  const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "announcements">("details");

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
      announcements: [
        {
          id: "a1",
          title: "งานส่งโปรแกรม Assignment 3",
          date: "15 มีนาคม 2025",
          content: "กำหนดส่งโปรแกรมการค้นหาในทรีในวันพุธที่ 19 มีนาคม 2025 เวลา 23:59 น.",
        },
        {
          id: "a2",
          title: "เลื่อนการสอบกลางเทอม",
          date: "12 มีนาคม 2025",
          content: "เลื่อนการสอบกลางเทอมจากวันที่ 18 มีนาคมไปเป็นวันที่ 20 มีนาคม 2025 สัปดาห์หน้า",
        },
        {
          id: "a3",
          title: "เปิดแชทถาม-ตอบ ออนไลน์",
          date: "10 มีนาคม 2025",
          content: "เปิดแชทสำหรับถามข้อสงสัยเกี่ยวกับเนื้อหาโครงสร้างข้อมูล ทุกวันจันทร์-ศุกร์ 15:00-17:00 น.",
        },
      ],
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
      announcements: [
        {
          id: "a1",
          title: "โครงงานกลางเทอม",
          date: "14 มีนาคม 2025",
          content: "เริ่มส่งโครงงานวิเคราะห์ความซับซ้อนของอัลกอริทึมตั้งแต่วันนี้",
        },
        {
          id: "a2",
          title: "ประกาศเรื่องการสอบ",
          date: "11 มีนาคม 2025",
          content: "สอบปลายเทอมจะขึ้นแบบจริง ไม่เป็นแบบเรียงความ ให้เตรียมตัวให้ดี",
        },
        {
          id: "a3",
          title: "เปิดห้องติวเสริม",
          date: "10 มีนาคม 2025",
          content: "เปิดห้องติวเสริมทุกศุกร์เวลา 16:00-18:00 น. ห้อง 101 ชั้น 2",
        },
        {
          id: "a4",
          title: "อัพเดตหนังสือเรียน",
          date: "8 มีนาคม 2025",
          content: "อัพเดตคำตอบแบบฝึกหัดบทที่ 5 ในหน้าเวบไซต์วิชา",
        },
        {
          id: "a5",
          title: "ประชุมเตือนความสำคัญ",
          date: "5 มีนาคม 2025",
          content: "ขอให้มาเรียนตรงเวลา และส่งการบ้านตรงกำหนด",
        },
      ],
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
      announcements: [
        {
          id: "a1",
          title: "วิชาเรียนจบแล้ว",
          date: "30 มกราคม 2025",
          content: "ปิดวิชาเรียนแล้ว สามารถดูเกรดสุดท้ายได้ในแถบข้างล่าง",
        },
      ],
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedCourse(course)}
                    >
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

        {/* Course Details Modal */}
        <Dialog open={!!selectedCourse} onOpenChange={() => {
          setSelectedCourse(null);
          setActiveTab("details");
        }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedCourse?.name}
              </DialogTitle>
              <DialogClose />
            </DialogHeader>
            {selectedCourse && (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === "details"
                        ? "text-primary border-b-2 border-primary"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    รายละเอียดวิชา
                  </button>
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === "announcements"
                        ? "text-primary border-b-2 border-primary"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ประกาศ ({selectedCourse.announcement})
                  </button>
                </div>

                {/* Details Tab */}
                {activeTab === "details" && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">รหัสวิชา</p>
                        <p className="text-lg font-bold text-primary">
                          {selectedCourse.code}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">อาจารย์ผู้สอน</p>
                        <p className="text-lg font-medium text-slate-900">
                          {selectedCourse.instructor}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">เกรด</p>
                        <p className="text-lg font-bold text-primary">
                          {selectedCourse.grade}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">เวลาเรียน</p>
                        <p className="text-lg font-medium text-slate-900">
                          {selectedCourse.schedule}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium text-slate-900">
                          ความก้าวหน้า
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {selectedCourse.progress}%
                        </p>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all"
                          style={{ width: `${selectedCourse.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">สถานะ</p>
                      <p
                        className={`text-sm font-bold mt-1 ${
                          selectedCourse.status === "completed"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {selectedCourse.status === "completed"
                          ? "เรียนจบแล้ว"
                          : "กำลังเรียน"}
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setActiveTab("announcements")}
                      >
                        ดูรายการประกาศ
                      </Button>
                      <Button className="flex-1">ดูเนื้อหาวิชา</Button>
                    </div>
                  </div>
                )}

                {/* Announcements Tab */}
                {activeTab === "announcements" && (
                  <div className="space-y-3">
                    {selectedCourse.announcements.length > 0 ? (
                      selectedCourse.announcements.map((announcement) => (
                        <div
                          key={announcement.id}
                          className="p-4 border border-slate-200 rounded-lg hover:border-primary transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-slate-900">
                              {announcement.title}
                            </h3>
                            <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                              {announcement.date}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">
                            {announcement.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-600">
                        ไม่มีประกาศในวิชานี้
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
