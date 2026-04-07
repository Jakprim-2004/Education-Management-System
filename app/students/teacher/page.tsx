"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, MessageSquare, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  course: string;
  grade: string;
  attendance: number;
  assignment: number;
  exam: number;
}

export default function TeacherStudentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const { data: studentsResponse, isLoading, isError, error } = useQuery({
    queryKey: ['teacherStudents'],
    queryFn: async () => {
      const res = await fetch('/api/students/teacher');
      if (!res.ok) throw new Error('Failed to fetch students data');
      return res.json();
    }
  });

  const students: Student[] = studentsResponse?.data?.students || [];
  const courses: { code: string, name: string }[] = studentsResponse?.data?.courses || [];

  useEffect(() => {
    // Select the first course available by default
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].code);
    }
  }, [courses, selectedCourse]);

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
          <p className="text-red-500 font-medium mb-2">ไม่สามารถโหลดข้อมูลรายชื่อนิสิตได้</p>
          <p className="text-slate-500 text-sm">{error instanceof Error ? error.message : "ระบบขัดข้อง"}</p>
        </div>
      </Layout>
    );
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.studentId.includes(searchTerm.toLowerCase()) ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600";
    if (grade.startsWith("B")) return "text-blue-600";
    if (grade.startsWith("C")) return "text-yellow-600";
    if (grade === "Waiting") return "text-slate-500";
    return "text-red-600";
  };

  return (
    <Layout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">รายชื่อนิสิต</h1>
            <p className="text-slate-600 mt-1">
              ดูและจัดการรายชื่อนิสิตในวิชาของคุณ
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              ส่งออก
            </Button>
          </div>
        </div>

        {/* Course Selection */}
        <Card className="p-4 border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            เลือกวิชา
          </label>
          <div className="flex flex-wrap gap-2">
            {courses.length > 0 ? courses.map((course) => (
              <button
                key={course.code}
                onClick={() => setSelectedCourse(course.code)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCourse === course.code
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {course.code} - {course.name}
              </button>
            )) : <div className="text-sm text-slate-500 py-1">ยังไม่มีวิชา</div>}
          </div>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <Input
            placeholder="ค้นหาด้วยรหัสนิสิต ชื่อ หรืออีเมล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border border-slate-300"
          />
        </div>

        {/* Students Table */}
        <Card className="p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            นิสิต ({filteredStudents.length})
          </h2>

          {filteredStudents.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              ไม่พบข้อมูลนิสิต
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      รหัสนิสิต
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      ชื่อ
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      อีเมล
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      เกรด
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      เข้าเรียน
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      งาน
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      สอบ
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      ดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 font-mono text-primary">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {student.email}
                      </td>
                      <td className={`py-3 px-4 text-center font-bold ${getGradeColor(student.grade)}`}>
                        {student.grade}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {student.attendance}%
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {student.assignment}%
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {student.exam}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                          <MessageSquare size={18} className="text-slate-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border border-slate-200">
            <p className="text-sm text-slate-600">เกรด A</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredStudents.filter((s) => s.grade.startsWith("A")).length}
            </p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <p className="text-sm text-slate-600">เกรด B</p>
            <p className="text-2xl font-bold text-blue-600">
              {filteredStudents.filter((s) => s.grade.startsWith("B")).length}
            </p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <p className="text-sm text-slate-600">เกรด C ขึ้นไป</p>
            <p className="text-2xl font-bold text-slate-900">
              {filteredStudents.length}
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
