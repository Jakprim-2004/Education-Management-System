"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editData, setEditData] = useState<any>({});
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const { data: profileResponse, isLoading, isError } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const res = await fetch("/api/profile/student");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    }
  });

  const profile = profileResponse?.data || {};

  // Sync editData when profile is successfully fetched or editing is toggled
  useEffect(() => {
    if (!isEditing && profile) {
      setEditData(profile);
    }
  }, [profile, isEditing]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await fetch("/api/profile/student", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to edit profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      toast({
        title: "สำเร็จ",
        description: "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว",
        className: "bg-green-50 text-green-900 border-green-200"
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to change password");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "สำเร็จ",
        description: data.message || "เปลี่ยนรหัสผ่านสำเร็จ",
        className: "bg-green-50 text-green-900 border-green-200"
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      firstName: editData.firstName,
      lastName: editData.lastName,
      phone: editData.phone
    });
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน",
        variant: "destructive"
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร",
        variant: "destructive"
      });
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  if (isLoading) {
    return (
      <Layout role="student">
        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
          <p>กำลังโหลดโปรไฟล์...</p>
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

  return (
    <Layout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">โปรไฟล์ของฉัน</h1>
            <p className="text-slate-600 mt-1">จัดการข้อมูลส่วนตัวและการศึกษา</p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit2 size={16} />
              แก้ไข
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <Card className="p-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center text-white text-4xl font-bold uppercase">
              {profile.firstName ? profile.firstName[0] : "ส"}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {profile.firstName} {profile.lastName}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">รหัสนิสิต</p>
                  <p className="font-semibold text-slate-900">
                    {profile.studentId}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">GPA</p>
                  <p className="font-semibold text-slate-900">{profile.gpa}</p>
                </div>
                <div>
                  <p className="text-slate-600">หน่วยกิตที่ได้</p>
                  <p className="font-semibold text-slate-900">
                    {profile.totalCredits}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            ข้อมูลส่วนตัว
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ชื่อ
                </label>
                {isEditing ? (
                  <Input
                    value={editData.firstName}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        firstName: e.target.value,
                      })
                    }
                    className="border border-slate-300"
                  />
                ) : (
                  <p className="text-slate-900">{profile.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  นามสกุล
                </label>
                {isEditing ? (
                  <Input
                    value={editData.lastName}
                    onChange={(e) =>
                      setEditData({ ...editData, lastName: e.target.value })
                    }
                    className="border border-slate-300"
                  />
                ) : (
                  <p className="text-slate-900">{profile.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  อีเมล (แก้ไขไม่ได้)
                </label>
                <div className="flex items-center">
                  <Input
                    type="email"
                    value={profile.email}
                    disabled
                    className="border border-slate-200 bg-slate-50 text-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                {isEditing ? (
                  <Input
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value })
                    }
                    className="border border-slate-300"
                  />
                ) : (
                  <p className="text-slate-900">{profile.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ที่อยู่
              </label>
              {isEditing ? (
                <Input
                  value={editData.address}
                  onChange={(e) =>
                    setEditData({ ...editData, address: e.target.value })
                  }
                  className="border border-slate-300"
                />
              ) : (
                <p className="text-slate-900">{profile.address}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Academic Information */}
        <Card className="p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            ข้อมูลการศึกษา
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                คณะ/สาขา
              </label>
              <p className="text-slate-900">{profile.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                โปรแกรม
              </label>
              <p className="text-slate-900">{profile.program}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ปีที่เข้าศึกษา (รหัส 2 ตัวแรก)
              </label>
              <p className="text-slate-900">{profile.admissionYear}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                อาจารย์ที่ปรึกษา 
              </label>
              <p className="text-slate-900">{profile.academicAdvisor || "-"}</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-3 mt-8">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
              disabled={updateMutation.isPending}
            >
              <X size={16} />
              ยกเลิก
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
              บันทึกการเปลี่ยนแปลง
            </Button>
          </div>
        )}

        {/* Change Password */}
        <Card className="p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            เปลี่ยนรหัสผ่าน
          </h3>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                รหัสผ่านเดิม
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                รหัสผ่านใหม่
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ยืนยันรหัสผ่าน
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="border border-slate-300"
              />
            </div>
            <Button 
                type="submit" 
                disabled={passwordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="flex items-center gap-2"
            >
              {passwordMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : null}
              อัปเดตรหัสผ่าน
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
