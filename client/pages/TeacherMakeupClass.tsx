import { useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Calendar, Clock, CheckCircle, Send, BookOpen } from "lucide-react";

interface StudentCourse {
  code: string;
  name: string;
  day: string;
  time: string;
}

interface StudentInfo {
  id: string;
  studentId: string;
  name: string;
  courses: StudentCourse[];
}

interface MakeupRequest {
  id: string;
  courseCode: string;
  courseName: string;
  reason: string;
  originalDate: string;
  status: "กำลังเลือกวัน" | "ส่งนัดแล้ว";
  selectedDate?: string;
  selectedTime?: string;
  studentsTotal: number;
}

export default function TeacherMakeupClass() {
  const [selectedRequest, setSelectedRequest] = useState<string>("1");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [makeupDate, setMakeupDate] = useState("");
  const [makeupTime, setMakeupTime] = useState("");

  const [requests, setRequests] = useState<MakeupRequest[]>([
    {
      id: "1",
      courseCode: "01418221",
      courseName: "โครงสร้างข้อมูล",
      reason: "วันหยุดราชการ (วันมาฆบูชา)",
      originalDate: "26 ก.พ. 2567 (จ 14:00-16:50)",
      status: "กำลังเลือกวัน",
      studentsTotal: 5,
    },
    {
      id: "2",
      courseCode: "01418222",
      courseName: "อัลกอริทึม",
      reason: "อาจารย์ไปราชการ",
      originalDate: "12 มี.ค. 2567 (พ 13:00-15:50)",
      status: "ส่งนัดแล้ว",
      selectedDate: "16 มี.ค. 2567",
      selectedTime: "ศุกร์ 15:00 - 17:50",
      studentsTotal: 5,
    },
  ]);

  // ตารางเรียนของนิสิตทุกคน (ดึงจากระบบลงทะเบียนโดยตรง)
  const students: StudentInfo[] = [
    {
      id: "1", studentId: "6310000001", name: "สมชาย ใจดี",
      courses: [
        { code: "01418221", name: "โครงสร้างข้อมูล", day: "จันทร์", time: "14:00 - 16:50" },
        { code: "01175112", name: "ภาษาอังกฤษ", day: "อังคาร", time: "10:00 - 12:50" },
        { code: "01418222", name: "อัลกอริทึม", day: "พุธ", time: "13:00 - 15:50" },
        { code: "01418224", name: "เว็บแอปพลิเคชัน", day: "พฤหัสบดี", time: "14:00 - 16:50" },
        { code: "01418223", name: "ระบบฐานข้อมูล", day: "ศุกร์", time: "10:00 - 12:50" },
      ],
    },
    {
      id: "2", studentId: "6310000002", name: "ธนาภร บัวสวาง",
      courses: [
        { code: "01418221", name: "โครงสร้างข้อมูล", day: "จันทร์", time: "14:00 - 16:50" },
        { code: "01418113", name: "สถิติเบื้องต้น", day: "อังคาร", time: "13:00 - 15:50" },
        { code: "01418222", name: "อัลกอริทึม", day: "พุธ", time: "13:00 - 15:50" },
        { code: "01418223", name: "ระบบฐานข้อมูล", day: "ศุกร์", time: "10:00 - 12:50" },
      ],
    },
    {
      id: "3", studentId: "6310000003", name: "นาจารี อ่อนสม",
      courses: [
        { code: "01418221", name: "โครงสร้างข้อมูล", day: "จันทร์", time: "14:00 - 16:50" },
        { code: "01420101", name: "ฟิสิกส์ทั่วไป", day: "อังคาร", time: "08:00 - 10:50" },
        { code: "01418222", name: "อัลกอริทึม", day: "พุธ", time: "13:00 - 15:50" },
        { code: "01418224", name: "เว็บแอปพลิเคชัน", day: "พฤหัสบดี", time: "14:00 - 16:50" },
      ],
    },
    {
      id: "4", studentId: "6310000004", name: "กิตติวัฒน์ เพ็งกิจ",
      courses: [
        { code: "01418221", name: "โครงสร้างข้อมูล", day: "จันทร์", time: "14:00 - 16:50" },
        { code: "01175112", name: "ภาษาอังกฤษ", day: "อังคาร", time: "10:00 - 12:50" },
        { code: "01418222", name: "อัลกอริทึม", day: "พุธ", time: "13:00 - 15:50" },
        { code: "01418223", name: "ระบบฐานข้อมูล", day: "ศุกร์", time: "10:00 - 12:50" },
        { code: "01418232", name: "ระบบปฏิบัติการ", day: "ศุกร์", time: "14:00 - 16:50" },
      ],
    },
    {
      id: "5", studentId: "6310000005", name: "วาสนา สุขสมบูรณ์",
      courses: [
        { code: "01418221", name: "โครงสร้างข้อมูล", day: "จันทร์", time: "14:00 - 16:50" },
        { code: "01418222", name: "อัลกอริทึม", day: "พุธ", time: "13:00 - 15:50" },
        { code: "01355101", name: "ภาษาไทย", day: "พฤหัสบดี", time: "10:00 - 12:50" },
      ],
    },
  ];

  const currentRequest = requests.find((r) => r.id === selectedRequest);
  const viewingStudent = selectedStudent ? students.find((s) => s.id === selectedStudent) : null;

  const handleSendMakeup = () => {
    if (!makeupDate || !makeupTime || !currentRequest) return;
    setRequests(requests.map((r) =>
      r.id === currentRequest.id
        ? { ...r, status: "ส่งนัดแล้ว" as const, selectedDate: makeupDate, selectedTime: makeupTime }
        : r
    ));
    setMakeupDate("");
    setMakeupTime("");
  };

  return (
    <Layout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">นัดสอนชดเชย</h1>
          <p className="text-slate-600 mt-1">
            ดูตารางเรียนของนิสิตจากระบบลงทะเบียน แล้วเลือกวันนัดสอนชดเชยส่งให้นิสิต
          </p>
        </div>

        {/* Makeup Requests */}
        <Card className="p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">รายการสอนชดเชย</h2>
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRequest === req.id
                    ? "border-primary bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-bold text-primary">{req.courseCode}</code>
                      <span className="font-bold text-slate-900">{req.courseName}</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        req.status === "ส่งนัดแล้ว"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">เหตุผล: {req.reason}</p>
                    <p className="text-xs text-slate-500 mt-1">วันเดิม: {req.originalDate}</p>
                    {req.selectedDate && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        📅 นัดชดเชย: {req.selectedDate} ({req.selectedTime})
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Users size={16} className="text-slate-500" />
                      <span className="font-bold text-slate-700">{req.studentsTotal}</span>
                    </div>
                    <p className="text-xs text-slate-500">นิสิต</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {currentRequest && (
          <>
            {/* Student List with Schedules */}
            <Card className="p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                ตารางเรียนของนิสิต — {currentRequest.courseName}
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                ดึงจากระบบลงทะเบียนโดยตรง • คลิกที่ชื่อนิสิตเพื่อดูตารางเรียนทั้งหมด
              </p>

              <div className="space-y-2">
                {students.map((student) => (
                  <div key={student.id}>
                    <div
                      onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedStudent === student.id
                          ? "border-primary bg-green-50"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{student.studentId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{student.courses.length} วิชา</span>
                        <BookOpen size={16} className="text-slate-400" />
                      </div>
                    </div>

                    {/* expanded schedule */}
                    {selectedStudent === student.id && (
                      <div className="ml-11 mt-2 mb-3 space-y-1">
                        {student.courses.map((course, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-lg text-sm"
                          >
                            <span className="min-w-[70px] font-bold text-primary text-xs">{course.day}</span>
                            <span className="text-xs text-slate-500 min-w-[100px]">{course.time}</span>
                            <code className="text-xs font-mono text-slate-700">{course.code}</code>
                            <span className="text-xs text-slate-900">{course.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Send Makeup Date */}
            {currentRequest.status === "กำลังเลือกวัน" && (
              <Card className="p-6 border border-primary bg-green-50">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  📅 กำหนดวันนัดสอนชดเชย — {currentRequest.courseName}
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  เลือกวันกับเวลาแล้วระบบจะส่งแจ้งเตือนให้นิสิตทุกคนในวิชานี้
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">วันที่นัด</label>
                    <Input
                      type="date"
                      value={makeupDate}
                      onChange={(e) => setMakeupDate(e.target.value)}
                      className="border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ช่วงเวลา</label>
                    <select
                      value={makeupTime}
                      onChange={(e) => setMakeupTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">เลือกเวลา...</option>
                      <option value="จันทร์ 08:00 - 10:50">จันทร์ 08:00 - 10:50</option>
                      <option value="จันทร์ 17:00 - 19:50">จันทร์ 17:00 - 19:50</option>
                      <option value="อังคาร 08:00 - 10:50">อังคาร 08:00 - 10:50</option>
                      <option value="อังคาร 17:00 - 19:50">อังคาร 17:00 - 19:50</option>
                      <option value="พุธ 08:00 - 10:50">พุธ 08:00 - 10:50</option>
                      <option value="พุธ 17:00 - 19:50">พุธ 17:00 - 19:50</option>
                      <option value="พฤหัสบดี 08:00 - 10:50">พฤหัสบดี 08:00 - 10:50</option>
                      <option value="พฤหัสบดี 17:00 - 19:50">พฤหัสบดี 17:00 - 19:50</option>
                      <option value="ศุกร์ 08:00 - 10:50">ศุกร์ 08:00 - 10:50</option>
                      <option value="ศุกร์ 15:00 - 17:50">ศุกร์ 15:00 - 17:50</option>
                      <option value="เสาร์ 09:00 - 11:50">เสาร์ 09:00 - 11:50</option>
                      <option value="เสาร์ 13:00 - 15:50">เสาร์ 13:00 - 15:50</option>
                      <option value="อาทิตย์ 09:00 - 11:50">อาทิตย์ 09:00 - 11:50</option>
                    </select>
                  </div>
                </div>
                <Button
                  onClick={handleSendMakeup}
                  disabled={!makeupDate || !makeupTime}
                  className="flex items-center gap-2"
                >
                  <Send size={16} />
                  ส่งนัดให้นิสิตทั้ง {currentRequest.studentsTotal} คน
                </Button>
              </Card>
            )}

            {/* Already Sent */}
            {currentRequest.status === "ส่งนัดแล้ว" && (
              <Card className="p-6 border border-green-300 bg-green-50">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={24} className="text-green-600" />
                  <h2 className="text-lg font-bold text-green-800">ส่งนัดสอนชดเชยแล้ว</h2>
                </div>
                <p className="text-sm text-green-700">
                  วิชา {currentRequest.courseName} — นัดชดเชยวันที่ {currentRequest.selectedDate} ({currentRequest.selectedTime})
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ส่งแจ้งนิสิตแล้ว {currentRequest.studentsTotal} คน
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
