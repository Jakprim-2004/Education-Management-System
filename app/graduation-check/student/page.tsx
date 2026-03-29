"use client";
export const dynamic = "force-dynamic";

import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock, BookOpen, Download } from "lucide-react";

interface CurriculumRequirement {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: "วิชาบังคับ" | "วิชาเลือก" | "วิชาศึกษาทั่วไป" | "วิชาเสรี";
  status: "ผ่าน" | "กำลังเรียน" | "ยังไม่ลงทะเบียน";
  grade?: string;
  year: number;
  semester: number;
}

export default function StudentGraduationCheck() {
  const requirements: CurriculumRequirement[] = [
    // ปี 1
    { id: "1", code: "01418101", name: "การเขียนโปรแกรมคอมพิวเตอร์", credits: 3, type: "วิชาบังคับ", status: "ผ่าน", grade: "A", year: 1, semester: 1 },
    { id: "2", code: "01418102", name: "คณิตศาสตร์ดิสครีต", credits: 3, type: "วิชาบังคับ", status: "ผ่าน", grade: "B+", year: 1, semester: 1 },
    { id: "3", code: "01175111", name: "ภาษาอังกฤษเบื้องต้น", credits: 3, type: "วิชาศึกษาทั่วไป", status: "ผ่าน", grade: "A-", year: 1, semester: 1 },
    { id: "4", code: "01355101", name: "ภาษาไทยเพื่อการสื่อสาร", credits: 3, type: "วิชาศึกษาทั่วไป", status: "ผ่าน", grade: "B+", year: 1, semester: 1 },
    { id: "5", code: "01418103", name: "แคลคูลัส 1", credits: 3, type: "วิชาบังคับ", status: "ผ่าน", grade: "B", year: 1, semester: 1 },
    { id: "6", code: "01420101", name: "ฟิสิกส์ทั่วไป", credits: 3, type: "วิชาบังคับ", status: "ผ่าน", grade: "B+", year: 1, semester: 1 },
    { id: "7", code: "01418111", name: "การเขียนโปรแกรมเชิงวัตถุ", credits: 3, type: "วิชาบังคับ", status: "ผ่าน", grade: "A", year: 1, semester: 2 },
    { id: "8", code: "01418112", name: "แคลคูลัส 2", credits: 3, type: "วิชาบังคับ", status: "ผ่าน", grade: "B+", year: 1, semester: 2 },
    { id: "9", code: "01175112", name: "ภาษาอังกฤษระดับกลาง", credits: 3, type: "วิชาศึกษาทั่วไป", status: "ผ่าน", grade: "A-", year: 1, semester: 2 },
    { id: "10", code: "01418113", name: "สถิติเบื้องต้น", credits: 3, type: "วิชาบังคับ", status: "ผ่าน", grade: "A", year: 1, semester: 2 },
    // ปี 2
    { id: "11", code: "01418221", name: "โครงสร้างข้อมูล", credits: 3, type: "วิชาบังคับ", status: "กำลังเรียน", year: 2, semester: 1 },
    { id: "12", code: "01418222", name: "อัลกอริทึม", credits: 3, type: "วิชาบังคับ", status: "กำลังเรียน", year: 2, semester: 1 },
    { id: "13", code: "01418223", name: "ระบบฐานข้อมูล", credits: 3, type: "วิชาบังคับ", status: "กำลังเรียน", year: 2, semester: 1 },
    { id: "14", code: "01418224", name: "สถาปัตยกรรมคอมพิวเตอร์", credits: 3, type: "วิชาบังคับ", status: "ยังไม่ลงทะเบียน", year: 2, semester: 1 },
    { id: "15", code: "01418231", name: "ระบบปฏิบัติการ", credits: 3, type: "วิชาบังคับ", status: "ยังไม่ลงทะเบียน", year: 2, semester: 2 },
    { id: "16", code: "01418232", name: "เว็บแอปพลิเคชัน", credits: 3, type: "วิชาบังคับ", status: "ยังไม่ลงทะเบียน", year: 2, semester: 2 },
    { id: "17", code: "01418233", name: "เครือข่ายคอมพิวเตอร์", credits: 3, type: "วิชาบังคับ", status: "ยังไม่ลงทะเบียน", year: 2, semester: 2 },
    { id: "18", code: "01418234", name: "วิศวกรรมซอฟต์แวร์", credits: 3, type: "วิชาบังคับ", status: "ยังไม่ลงทะเบียน", year: 2, semester: 2 },
    // ปี 3
    { id: "19", code: "01418321", name: "ปัญญาประดิษฐ์", credits: 3, type: "วิชาบังคับ", status: "ยังไม่ลงทะเบียน", year: 3, semester: 1 },
    { id: "20", code: "01418322", name: "ความมั่นคงทางไซเบอร์", credits: 3, type: "วิชาเลือก", status: "ยังไม่ลงทะเบียน", year: 3, semester: 1 },
    { id: "21", code: "01418323", name: "การวิเคราะห์ข้อมูล", credits: 3, type: "วิชาเลือก", status: "ยังไม่ลงทะเบียน", year: 3, semester: 1 },
    { id: "22", code: "01418331", name: "สัมมนา", credits: 1, type: "วิชาบังคับ", status: "ยังไม่ลงทะเบียน", year: 3, semester: 2 },
    { id: "23", code: "01418332", name: "คอมพิวเตอร์กราฟิกส์", credits: 3, type: "วิชาเลือก", status: "ยังไม่ลงทะเบียน", year: 3, semester: 2 },
    // ปี 4
    { id: "24", code: "01418421", name: "โครงงานวิศวกรรม 1", credits: 3, type: "วิชาบังคับ", status: "ยังไม่ลงทะเบียน", year: 4, semester: 1 },
    { id: "25", code: "01418422", name: "การฝึกงาน", credits: 3, type: "วิชาบังคับ", status: "ยังไม่ลงทะเบียน", year: 4, semester: 1 },
    { id: "26", code: "01418431", name: "โครงงานวิศวกรรม 2", credits: 3, type: "วิชาบังคับ", status: "ยังไม่ลงทะเบียน", year: 4, semester: 2 },
    { id: "27", code: "01999034", name: "วิชาเลือกเสรี 1", credits: 3, type: "วิชาเสรี", status: "ยังไม่ลงทะเบียน", year: 2, semester: 1 },
    { id: "28", code: "01999035", name: "วิชาเลือกเสรี 2", credits: 3, type: "วิชาเสรี", status: "ยังไม่ลงทะเบียน", year: 4, semester: 2 },
  ];

  const passed = requirements.filter((r) => r.status === "ผ่าน");
  const inProgress = requirements.filter((r) => r.status === "กำลังเรียน");
  const remaining = requirements.filter((r) => r.status === "ยังไม่ลงทะเบียน");
  const totalRequired = requirements.reduce((s, r) => s + r.credits, 0);
  const totalPassed = passed.reduce((s, r) => s + r.credits, 0);
  const totalInProgress = inProgress.reduce((s, r) => s + r.credits, 0);
  const progressPercent = Math.round((totalPassed / totalRequired) * 100);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "ผ่าน": return { icon: CheckCircle, color: "bg-green-100 text-green-700", iconColor: "text-green-600" };
      case "กำลังเรียน": return { icon: Clock, color: "bg-blue-100 text-blue-700", iconColor: "text-blue-600" };
      case "ยังไม่ลงทะเบียน": return { icon: AlertCircle, color: "bg-red-100 text-red-700", iconColor: "text-red-500" };
      default: return { icon: AlertCircle, color: "bg-slate-100 text-slate-700", iconColor: "text-slate-500" };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "วิชาบังคับ": return "bg-blue-100 text-blue-700";
      case "วิชาเลือก": return "bg-purple-100 text-purple-700";
      case "วิชาศึกษาทั่วไป": return "bg-green-100 text-green-700";
      case "วิชาเสรี": return "bg-orange-100 text-orange-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const years = [1, 2, 3, 4];

  return (
    <Layout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">ตรวจสอบจบ</h1>
            <p className="text-slate-600 mt-1">
              ตรวจสอบรายวิชาที่ยังติดค้างหรือขาดเรียน เพื่อวางแผนให้จบหลักสูตร
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            ดาวน์โหลดรายงาน
          </Button>
        </div>

        {/* Overall Progress */}
        <Card className="p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">ความก้าวหน้าในหลักสูตร</h2>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-600">
                หน่วยกิตที่ผ่าน: <span className="font-bold text-slate-900">{totalPassed}</span> / {totalRequired}
              </span>
              <span className="text-sm font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all relative"
                style={{ width: `${progressPercent}%` }}
              >
                {totalInProgress > 0 && (
                  <div
                    className="absolute right-0 top-0 h-4 bg-blue-300 rounded-r-full"
                    style={{ width: `${(totalInProgress / totalRequired) * 100 / (progressPercent / 100)}%`, maxWidth: '100%' }}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary" /> ผ่านแล้ว ({totalPassed} หน่วยกิต)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-300" /> กำลังเรียน ({totalInProgress} หน่วยกิต)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-200" /> ยังไม่ลง ({totalRequired - totalPassed - totalInProgress} หน่วยกิต)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="mx-auto mb-1 text-green-600" size={24} />
              <p className="text-2xl font-bold text-green-700">{passed.length}</p>
              <p className="text-xs text-green-600">วิชาที่ผ่าน</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <Clock className="mx-auto mb-1 text-blue-600" size={24} />
              <p className="text-2xl font-bold text-blue-700">{inProgress.length}</p>
              <p className="text-xs text-blue-600">กำลังเรียน</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <AlertCircle className="mx-auto mb-1 text-red-500" size={24} />
              <p className="text-2xl font-bold text-red-600">{remaining.length}</p>
              <p className="text-xs text-red-500">ยังไม่ลงทะเบียน</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <BookOpen className="mx-auto mb-1 text-purple-600" size={24} />
              <p className="text-2xl font-bold text-purple-700">{totalRequired}</p>
              <p className="text-xs text-purple-600">หน่วยกิตรวม</p>
            </div>
          </div>
        </Card>

        {/* Remaining Highlight */}
        {remaining.length > 0 && (
          <Card className="p-6 border border-red-200 bg-red-50">
            <h2 className="text-lg font-bold text-red-800 mb-2">
              ⚠️ วิชาที่ยังขาด ({remaining.length} วิชา)
            </h2>
            <p className="text-sm text-red-700 mb-4">
              รายวิชาที่ยังไม่ได้ลงทะเบียนและจำเป็นต้องเรียนเพื่อจบหลักสูตร
            </p>
            <div className="space-y-2">
              {remaining.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <code className="text-sm font-mono font-bold text-primary">{r.code}</code>
                    <span className="text-sm text-slate-900">{r.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getTypeColor(r.type)}`}>{r.type}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{r.credits} หน่วยกิต</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Year by Year Breakdown */}
        {years.map((year) => {
          const yearCourses = requirements.filter((r) => r.year === year);
          if (yearCourses.length === 0) return null;
          return (
            <Card key={year} className="p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                ปีที่ {year}
                <span className="text-sm text-slate-500 ml-2 font-normal">
                  ({yearCourses.filter((r) => r.status === "ผ่าน").length}/{yearCourses.length} วิชาผ่าน)
                </span>
              </h2>
              <div className="space-y-2">
                {yearCourses.map((course) => {
                  const statusInfo = getStatusInfo(course.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div
                      key={course.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        course.status === "ผ่าน"
                          ? "bg-green-50 border-green-200"
                          : course.status === "กำลังเรียน"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon size={18} className={statusInfo.iconColor} />
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono font-bold text-primary">{course.code}</code>
                            <span className="text-sm font-medium text-slate-900">{course.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${getTypeColor(course.type)}`}>
                              {course.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            ภาคเรียนที่ {course.semester} • {course.credits} หน่วยกิต
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${statusInfo.color}`}>
                          {course.status}
                        </span>
                        {course.grade && (
                          <p className="text-sm font-bold text-green-600 mt-1">{course.grade}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </Layout>
  );
}
