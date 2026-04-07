"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X } from "lucide-react";

export default function TeacherProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    teacherId: "T001",
    firstName: "สมศักดิ์",
    lastName: "ใจดี",
    email: "teacher@ku.ac.th",
    phone: "089-123-4567",
    department: "วิศวกรรมศาสตร์",
    position: "ผู้ช่วยศาสตราจารย์",
    degree: "ปร.ด. (วิศวกรรมซอฟต์แวร์)",
    office: "อาคาร 5 ห้อง 501",
    officePhone: "02-218-2000 ต่อ 5501",
    address: "123 ถ.พระราม 4 แขวงตุลาคม เขตปทุมวัน กรุงเทพฯ 10330",
    joinYear: "2558",
  });

  const [editData, setEditData] = useState(profile);

  const handleSave = () => {
    setProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  return (
    <Layout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">โปรไฟล์ของฉัน</h1>
            <p className="text-slate-600 mt-1">จัดการข้อมูลส่วนตัวและการสอน</p>
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
            <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center text-white text-4xl font-bold">
              ส
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {profile.firstName} {profile.lastName}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">รหัสอาจารย์</p>
                  <p className="font-semibold text-slate-900">
                    {profile.teacherId}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">ตำแหน่ง</p>
                  <p className="font-semibold text-slate-900">
                    {profile.position}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">คณะ</p>
                  <p className="font-semibold text-slate-900">
                    {profile.department}
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
                  อีเมล
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    className="border border-slate-300"
                  />
                ) : (
                  <p className="text-slate-900">{profile.email}</p>
                )}
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

        {/* Professional Information */}
        <Card className="p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            ข้อมูลวิชาชีพ
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ตำแหน่ง
                </label>
                <p className="text-slate-900">{profile.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  คณะ/สาขา
                </label>
                <p className="text-slate-900">{profile.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  วุฒิการศึกษาสูงสุด
                </label>
                <p className="text-slate-900">{profile.degree}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ปีที่เข้างาน
                </label>
                <p className="text-slate-900">{profile.joinYear}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  สำนักงาน
                </label>
                <p className="text-slate-900">{profile.office}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  เบอร์สำนักงาน
                </label>
                <p className="text-slate-900">{profile.officePhone}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-2">
            <Button onClick={handleSave} className=" flex items-center gap-2">
              <Save size={16} />
              บันทึก
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X size={16} />
              ยกเลิก
            </Button>
          </div>
        )}

        {/* Change Password */}
        <Card className="p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            เปลี่ยนรหัสผ่าน
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                รหัสผ่านเดิม
              </label>
              <Input
                type="password"
                placeholder="••••••••"
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
                className="border border-slate-300"
              />
            </div>
            <Button>อัปเดตรหัสผ่าน</Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
