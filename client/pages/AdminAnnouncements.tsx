import { useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Megaphone, Calendar, Eye, Search } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  target: "ทั้งหมด" | "นิสิต" | "อาจารย์";
  status: "เผยแพร่" | "แบบร่าง";
  views: number;
}

export default function AdminAnnouncements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target: "ทั้งหมด" as Announcement["target"],
    status: "เผยแพร่" as Announcement["status"],
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      title: "กำหนดการลงทะเบียนเรียน ภาคต้น ปีการศึกษา 2567",
      content:
        "นิสิตสามารถลงทะเบียนเรียนผ่านระบบ reg.ku.ac.th ได้ตั้งแต่วันที่ 15-20 มกราคม 2567 โดยให้ตรวจสอบแผนการเรียนกับอาจารย์ที่ปรึกษาก่อนดำเนินการลงทะเบียน",
      date: "2567-01-10",
      target: "นิสิต",
      status: "เผยแพร่",
      views: 523,
    },
    {
      id: "2",
      title: "ประกาศวันหยุดประจำภาคการศึกษา",
      content:
        "แจ้งวันหยุดราชการและวันหยุดพิเศษในภาคเรียนที่ 1/2567 ได้แก่ วันมาฆบูชา วันจักรี วันสงกรานต์ โปรดวางแผนการเรียนการสอนให้เหมาะสม",
      date: "2567-01-08",
      target: "ทั้งหมด",
      status: "เผยแพร่",
      views: 892,
    },
    {
      id: "3",
      title: "แจ้งปรับปรุงโครงสร้างหลักสูตรวิศวกรรมคอมพิวเตอร์",
      content:
        "มีการปรับเปลี่ยนรายวิชาเลือกในหมวดวิชาเอก ตั้งแต่ปีการศึกษา 2568 เป็นต้นไป นิสิตที่เข้าศึกษาก่อนปี 2568 ใช้หลักสูตรเดิม",
      date: "2567-01-05",
      target: "นิสิต",
      status: "เผยแพร่",
      views: 345,
    },
    {
      id: "4",
      title: "กำหนดส่งเกรดภาคเรียนที่ 2/2566",
      content:
        "อาจารย์ผู้สอนกรุณาส่งเกรดภายในวันที่ 30 มกราคม 2567 ผ่านระบบ reg.ku.ac.th",
      date: "2567-01-03",
      target: "อาจารย์",
      status: "เผยแพร่",
      views: 128,
    },
    {
      id: "5",
      title: "แนวทางการสอบกลางภาค 1/2567 (ร่าง)",
      content: "กำลังจัดทำตารางสอบกลางภาค รอการอนุมัติจากคณะกรรมการ",
      date: "2567-01-15",
      target: "ทั้งหมด",
      status: "แบบร่าง",
      views: 0,
    },
  ]);

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.title || !formData.content) return;

    if (editingId) {
      setAnnouncements(
        announcements.map((a) =>
          a.id === editingId
            ? { ...a, title: formData.title, content: formData.content, target: formData.target, status: formData.status }
            : a
        )
      );
      setEditingId(null);
    } else {
      const newAnnouncement: Announcement = {
        id: Math.random().toString(),
        title: formData.title,
        content: formData.content,
        date: new Date().toISOString().slice(0, 10).replace(/(\d{4})/, (_, y) => String(Number(y) + 543)),
        target: formData.target,
        status: formData.status,
        views: 0,
      };
      setAnnouncements([newAnnouncement, ...announcements]);
    }
    setFormData({ title: "", content: "", target: "ทั้งหมด", status: "เผยแพร่" });
    setShowForm(false);
  };

  const handleEdit = (a: Announcement) => {
    setEditingId(a.id);
    setFormData({ title: a.title, content: a.content, target: a.target, status: a.status });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">ประกาศข่าวสาร</h1>
            <p className="text-slate-600 mt-1">
              สร้างและจัดการประกาศข่าวสารให้นิสิตและอาจารย์
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", content: "", target: "ทั้งหมด", status: "เผยแพร่" });
            }}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            สร้างประกาศ
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Megaphone size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600">ประกาศทั้งหมด</p>
                <p className="text-2xl font-bold text-slate-900">{announcements.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Eye size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600">เผยแพร่แล้ว</p>
                <p className="text-2xl font-bold text-slate-900">
                  {announcements.filter((a) => a.status === "เผยแพร่").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <Edit2 size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600">แบบร่าง</p>
                <p className="text-2xl font-bold text-slate-900">
                  {announcements.filter((a) => a.status === "แบบร่าง").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <Card className="p-6 border border-primary">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? "แก้ไขประกาศ" : "สร้างประกาศใหม่"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  หัวข้อประกาศ
                </label>
                <Input
                  placeholder="ใส่หัวข้อประกาศ..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  เนื้อหาประกาศ
                </label>
                <textarea
                  placeholder="ใส่เนื้อหาประกาศ..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    กลุ่มเป้าหมาย
                  </label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value as Announcement["target"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="ทั้งหมด">ทั้งหมด</option>
                    <option value="นิสิต">นิสิตเท่านั้น</option>
                    <option value="อาจารย์">อาจารย์เท่านั้น</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    สถานะ
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Announcement["status"] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="เผยแพร่">เผยแพร่ทันที</option>
                    <option value="แบบร่าง">บันทึกเป็นร่าง</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex items-center gap-2">
                  {editingId ? "บันทึกการแก้ไข" : "เผยแพร่ประกาศ"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <Input
            placeholder="ค้นหาประกาศ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border border-slate-300"
          />
        </div>

        {/* Announcements List */}
        <Card className="p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            รายการประกาศ ({filteredAnnouncements.length})
          </h2>
          <div className="space-y-4">
            {filteredAnnouncements.length === 0 ? (
              <p className="text-slate-500 text-center py-8">ไม่พบประกาศ</p>
            ) : (
              filteredAnnouncements.map((a) => (
                <div
                  key={a.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-900">{a.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            a.status === "เผยแพร่"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {a.status}
                        </span>
                        <span className="text-xs px-2 py-1 rounded font-medium bg-blue-100 text-blue-700">
                          {a.target}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{a.content}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {a.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {a.views} ครั้ง
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(a)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} className="text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
