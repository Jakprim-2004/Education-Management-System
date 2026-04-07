"use client";
export const dynamic = "force-dynamic";

import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface RegistrationItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  status: "approved" | "pending" | "rejected";
  registrationDate: string;
  reason?: string;
}

export default function StudentRegistration() {
  const { data: regData, isLoading, isError } = useQuery({
    queryKey: ['studentRegistration'],
    queryFn: async () => {
      const res = await fetch("/api/registration/student");
      if (!res.ok) throw new Error("Failed to fetch registration data");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <Layout role="student">
        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
          <p>กำลังโหลดข้อมูลการลงทะเบียน...</p>
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

  const registrations: RegistrationItem[] = regData?.data?.registrations || [];
  const stats = regData?.data?.stats || { approved: 0, pending: 0, rejected: 0, totalApprovedCredits: 0 };

  const approved = registrations.filter((r) => r.status === "approved");
  const pending = registrations.filter((r) => r.status === "pending");

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          label: "อนุมัติแล้ว",
          color: "bg-green-100 text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "pending":
        return {
          icon: Clock,
          label: "อยู่ระหว่างการตรวจสอบ",
          color: "bg-yellow-100 text-yellow-700",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "rejected":
        return {
          icon: AlertCircle,
          label: "ไม่อนุมัติ",
          color: "bg-red-100 text-red-700",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: AlertCircle,
          label: "ไม่ทราบ",
          color: "bg-gray-100 text-gray-700",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  return (
    <Layout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            ตรวจสอบการลงทะเบียน
          </h1>
          <p className="text-slate-600 mt-1">
            ตรวจสอบสถานะการลงทะเบียนวิชา และรายละเอียดการอนุมัติ
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={32} />
              <div>
                <p className="text-xs text-slate-600">อนุมัติแล้ว</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.approved} วิชา
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-600" size={32} />
              <div>
                <p className="text-xs text-slate-600">อยู่ระหว่างตรวจสอบ</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.pending} วิชา
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <span className="text-2xl font-bold text-blue-600">
                  {stats.totalApprovedCredits}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-600">รวมหน่วยกิตที่อนุมัติ</p>
                <p className="text-sm text-slate-500">สูงสุด 20 หน่วยกิต</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Approved Registrations */}
        <Card className="p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            วิชาที่อนุมัติแล้ว ({approved.length})
          </h2>
          <div className="space-y-3">
            {approved.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                ไม่มีวิชาที่อนุมัติ
              </p>
            ) : (
              approved.map((reg) => {
                const statusInfo = getStatusInfo(reg.status);
                return (
                  <div
                    key={reg.id}
                    className={`p-4 rounded-lg border-2 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono font-bold text-primary">
                            {reg.code}
                          </code>
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="font-medium text-slate-900">
                          {reg.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {reg.credits} หน่วยกิต
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {reg.registrationDate}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Pending Registrations */}
        {pending.length > 0 && (
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              อยู่ระหว่างการตรวจสอบ ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((reg) => {
                const statusInfo = getStatusInfo(reg.status);
                return (
                  <div
                    key={reg.id}
                    className={`p-4 rounded-lg border-2 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono font-bold text-primary">
                            {reg.code}
                          </code>
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="font-medium text-slate-900">
                          {reg.name}
                        </h3>
                        {reg.reason && (
                          <p className="text-sm text-slate-700 mt-1">
                            หมายเหตุ: {reg.reason}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {reg.credits} หน่วยกิต
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {reg.registrationDate}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
              }
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button>ดาวน์โหลดใบยืนยันการลงทะเบียน</Button>
          <Button variant="outline">พิมพ์ใบยืนยัน</Button>
        </div>
      </div>
    </Layout>
  );
}
