import { useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit2, Trash2, Download } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "student" | "teacher" | "admin";
  status: "active" | "inactive";
  joinDate: string;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ทั้งหมด");

  const users: User[] = [
    {
      id: "1",
      username: "student001",
      email: "student@ku.ac.th",
      fullName: "สมชาย ใจดี",
      role: "student",
      status: "active",
      joinDate: "2567-01-15",
    },
    {
      id: "2",
      username: "teacher001",
      email: "teacher@ku.ac.th",
      fullName: "สมศักดิ์ ใจดี",
      role: "teacher",
      status: "active",
      joinDate: "2558-08-20",
    },
    {
      id: "3",
      username: "admin001",
      email: "admin@ku.ac.th",
      fullName: "อำนวย ศิริวรรณ",
      role: "admin",
      status: "active",
      joinDate: "2555-05-10",
    },
    {
      id: "4",
      username: "student002",
      email: "student2@ku.ac.th",
      fullName: "ธนาภร บัวสวาง",
      role: "student",
      status: "active",
      joinDate: "2567-01-15",
    },
    {
      id: "5",
      username: "teacher002",
      email: "teacher2@ku.ac.th",
      fullName: "ประณีต วรรณศิลป์",
      role: "teacher",
      status: "inactive",
      joinDate: "2560-06-15",
    },
    {
      id: "6",
      username: "student003",
      email: "student3@ku.ac.th",
      fullName: "นาจารี อ่อนสม",
      role: "student",
      status: "active",
      joinDate: "2567-01-15",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "ทั้งหมด" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "student":
        return "นิสิต";
      case "teacher":
        return "อาจารย์";
      case "admin":
        return "ผู้ดูแล";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-700";
      case "teacher":
        return "bg-green-100 text-green-700";
      case "admin":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">จัดการผู้ใช้</h1>
            <p className="text-slate-600 mt-1">ดูและจัดการบัญชีผู้ใช้ทั้งหมด</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            เพิ่มผู้ใช้
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border border-slate-200">
            <p className="text-sm text-slate-600">ผู้ใช้ทั้งหมด</p>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <p className="text-sm text-slate-600">นิสิต</p>
            <p className="text-2xl font-bold text-blue-600">
              {users.filter((u) => u.role === "student").length}
            </p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <p className="text-sm text-slate-600">อาจารย์</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.role === "teacher").length}
            </p>
          </Card>
          <Card className="p-4 border border-slate-200">
            <p className="text-sm text-slate-600">ใช้งาน</p>
            <p className="text-2xl font-bold text-slate-900">
              {users.filter((u) => u.status === "active").length}
            </p>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <Input
              placeholder="ค้นหาด้วยชื่อผู้ใช้ อีเมล หรือชื่อ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border border-slate-300"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["ทั้งหมด", "student", "teacher", "admin"].map((role) => (
              <button
                key={role}
                onClick={() =>
                  setSelectedRole(
                    role === "student"
                      ? "student"
                      : role === "teacher"
                      ? "teacher"
                      : role === "admin"
                      ? "admin"
                      : "ทั้งหมด"
                  )
                }
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRole === role
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {role === "student"
                  ? "นิสิต"
                  : role === "teacher"
                  ? "อาจารย์"
                  : role === "admin"
                  ? "ผู้ดูแล"
                  : "ทั้งหมด"}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <Card className="p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              ผู้ใช้ ({filteredUsers.length})
            </h2>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download size={16} />
              ส่งออก
            </Button>
          </div>

          {filteredUsers.length === 0 ? (
            <p className="text-slate-500 text-center py-8">ไม่พบข้อมูล</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      ชื่อผู้ใช้
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      ชื่อเต็ม
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      อีเมล
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      บทบาท
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      สถานะ
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      วันเข้างาน
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      ดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {user.username}
                      </td>
                      <td className="py-3 px-4">{user.fullName}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {user.email}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status === "active" ? "ใช้งาน" : "ปิด"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {user.joinDate}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                            <Edit2 size={16} className="text-slate-600" />
                          </button>
                          <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
