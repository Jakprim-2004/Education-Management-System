"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      toast({
        title: "✅ เข้าสู่ระบบสำเร็จ!",
        description: `ยินดีต้อนรับกลับเข้าสู่ระบบ, ${data.user.email}`,
      });
      router.push(`/dashboard/${data.user.role}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-slate-100">
      <Card className="w-full max-w-md p-8 shadow-lg border border-slate-200">
        <div className="mb-8">
          <div className="flex flex-col items-center justify-center gap-2 mb-2">
            <Image src="/KU_Logo_PNG.png" alt="Kasetsart University" width={80} height={80} priority style={{ width: "auto", height: "auto" }} className="object-contain" />
            <h1 className="text-2xl font-bold text-slate-900">ยินดีต้อนรับ</h1>
          </div>
          <p className="text-center text-sm text-slate-600 mt-2">
            ระบบแจ้งรายการเงื่อนไขรายวิชา — มก. วิทยาเขตกำแพงแสน
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              ⚠️ {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              อีเมล / รหัสนิสิต
            </label>
            <Input
              id="email"
              type="text"
              placeholder="เช่น student@ku.ac.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              รหัสผ่าน
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                จำข้อมูลของฉัน
              </label>
            </div>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              ลืมรหัสผ่าน?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>

          <p className="text-sm text-center text-slate-600">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center mb-3">บัญชีทดลอง:</p>
          <div className="space-y-2 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => {
                setEmail("student@ku.ac.th");
                setPassword("password");
              }}
              className="block w-full text-left hover:text-primary"
            >
              👤 นิสิต: student@ku.ac.th
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("teacher@ku.ac.th");
                setPassword("password");
              }}
              className="block w-full text-left hover:text-primary"
            >
              👨‍🏫 อาจารย์: teacher@ku.ac.th
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@ku.ac.th");
                setPassword("password");
              }}
              className="block w-full text-left hover:text-primary"
            >
              👨‍💼 ผู้ดูแลระบบ: admin@ku.ac.th
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
