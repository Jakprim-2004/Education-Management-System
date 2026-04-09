"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, Plus, X, Loader2, CheckCircle, Lock, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string; // 'req-1' or 'plan-2'
  courseId: number;
  code: string;
  name: string;
  credits: number;
  type: "required" | "elective" | "general";
  yearLevel: number;
  semester: number;
  status: "planned" | "completed" | "in-progress";
  isRequired: boolean;
}

export default function StudentCoursePlanner() {
  const [selectedYear, setSelectedYear] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for Add Course UI per semester
  const [addingToSemester, setAddingToSemester] = useState<number | null>(null); // 1 or 2
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: plannerData, isLoading, isError } = useQuery({
    queryKey: ['coursePlanner'],
    queryFn: async () => {
      const res = await fetch("/api/course-planner/student");
      if (!res.ok) throw new Error("Failed to fetch course planner");
      return res.json();
    }
  });

  const addMutation = useMutation({
    mutationFn: async (courseData: { courseCode: string; yearLevel: number; semester: number }) => {
      const res = await fetch("/api/course-planner/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add course");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coursePlanner'] });
      setAddingToSemester(null);
      setSearchQuery("");
      toast({
        title: "สำเร็จ",
        description: "เพิ่มวิชาในแผนการเรียนแล้ว",
        className: "bg-green-50 text-green-900 border-green-200"
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await fetch(`/api/course-planner/student?id=${planId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coursePlanner'] });
      toast({
        title: "สำเร็จ",
        description: "ลบวิชาออกจากแผนแล้ว",
        className: "bg-green-50 text-green-900 border-green-200"
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <Layout role="student">
        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
          <p>กำลังโหลดแผนการเรียนและวิชาบังคับ...</p>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout role="student">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          <p className="font-bold mb-1">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <p className="text-sm">โปรดลองรีเฟรชหน้าใหม่อีกครั้ง</p>
        </div>
      </Layout>
    );
  }

  const courses: Course[] = plannerData?.data?.courses || [];
  const maxYear = plannerData?.data?.maxYear || 4;
  const curriculumName = plannerData?.data?.curriculumName || "แผนการเรียน";
  const addableCourses = plannerData?.data?.addableCourses || [];

  // Arrays for years
  const years = Array.from({ length: Math.max(4, maxYear) }, (_, i) => i + 1);

  const handleAddCourse = (courseCode: string, semester: number) => {
    addMutation.mutate({
      courseCode,
      yearLevel: selectedYear,
      semester
    });
  };

  const handleRemoveCourse = (id: string, isRequired: boolean) => {
    if (isRequired) return; // safeguard
    deleteMutation.mutate(id);
  };

  const renderSemesterBox = (semesterNum: number) => {
    const semCourses = courses.filter(c => c.yearLevel === selectedYear && c.semester === semesterNum);
    const totalCredits = semCourses.reduce((sum, c) => sum + c.credits, 0);

    // Search results for autocomplete
    const searchResults = addableCourses
      .filter((ac: any) => 
        ac.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ac.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);

    return (
      <Card className="flex flex-col border border-slate-200 h-full">
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center rounded-t-xl">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            ภาคเรียนที่ {semesterNum}
          </h2>
          <span className="text-sm font-semibold bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-700">
            {totalCredits} หน่วยกิต
          </span>
        </div>

        {/* Course List */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          {semCourses.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-100 rounded-lg">
              ไม่มีวิชาในภาคเรียนนี้
            </div>
          ) : (
            semCourses.map((course) => (
              <div
                key={course.id}
                className={`relative flex items-start justify-between p-3 rounded-lg border transition-colors ${
                  course.status === "completed"
                    ? "bg-green-50 border-green-200 hover:border-green-300"
                    : course.status === "in-progress"
                    ? "bg-blue-50 border-blue-200 hover:border-blue-300"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-bold text-slate-800">
                      {course.code}
                    </code>
                    {course.isRequired && (
                      <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <Lock size={10} /> บังคับ
                      </span>
                    )}
                    {course.status === "completed" && (
                      <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-medium">เรียนแล้ว</span>
                    )}
                    {course.status === "in-progress" && (
                      <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-medium">กำลังเรียน</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700 leading-tight">
                    {course.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {course.credits} หน่วยกิต • {course.type === "elective" ? "เลือกเสรี" : course.type === "general" ? "ศึกษาทั่วไป" : "วิชาแกน/บังคับ"}
                  </p>
                </div>

                {!course.isRequired && (
                  <button
                    onClick={() => handleRemoveCourse(course.id, course.isRequired)}
                    className="absolute top-3 right-3 p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors border border-transparent hover:border-red-100"
                    disabled={deleteMutation.isPending}
                    title="ลบวิชานี้"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))
          )}

          {/* Add Course Section */}
          {addingToSemester === semesterNum ? (
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">เพิ่มวิชาเลือก / หมวดทั่วไป</span>
                <button 
                  onClick={() => { setAddingToSemester(null); setSearchQuery(""); }}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              </div>
              <Input
                placeholder="พิมพ์ชื่อหรือรหัสวิชา..."
                className="bg-white border-slate-300 text-sm mb-2"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                autoFocus
              />
              
              {/* Autocomplete Dropdown */}
              {showDropdown && searchQuery && (
                <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-sm text-center text-slate-500">ไม่พบวิชาที่ค้นหา</div>
                  ) : (
                    searchResults.map((ac: any) => (
                      <div
                        key={ac.code}
                        onClick={() => {
                          setShowDropdown(false);
                          handleAddCourse(ac.code, semesterNum);
                        }}
                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                      >
                        <div className="flex justify-between items-start mb-0.5">
                          <code className="text-xs font-bold text-primary">{ac.code}</code>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{ac.credits} นก.</span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-1">{ac.name}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="mt-2 w-full border-dashed border-2 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all text-sm h-10"
              onClick={() => {
                setAddingToSemester(semesterNum);
                setSearchQuery("");
              }}
            >
              <Plus size={16} className="mr-2" />
              เพิ่มวิชาเลือก
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <Layout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">แผนการเรียน (Course Planner)</h1>
            <p className="text-slate-500 text-sm mt-1">{curriculumName}</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            ดาวน์โหลดแผน
          </Button>
        </div>

        {/* Year Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto scroolbar-hide">
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-6 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
                selectedYear === year 
                  ? "border-primary text-primary" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              ชั้นปีที่ {year}
            </button>
          ))}
        </div>

        {/* Semesters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {renderSemesterBox(1)}
          {renderSemesterBox(2)}
        </div>

        {/* Legend */}
        <div className="flex gap-4 items-center justify-center pt-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5"><Lock size={12} className="text-sky-600"/> วิชาแกน/บังคับ (ลบไม่ได้)</div>
          <div className="w-2 h-2 rounded-full bg-green-400"></div> เรียนผ่านแล้ว
          <div className="w-2 h-2 rounded-full bg-blue-400"></div> กำลังเรียน
          <div className="w-2 h-2 rounded-full bg-slate-300"></div> ยังไม่ได้เรียน(วางแผน)
        </div>
      </div>
    </Layout>
  );
}
