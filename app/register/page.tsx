"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่");
      return;
    }
    if (form.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-slate-100 py-8">
      <Card className="w-full max-w-lg p-8 shadow-lg border border-slate-200">
        <div className="mb-6">
          <div className="flex flex-col items-center justify-center gap-2 mb-2">
            <Image src="/KU_Logo_PNG.png" alt="Kasetsart University" width={64} height={64} className="object-contain" />
            <h1 className="text-2xl font-bold text-slate-900">สมัครสมาชิก</h1>
          </div>
          <p className="text-center text-sm text-slate-600 mt-1">
            ระบบแจ้งรายการเงื่อนไขรายวิชา — มก. วิทยาเขตกำแพงแสน
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทผู้ใช้</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="student">นิสิต</option>
              <option value="teacher">อาจารย์</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {form.role === "student" ? "รหัสนิสิต" : "รหัสอาจารย์"}
            </label>
            <Input
              name="studentId"
              placeholder={form.role === "student" ? "เช่น 6310000001" : "เช่น T001"}
              value={form.studentId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ</label>
              <Input name="firstName" placeholder="ชื่อจริง" value={form.firstName} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล</label>
              <Input name="lastName" placeholder="นามสกุล" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
            <Input name="email" type="email" placeholder="เช่น student@ku.ac.th" value={form.email} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทร</label>
            <Input name="phone" type="tel" placeholder="เช่น 081-234-5678" value={form.phone} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
              <Input name="password" type="password" placeholder="อย่างน้อย 6 ตัว" value={form.password} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่าน</label>
              <Input name="confirmPassword" type="password" placeholder="กรอกอีกครั้ง" value={form.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <Button type="submit" className="w-full">
            สมัครสมาชิก
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/" className="text-primary font-medium hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
