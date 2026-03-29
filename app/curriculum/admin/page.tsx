"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X, Plus, BookOpen, Trash2 } from "lucide-react";

interface CurriculumCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: "วิชาบังคับ" | "วิชาเลือก" | "วิชาศึกษาทั่วไป" | "วิชาเสรี";
  prerequisite?: string;
}

interface SemesterPlan {
  year: number;
  semester: number;
  courses: CurriculumCourse[];
}

export default function AdminCurriculum() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ code: "", name: "", credits: 3, type: "วิชาบังคับ" as CurriculumCourse["type"], prerequisite: "" });

  const [plans, setPlans] = useState<SemesterPlan[]>([
    {
      year: 1,
      semester: 1,
      courses: [
        { id: "1", code: "01418101", name: "การเขียนโปรแกรมคอมพิวเตอร์", credits: 3, type: "วิชาบังคับ" },
        { id: "2", code: "01418102", name: "คณิตศาสตร์ดิสครีต", credits: 3, type: "วิชาบังคับ" },
        { id: "3", code: "01175111", name: "ภาษาอังกฤษเบื้องต้น", credits: 3, type: "วิชาศึกษาทั่วไป" },
        { id: "4", code: "01355101", name: "ภาษาไทยเพื่อการสื่อสาร", credits: 3, type: "วิชาศึกษาทั่วไป" },
        { id: "5", code: "01418103", name: "แคลคูลัส 1", credits: 3, type: "วิชาบังคับ" },
        { id: "6", code: "01420101", name: "ฟิสิกส์ทั่วไป", credits: 3, type: "วิชาบังคับ" },
      ],
    },
    {
      year: 1,
      semester: 2,
      courses: [
        { id: "7", code: "01418111", name: "การเขียนโปรแกรมเชิงวัตถุ", credits: 3, type: "วิชาบังคับ", prerequisite: "01418101" },
        { id: "8", code: "01418112", name: "แคลคูลัส 2", credits: 3, type: "วิชาบังคับ", prerequisite: "01418103" },
        { id: "9", code: "01175112", name: "ภาษาอังกฤษระดับกลาง", credits: 3, type: "วิชาศึกษาทั่วไป" },
        { id: "10", code: "01418113", name: "สถิติเบื้องต้น", credits: 3, type: "วิชาบังคับ" },
        { id: "11", code: "01420102", name: "ปฏิบัติการฟิสิกส์", credits: 1, type: "วิชาบังคับ" },
      ],
    },
    {
      year: 2,
      semester: 1,
      courses: [
        { id: "12", code: "01418221", name: "โครงสร้างข้อมูล", credits: 3, type: "วิชาบังคับ", prerequisite: "01418111" },
        { id: "13", code: "01418222", name: "อัลกอริทึม", credits: 3, type: "วิชาบังคับ", prerequisite: "01418221" },
        { id: "14", code: "01418223", name: "ระบบฐานข้อมูล", credits: 3, type: "วิชาบังคับ", prerequisite: "01418101" },
        { id: "15", code: "01418224", name: "สถาปัตยกรรมคอมพิวเตอร์", credits: 3, type: "วิชาบังคับ" },
        { id: "16", code: "01999033", name: "วิชาเลือกเสรี 1", credits: 3, type: "วิชาเสรี" },
      ],
    },
    {
      year: 2,
      semester: 2,
      courses: [
        { id: "17", code: "01418231", name: "ระบบปฏิบัติการ", credits: 3, type: "วิชาบังคับ", prerequisite: "01418224" },
        { id: "18", code: "01418232", name: "เว็บแอปพลิเคชัน", credits: 3, type: "วิชาบังคับ", prerequisite: "01418111" },
        { id: "19", code: "01418233", name: "เครือข่ายคอมพิวเตอร์", credits: 3, type: "วิชาบังคับ" },
        { id: "20", code: "01418234", name: "วิศวกรรมซอฟต์แวร์", credits: 3, type: "วิชาบังคับ" },
      ],
    },
    {
      year: 3,
      semester: 1,
      courses: [
        { id: "21", code: "01418321", name: "ปัญญาประดิษฐ์", credits: 3, type: "วิชาบังคับ", prerequisite: "01418222" },
        { id: "22", code: "01418322", name: "ความมั่นคงทางไซเบอร์", credits: 3, type: "วิชาเลือก", prerequisite: "01418233" },
        { id: "23", code: "01418323", name: "การวิเคราะห์ข้อมูล", credits: 3, type: "วิชาเลือก", prerequisite: "01418223" },
        { id: "24", code: "01418324", name: "วิชาเลือกเฉพาะทาง 1", credits: 3, type: "วิชาเลือก" },
      ],
    },
    {
      year: 3,
      semester: 2,
      courses: [
        { id: "25", code: "01418331", name: "สัมมนา", credits: 1, type: "วิชาบังคับ" },
        { id: "26", code: "01418332", name: "คอมพิวเตอร์กราฟิกส์", credits: 3, type: "วิชาเลือก" },
        { id: "27", code: "01418333", name: "วิชาเลือกเฉพาะทาง 2", credits: 3, type: "วิชาเลือก" },
        { id: "28", code: "01418334", name: "วิชาเลือกเฉพาะทาง 3", credits: 3, type: "วิชาเลือก" },
      ],
    },
    {
      year: 4,
      semester: 1,
      courses: [
        { id: "29", code: "01418421", name: "โครงงานวิศวกรรม 1", credits: 3, type: "วิชาบังคับ" },
        { id: "30", code: "01418422", name: "การฝึกงาน", credits: 3, type: "วิชาบังคับ" },
        { id: "31", code: "01418423", name: "วิชาเลือกเฉพาะทาง 4", credits: 3, type: "วิชาเลือก" },
      ],
    },
    {
      year: 4,
      semester: 2,
      courses: [
        { id: "32", code: "01418431", name: "โครงงานวิศวกรรม 2", credits: 3, type: "วิชาบังคับ", prerequisite: "01418421" },
        { id: "33", code: "01418432", name: "วิชาเลือกเฉพาะทาง 5", credits: 3, type: "วิชาเลือก" },
        { id: "34", code: "01999034", name: "วิชาเลือกเสรี 2", credits: 3, type: "วิชาเสรี" },
      ],
    },
  ]);

  const currentPlans = plans.filter((p) => p.year === selectedYear);
  const totalCredits = plans.reduce((sum, p) => sum + p.courses.reduce((s, c) => s + c.credits, 0), 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "วิชาบังคับ": return "bg-blue-100 text-blue-700";
      case "วิชาเลือก": return "bg-purple-100 text-purple-700";
      case "วิชาศึกษาทั่วไป": return "bg-green-100 text-green-700";
      case "วิชาเสรี": return "bg-orange-100 text-orange-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const handleAddCourse = (yearNum: number, semNum: number) => {
    if (!newCourse.code || !newCourse.name) return;
    const planIdx = plans.findIndex((p) => p.year === yearNum && p.semester === semNum);
    if (planIdx === -1) return;
    const updated = [...plans];
    updated[planIdx] = {
      ...updated[planIdx],
      courses: [
        ...updated[planIdx].courses,
        {
          id: Math.random().toString(),
          code: newCourse.code,
          name: newCourse.name,
          credits: newCourse.credits,
          type: newCourse.type,
          prerequisite: newCourse.prerequisite || undefined,
        },
      ],
    };
    setPlans(updated);
    setNewCourse({ code: "", name: "", credits: 3, type: "วิชาบังคับ", prerequisite: "" });
    setShowAddForm(false);
  };

  const handleRemoveCourse = (yearNum: number, semNum: number, courseId: string) => {
    const planIdx = plans.findIndex((p) => p.year === yearNum && p.semester === semNum);
    if (planIdx === -1) return;
    const updated = [...plans];
    updated[planIdx] = {
      ...updated[planIdx],
      courses: updated[planIdx].courses.filter((c) => c.id !== courseId),
    };
    setPlans(updated);
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">จัดการหลักสูตร</h1>
            <p className="text-slate-600 mt-1">
              แก้ไขโครงสร้างหลักสูตรและแผนการลงทะเบียน
            </p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
            variant={isEditing ? "outline" : "default"}
          >
            {isEditing ? <><X size={16} /> เสร็จสิ้น</> : <><Edit2 size={16} /> แก้ไขหลักสูตร</>}
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 border border-slate-200">
            <p className="text-xs text-slate-600">หลักสูตร</p>
            <p className="text-lg font-bold text-slate-900">วิศวกรรมคอมพิวเตอร์</p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <p className="text-xs text-slate-600">ระยะเวลา</p>
            <p className="text-2xl font-bold text-slate-900">4 ปี</p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <p className="text-xs text-slate-600">หน่วยกิตรวม</p>
            <p className="text-2xl font-bold text-primary">{totalCredits}</p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <p className="text-xs text-slate-600">จำนวนรายวิชา</p>
            <p className="text-2xl font-bold text-slate-900">
              {plans.reduce((sum, p) => sum + p.courses.length, 0)}
            </p>
          </Card>
        </div>

        {/* Year Selector */}
        <Card className="p-4 border border-slate-200">
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedYear === year
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ปีที่ {year}
              </button>
            ))}
          </div>
        </Card>

        {/* Semester Plans */}
        {currentPlans.map((plan) => (
          <Card key={`${plan.year}-${plan.semester}`} className="p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  ปีที่ {plan.year} — ภาคเรียนที่ {plan.semester}
                </h2>
                <p className="text-sm text-slate-600">
                  {plan.courses.length} วิชา • {plan.courses.reduce((s, c) => s + c.credits, 0)} หน่วยกิต
                </p>
              </div>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus size={16} /> เพิ่มวิชา
                </Button>
              )}
            </div>

            {/* Add form */}
            {isEditing && showAddForm && (
              <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <Input
                    placeholder="รหัสวิชา"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    className="border border-slate-300"
                  />
                  <Input
                    placeholder="ชื่อวิชา"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    className="border border-slate-300"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    placeholder="หน่วยกิต"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
                    className="border border-slate-300"
                  />
                  <select
                    value={newCourse.type}
                    onChange={(e) => setNewCourse({ ...newCourse, type: e.target.value as CurriculumCourse["type"] })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="วิชาบังคับ">วิชาบังคับ</option>
                    <option value="วิชาเลือก">วิชาเลือก</option>
                    <option value="วิชาศึกษาทั่วไป">วิชาศึกษาทั่วไป</option>
                    <option value="วิชาเสรี">วิชาเสรี</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAddCourse(plan.year, plan.semester)}>
                    เพิ่ม
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                    ยกเลิก
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {plan.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-bold text-primary">{course.code}</code>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${getTypeColor(course.type)}`}>
                        {course.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{course.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">{course.credits} หน่วยกิต</span>
                      {course.prerequisite && (
                        <span className="text-xs text-slate-500">
                          วิชาบังคับก่อน: {course.prerequisite}
                        </span>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveCourse(plan.year, plan.semester, course.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
