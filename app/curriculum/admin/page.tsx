"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X, Plus, BookOpen, Trash2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(1);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({ code: "", name: "", credits: 3, type: "วิชาบังคับ" as CurriculumCourse["type"], prerequisite: "" });
  const [localPlans, setLocalPlans] = useState<SemesterPlan[]>([]);

  const { data: curriculumResponse, isLoading, isError, error } = useQuery({
    queryKey: ['adminCurriculum'],
    queryFn: async () => {
      const res = await fetch('/api/curriculum/admin');
      if (!res.ok) throw new Error('Failed to fetch curriculum data');
      return res.json();
    }
  });

  const { data: coursesResponse } = useQuery({
    queryKey: ['adminCoursesList'],
    queryFn: async () => {
      const res = await fetch('/api/courses/admin');
      if (!res.ok) return { data: [] };
      return res.json();
    }
  });
  const allCourses: any[] = coursesResponse?.data || [];

  const handleCodeChange = (code: string) => {
    const existing = allCourses.find((c: any) => c.code.toLowerCase() === code.toLowerCase());
    if (existing) {
      let mappedType: CurriculumCourse["type"] = "วิชาบังคับ";
      if (existing.type === "elective") mappedType = "วิชาเลือก";
      if (existing.type === "general") mappedType = "วิชาศึกษาทั่วไป";
      
      setNewCourse({
        ...newCourse,
        code: existing.code,
        name: existing.name,
        credits: existing.credits,
        type: mappedType
      });
    } else {
      setNewCourse({ ...newCourse, code });
    }
  };

  useEffect(() => {
    if (curriculumResponse?.data?.plans) {
      const apiPlans = curriculumResponse.data.plans as SemesterPlan[];
      const fullPlans: SemesterPlan[] = [];
      for (let y = 1; y <= 4; y++) {
        for (let s = 1; s <= 2; s++) {
          const existing = apiPlans.find(p => p.year === y && p.semester === s);
          if (existing) {
            fullPlans.push(existing);
          } else {
            fullPlans.push({ year: y, semester: s, courses: [] });
          }
        }
      }
      setLocalPlans(fullPlans);
    }
  }, [curriculumResponse]);

  const plans = localPlans;
  const departmentName = curriculumResponse?.data?.department || "วิศวกรรมคอมพิวเตอร์";

  const currentPlans = plans.filter((p) => p.year === selectedYear);
  const totalCredits = plans.reduce((sum, p) => sum + p.courses.reduce((s, c) => s + c.credits, 0), 0);
  const existingCourseCodes = plans.flatMap(p => p.courses.map(c => c.code.toLowerCase()));

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
    setLocalPlans(updated);
    setNewCourse({ code: "", name: "", credits: 3, type: "วิชาบังคับ", prerequisite: "" });
    setActiveFormId(null);
  };

  const handleRemoveCourse = (yearNum: number, semNum: number, courseId: string) => {
    const planIdx = plans.findIndex((p) => p.year === yearNum && p.semester === semNum);
    if (planIdx === -1) return;
    const updated = [...plans];
    updated[planIdx] = {
      ...updated[planIdx],
      courses: updated[planIdx].courses.filter((c) => c.id !== courseId),
    };
    setLocalPlans(updated);
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/curriculum/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plans: localPlans }),
      });
      
      if (!res.ok) throw new Error('Failed to save curriculum');
      
      setIsEditing(false);
      toast({ title: "สำเร็จ", description: "บันทึกปรับปรุงหลักสูตรเรียบร้อยแล้ว" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "ข้อผิดพลาด", description: "เกิดข้อผิดพลาดในการบันทึกหลักสูตร", variant: "destructive" });
    }
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
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="flex items-center gap-2"
            variant={isEditing ? "outline" : "default"}
          >
            {isEditing ? <><Save size={16} /> บันทึกการเปลี่ยนแปลง</> : <><Edit2 size={16} /> แก้ไขหลักสูตร</>}
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
                  onClick={() => setActiveFormId(`${plan.year}-${plan.semester}`)}
                >
                  <Plus size={16} /> เพิ่มวิชา
                </Button>
              )}
            </div>

            {/* Add form */}
            {isEditing && activeFormId === `${plan.year}-${plan.semester}` && (
              <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 mb-3">
                  <div className="relative">
                    <Input
                      placeholder="พิมพ์เพื่อค้นหารหัสวิชา หรือ ชื่อวิชา..."
                      value={newCourse.code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      className="border border-slate-300"
                      autoComplete="off"
                    />
                    {(() => {
                      const exactMatch = allCourses.find((c: any) => c.code.toLowerCase() === newCourse.code.toLowerCase());
                      if (exactMatch) return null; // Hide if exactly matched
                      
                      if (!newCourse.code) return null; // Hide until user starts typing

                      const filtered = allCourses
                        .filter((c: any) => !existingCourseCodes.includes(c.code.toLowerCase()))
                        .filter((c: any) => c.code.toLowerCase().includes(newCourse.code.toLowerCase()) || c.name.toLowerCase().includes(newCourse.code.toLowerCase()))
                        .slice(0, 50);

                      if (filtered.length === 0) {
                         if (newCourse.code) {
                            return (
                               <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg px-4 py-3 text-sm text-slate-500">
                                 ไม่พบวิชานี้ในระบบ กรุณาเพิ่มข้อมูลวิชาก่อน
                               </div>
                            );
                         }
                         return null;
                      }

                      return (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-auto">
                          {filtered.map((c: any) => (
                              <div 
                                key={c.id} 
                                className="px-4 py-2 flex text-sm items-center hover:bg-slate-100 cursor-pointer transition-colors"
                                onClick={() => handleCodeChange(c.code)}
                              >
                                <span className="font-mono font-bold text-primary mr-2 min-w-[70px]">{c.code}</span>
                                <span className="text-slate-700 truncate">{c.name}</span>
                              </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAddCourse(plan.year, plan.semester)}>
                    เพิ่ม
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setActiveFormId(null)}>
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
