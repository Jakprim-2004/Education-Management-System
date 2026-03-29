"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, Download, Plus, X } from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: string;
  instructor?: string;
  status?: "planned" | "completed" | "in-progress";
}

export default function StudentCoursePlanner() {
  const [selectedSemester, setSelectedSemester] = useState("2567/1");
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      code: "01418221",
      name: "โครงสร้างข้อมูล",
      credits: 3,
      semester: "2566/2",
      status: "completed",
    },
    {
      id: "2",
      code: "01418222",
      name: "อัลกอริทึม",
      credits: 3,
      semester: "2567/1",
      status: "in-progress",
    },
    {
      id: "3",
      code: "01418223",
      name: "ระบบฐานข้อมูล",
      credits: 3,
      semester: "2567/1",
      status: "in-progress",
    },
    {
      id: "4",
      code: "01418224",
      name: "เว็บแอปพลิเคชัน",
      credits: 3,
      semester: "2567/1",
      status: "planned",
    },
    {
      id: "5",
      code: "01418225",
      name: "ความมั่นคงทางไซเบอร์",
      credits: 3,
      semester: "2567/2",
      status: "planned",
    },
  ]);

  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    code: "",
    name: "",
    credits: 3,
    semester: "2567/1",
  });

  const handleAddCourse = () => {
    if (newCourse.code && newCourse.name) {
      setCourses([
        ...courses,
        {
          id: Math.random().toString(),
          code: newCourse.code || "",
          name: newCourse.name || "",
          credits: newCourse.credits || 3,
          semester: newCourse.semester || "2567/1",
          status: "planned",
        },
      ]);
      setNewCourse({ code: "", name: "", credits: 3, semester: "2567/1" });
    }
  };

  const handleRemoveCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const filteredCourses = courses.filter((c) => c.semester === selectedSemester);
  const totalCredits = filteredCourses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <Layout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">วางแผนวิชา</h1>
            <p className="text-slate-600 mt-1">วางแผนและจัดการตารางเรียนของคุณ</p>
          </div>
          <Button className="flex items-center gap-2">
            <Download size={16} />
            ส่งออกแผน
          </Button>
        </div>

        {/* Semester Selector */}
        <Card className="p-4 border border-slate-200">
          <div className="flex flex-wrap gap-3">
            {["2566/2", "2567/1", "2567/2", "2568/1"].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSemester === sem
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ภาค {sem}
              </button>
            ))}
          </div>
        </Card>

        {/* Add New Course */}
        <Card className="p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">เพิ่มวิชา</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              placeholder="รหัสวิชา เช่น 01418221"
              value={newCourse.code || ""}
              onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
              className="border border-slate-300"
            />
            <Input
              placeholder="ชื่อวิชา"
              value={newCourse.name || ""}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              className="border border-slate-300"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="6"
                placeholder="หน่วยกิต"
                value={newCourse.credits || 3}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })
                }
                className="border border-slate-300 flex-1"
              />
              <Button onClick={handleAddCourse} className="flex items-center gap-2">
                <Plus size={16} />
                เพิ่ม
              </Button>
            </div>
          </div>
        </Card>

        {/* Courses List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                วิชา - ภาค {selectedSemester}
              </h2>
              {filteredCourses.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  ไม่มีวิชาที่วางแผนสำหรับภาคนี้
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono font-bold text-primary">
                            {course.code}
                          </code>
                          <span className={`text-xs px-2 py-1 rounded ${
                            course.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : course.status === "in-progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-200 text-slate-700"
                          }`}>
                            {course.status === "completed"
                              ? "เรียนจบแล้ว"
                              : course.status === "in-progress"
                              ? "กำลังเรียน"
                              : "วางแผน"}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          {course.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {course.credits} หน่วยกิต
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveCourse(course.id)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <X size={18} className="text-slate-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Summary Card */}
          <Card className="p-6 border border-slate-200 h-fit sticky top-6">
            <h3 className="font-bold text-slate-900 mb-4">สรุป</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">จำนวนวิชา</p>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredCourses.length}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">รวมหน่วยกิต</p>
                <p className="text-2xl font-bold text-primary">
                  {totalCredits}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">หน่วยกิตสูงสุด</p>
                <p className="text-sm text-slate-900">18 / 20</p>
              </div>
              <Button className="w-full mt-4">บันทึกแผน</Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
