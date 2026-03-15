import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Placeholder() {
  const { role } = useParams<{ role: string }>();
  const validRole = role && ["student", "teacher", "admin"].includes(role) 
    ? (role as "student" | "teacher" | "admin") 
    : "student";

  return (
    <Layout role={validRole}>
      <Card className="p-12 border border-slate-200 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="text-slate-400" size={48} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">หน้าอยู่ระหว่างการพัฒนา</h1>
        <p className="text-slate-600 mb-6">
          หน้านี้อยู่ระหว่างการพัฒนา กรุณากลับมาตรวจสอบอีกครั้งหรือใช้เมนูการนำทางเพื่อสำรวจส่วนอื่น ๆ
        </p>
        <p className="text-sm text-slate-500">
          หากคุณต้องการเพิ่มฟีเจอร์ไปยังหน้านี้ โปรดพิมพ์คำขอเพิ่มเติมในการแชทเพื่อดูรายละเอียดการดำเนินการ
        </p>
      </Card>
    </Layout>
  );
}
