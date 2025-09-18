"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, BookOpen, Pencil, Trash2, XCircle } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";

// ===== Helpers =====
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const pad = (n: number) => n.toString().padStart(2, "0");
const minutesToHHMM = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const buildTimeSlots = (startHour: number, endHour: number, stepMin = 30) => {
  const out: string[] = [];
  for (let m = startHour * 60; m <= endHour * 60; m += stepMin) out.push(minutesToHHMM(m));
  return out;
};
const getViWeekdayLabel = (isoDate: string) => {
  const [y, mo, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, mo - 1, d);
  const dow = dt.getDay(); // 0: CN, 1: Thứ 2, ...
  return dow === 0 ? "Chủ nhật" : `Thứ ${dow + 1}`;
};
const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"] as const;

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 border-blue-300 text-blue-800",
  green: "bg-green-100 border-green-300 text-green-800",
  purple: "bg-purple-100 border-purple-300 text-purple-800",
  orange: "bg-orange-100 border-orange-300 text-orange-800",
  red: "bg-red-100 border-red-300 text-red-800",
};

// cell highlight (để bôi liền các slot trong khoảng)
const cellBgMap: Record<string, string> = {
  blue: "bg-blue-50",
  green: "bg-green-50",
  purple: "bg-purple-50",
  orange: "bg-orange-50",
  red: "bg-red-50",
};

// ===== Schemas =====
const subjectFormSchema = z
  .object({
    name: z.string().min(1, "Tên môn học là bắt buộc"),
    room: z.string().min(1, "Phòng học là bắt buộc"),
    day: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Ngày học không hợp lệ" }),
    startTime: z.string().regex(timeRegex, "Giờ vào không hợp lệ (HH:MM)"),
    endTime: z.string().regex(timeRegex, "Giờ ra không hợp lệ (HH:MM)"),
    color: z.string().min(1, "Màu sắc là bắt buộc"),
    description: z.string().optional(),
  })
  .refine((data) => toMinutes(data.endTime) > toMinutes(data.startTime), {
    message: "Giờ ra phải sau giờ vào",
    path: ["endTime"],
  });

const examFormSchema = z
  .object({
    subject: z.string().min(1, "Tên môn thi là bắt buộc"),
    room: z.string().min(1, "Phòng thi là bắt buộc"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Ngày thi không hợp lệ" }),
    startTime: z.string().regex(timeRegex, "Giờ bắt đầu không hợp lệ (HH:MM)"),
    endTime: z.string().regex(timeRegex, "Giờ kết thúc không hợp lệ (HH:MM)"),
    color: z.string().min(1, "Màu sắc là bắt buộc"),
    type: z.enum(["Thường xuyên", "Giữa kỳ", "Kết thúc học phần"]),
    description: z.string().optional(),
  })
  .refine((data) => toMinutes(data.endTime) > toMinutes(data.startTime), {
    message: "Giờ kết thúc phải sau giờ bắt đầu",
    path: ["endTime"],
  });

export type SubjectItem = z.infer<typeof subjectFormSchema> & { canceled?: boolean };
export type ExamItem = z.infer<typeof examFormSchema> & { canceled?: boolean };

export const Schedule = () => {
  const [activeTab, setActiveTab] = useState<"study" | "exam">("study");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [examDialogOpen, setExamDialogOpen] = useState(false);

  // edit states
  const [editingSubjectIdx, setEditingSubjectIdx] = useState<number | null>(null);
  const [editingExamIdx, setEditingExamIdx] = useState<number | null>(null);

  // confirm delete state
  const [confirm, setConfirm] = useState<{ type: "subject" | "exam" | null; idx: number | null; open: boolean }>({
    type: null,
    idx: null,
    open: false,
  });

  const SLOT_MIN = 30; // bước thời gian hiển thị

  // ===== State dữ liệu =====
  const [subjects, setSubjects] = useState<SubjectItem[]>([
    {
      name: "Toán cao cấp",
      room: "A101",
      day: "2025-10-06",
      startTime: "08:00",
      endTime: "10:00",
      color: "blue",
      description: "Giải tích và đại số tuyến tính",
    },
    {
      name: "Lập trình Web",
      room: "B205",
      day: "2025-10-06",
      startTime: "10:00",
      endTime: "12:00",
      color: "green",
      description: "HTML, CSS, JavaScript cơ bản",
    },
    {
      name: "Cơ sở dữ liệu",
      room: "C301",
      day: "2025-10-07",
      startTime: "14:00",
      endTime: "16:00",
      color: "purple",
      description: "SQL và thiết kế CSDL",
    },
    {
      name: "Xác suất thống kê",
      room: "A203",
      day: "2025-10-08",
      startTime: "07:40",
      endTime: "09:10",
      color: "orange",
      description: "Thống kê ứng dụng",
    },
  ]);

  const [exams, setExams] = useState<ExamItem[]>([
    {
      subject: "Toán cao cấp",
      date: "2025-10-05",
      startTime: "08:00",
      endTime: "10:00",
      room: "Hội trường A",
      color: "red",
      type: "Kết thúc học phần",
      description: "Thi kết thúc học phần Toán cao cấp",
    },
    {
      subject: "Cơ sở dữ liệu",
      date: "2025-10-12",
      startTime: "14:00",
      endTime: "16:00",
      room: "Phòng C301",
      color: "purple",
      type: "Giữa kỳ",
      description: "Thi thực hành SQL",
    },
    {
      subject: "Lập trình Web",
      date: "2025-10-20",
      startTime: "09:00",
      endTime: "11:00",
      room: "Phòng B205",
      color: "green",
      type: "Thường xuyên",
      description: "Thi HTML, CSS, JavaScript",
    },
  ]);

  // ===== Dải thời gian hiển thị động =====
  const DEFAULT_START_H = 7;
  const DEFAULT_END_H = 18;

  const { startHour, endHour } = useMemo(() => {
    let minM = DEFAULT_START_H * 60;
    let maxM = DEFAULT_END_H * 60;
    for (const s of subjects) {
      minM = Math.min(minM, toMinutes(s.startTime));
      maxM = Math.max(maxM, toMinutes(s.endTime));
    }
    for (const e of exams) {
      minM = Math.min(minM, toMinutes(e.startTime));
      maxM = Math.max(maxM, toMinutes(e.endTime));
    }
    const sH = Math.max(0, Math.floor(minM / 60));
    const eH = Math.min(23, Math.ceil(maxM / 60));
    return { startHour: Math.min(sH, DEFAULT_START_H), endHour: Math.max(eH, DEFAULT_END_H) };
  }, [subjects, exams]);

  const timeSlots = useMemo(() => buildTimeSlots(startHour, endHour, SLOT_MIN), [startHour, endHour]);

  // ===== Forms =====
  const form = useForm<SubjectItem>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: { name: "", room: "", day: "", startTime: "", endTime: "", color: "blue", description: "" },
  });

  const examForm = useForm<ExamItem>({
    resolver: zodResolver(examFormSchema),
    defaultValues: { subject: "", room: "", date: "", startTime: "", endTime: "", color: "red", type: "Kết thúc học phần", description: "" },
  });

  const resetSubjectForm = () => form.reset({ name: "", room: "", day: "", startTime: "", endTime: "", color: "blue", description: "" });
  const resetExamForm = () => examForm.reset({ subject: "", room: "", date: "", startTime: "", endTime: "", color: "red", type: "Kết thúc học phần", description: "" });

  const onSubmit = (values: SubjectItem) => {
    if (editingSubjectIdx !== null) {
      setSubjects((prev) => prev.map((s, i) => (i === editingSubjectIdx ? { ...values, canceled: s.canceled } : s)));
      setEditingSubjectIdx(null);
    } else {
      setSubjects((prev) => [...prev, values]);
    }
    setDialogOpen(false);
    resetSubjectForm();
  };

  const onExamSubmit = (values: ExamItem) => {
    if (editingExamIdx !== null) {
      setExams((prev) => prev.map((e, i) => (i === editingExamIdx ? { ...values, canceled: e.canceled } : e)));
      setEditingExamIdx(null);
    } else {
      setExams((prev) => [...prev, values]);
    }
    setExamDialogOpen(false);
    resetExamForm();
  };

  // ===== CRUD helpers =====
  const startEditSubject = (idx: number) => {
    const s = subjects[idx];
    form.reset({ name: s.name, room: s.room, day: s.day, startTime: s.startTime, endTime: s.endTime, color: s.color, description: s.description ?? "" });
    setEditingSubjectIdx(idx);
    setDialogOpen(true);
  };
  const deleteSubject = (idx: number) => setSubjects((prev) => prev.filter((_, i) => i !== idx));
  const toggleCancelSubject = (idx: number) => setSubjects((prev) => prev.map((s, i) => (i === idx ? { ...s, canceled: !s.canceled } : s)));

  const startEditExam = (idx: number) => {
    const e = exams[idx];
    examForm.reset({ subject: e.subject, room: e.room, date: e.date, startTime: e.startTime, endTime: e.endTime, color: e.color, type: e.type, description: e.description ?? "" });
    setEditingExamIdx(idx);
    setExamDialogOpen(true);
  };
  const deleteExam = (idx: number) => setExams((prev) => prev.filter((_, i) => i !== idx));
  const toggleCancelExam = (idx: number) => setExams((prev) => prev.map((e, i) => (i === idx ? { ...e, canceled: !e.canceled } : e)));

  // ===== Render helpers =====
  const ActionButtons = ({ onEdit, onDeleteOpen, onCancel }: { onEdit: () => void; onDeleteOpen: () => void; onCancel: () => void }) => (
    <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onEdit} className="p-1 rounded bg-white/80 shadow hover:bg-white" title="Cập nhật"><Pencil className="h-3.5 w-3.5" /></button>
      <button onClick={onDeleteOpen} className="p-1 rounded bg-white/80 shadow hover:bg-white" title="Xóa"><Trash2 className="h-3.5 w-3.5" /></button>
      <button onClick={onCancel} className="p-1 rounded bg-white/80 shadow hover:bg-white" title="Hủy/Khôi phục"><XCircle className="h-3.5 w-3.5" /></button>
    </div>
  );

  const SubjectCard = (s: SubjectItem, idx: number) => (
    <div className={`relative group h-full rounded border p-2 ${colorMap[s.color] ?? colorMap.blue} ${s.canceled ? "opacity-60 line-through" : ""}`}>
      <ActionButtons
        onEdit={() => startEditSubject(idx)}
        onDeleteOpen={() => setConfirm({ type: "subject", idx, open: true })}
        onCancel={() => toggleCancelSubject(idx)}
      />
      <div className="text-xs font-medium">{s.name}</div>
      <div className="text-xs opacity-80">{s.room}</div>
      <div className="text-xs opacity-70 mt-1">{s.startTime} - {s.endTime}</div>
      {s.description ? <div className="text-xs opacity-60 mt-1 truncate" title={s.description}>{s.description}</div> : null}
    </div>
  );

  const ExamCard = (e: ExamItem, idx: number) => (
    <div className={`relative group rounded border p-2 text-left ${colorMap[e.color] ?? colorMap.red} ${e.canceled ? "opacity-60 line-through" : ""}`}>
      <ActionButtons
        onEdit={() => startEditExam(idx)}
        onDeleteOpen={() => setConfirm({ type: "exam", idx, open: true })}
        onCancel={() => toggleCancelExam(idx)}
      />
      <div className="text-xs font-semibold">{e.subject}</div>
      <div className="text-xs">{e.startTime} - {e.endTime}</div>
      <div className="text-xs">{e.room}</div>
      <div className="mt-1"><span className="text-[10px] px-2 py-0.5 rounded border bg-background">{e.type}</span></div>
    </div>
  );

  // ===== Overlap-aware helpers =====
  // overlap if eventStart < slotEnd && eventEnd > slotStart
  const getCoveringSubject = (dayLabel: string, slotStartMin: number, slotEndMin: number) => {
    return subjects.find(
      (s) =>
        getViWeekdayLabel(s.day) === dayLabel &&
        toMinutes(s.startTime) < slotEndMin &&
        toMinutes(s.endTime) > slotStartMin
    );
  };
  const getCoveringExam = (dayLabel: string, slotStartMin: number, slotEndMin: number) => {
    return exams.find(
      (e) =>
        getViWeekdayLabel(e.date) === dayLabel &&
        toMinutes(e.startTime) < slotEndMin &&
        toMinutes(e.endTime) > slotStartMin
    );
  };

  // find item that STARTS within this slot [slotStartMin, slotEndMin)
  const subjectStartingAt = (dayLabel: string, slotStartMin: number, slotEndMin: number): [SubjectItem, number] | null => {
    const idx = subjects.findIndex(
      (s) =>
        getViWeekdayLabel(s.day) === dayLabel &&
        toMinutes(s.startTime) >= slotStartMin &&
        toMinutes(s.startTime) < slotEndMin
    );
    return idx >= 0 ? [subjects[idx], idx] : null;
  };

  const examStartingAt = (dayLabel: string, slotStartMin: number, slotEndMin: number): [ExamItem, number] | null => {
    const idx = exams.findIndex(
      (e) =>
        getViWeekdayLabel(e.date) === dayLabel &&
        toMinutes(e.startTime) >= slotStartMin &&
        toMinutes(e.startTime) < slotEndMin
    );
    return idx >= 0 ? [exams[idx], idx] : null;
  };

  // confirm deletion handler
  const handleConfirmDelete = () => {
    if (!confirm.type || confirm.idx === null) {
      setConfirm({ type: null, idx: null, open: false });
      return;
    }
    if (confirm.type === "subject") {
      deleteSubject(confirm.idx);
    } else if (confirm.type === "exam") {
      deleteExam(confirm.idx);
    }
    setConfirm({ type: null, idx: null, open: false });
  };

  const getConfirmTitle = () => {
    if (confirm.type === "subject" && confirm.idx !== null) {
      const s = subjects[confirm.idx];
      return `Xóa môn học "${s?.name ?? ""}"?`;
    }
    if (confirm.type === "exam" && confirm.idx !== null) {
      const e = exams[confirm.idx];
      return `Xóa lịch thi "${e?.subject ?? ""}"?`;
    }
    return "Xóa mục này?";
  };

  const getConfirmBody = () => {
    if (confirm.type === "subject" && confirm.idx !== null) {
      const s = subjects[confirm.idx];
      return `${s?.name ?? ""} (${s?.startTime ?? ""} - ${s?.endTime ?? ""}) sẽ bị xóa vĩnh viễn. Bạn có chắc?`;
    }
    if (confirm.type === "exam" && confirm.idx !== null) {
      const e = exams[confirm.idx];
      return `${e?.subject ?? ""} (${e?.startTime ?? ""} - ${e?.endTime ?? ""}) sẽ bị xóa vĩnh viễn. Bạn có chắc?`;
    }
    return "Mục sẽ bị xóa vĩnh viễn. Bạn có chắc?";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{activeTab === "study" ? "Lịch học" : "Lịch thi"}</h1>
            <p className="text-muted-foreground">{activeTab === "study" ? "Quản lý thời khóa biểu của bạn" : "Quản lý lịch thi của bạn"}</p>
          </div>
        </div>

        {activeTab === "study" ? (
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setEditingSubjectIdx(null); resetSubjectForm(); } setDialogOpen(open); }}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2"><Plus className="h-4 w-4" /><span>Thêm môn học</span></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader><DialogTitle>{editingSubjectIdx !== null ? "Cập nhật môn học" : "Thêm môn học mới"}</DialogTitle></DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Tên môn học</FormLabel><FormControl><Input placeholder="Nhập tên môn học" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="room" render={({ field }) => (<FormItem><FormLabel>Phòng học</FormLabel><FormControl><Input placeholder="Ví dụ: A101" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="day" render={({ field }) => (<FormItem><FormLabel>Ngày học</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel>Giờ vào</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem><FormLabel>Giờ ra</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="color" render={({ field }) => (
                      <FormItem><FormLabel>Màu sắc</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Chọn màu" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="blue">Xanh dương</SelectItem>
                            <SelectItem value="green">Xanh lá</SelectItem>
                            <SelectItem value="purple">Tím</SelectItem>
                            <SelectItem value="orange">Cam</SelectItem>
                            <SelectItem value="red">Đỏ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Mô tả</FormLabel><FormControl><Textarea placeholder="Nhập mô tả môn học (tùy chọn)" className="resize-none" rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button><Button type="submit">{editingSubjectIdx !== null ? "Cập nhật" : "Thêm môn học"}</Button></div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button variant="secondary" onClick={() => setActiveTab("exam")}>Lịch thi</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Dialog open={examDialogOpen} onOpenChange={(open) => { if (!open) { setEditingExamIdx(null); resetExamForm(); } setExamDialogOpen(open); }}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2"><Plus className="h-4 w-4" /><span>Thêm lịch thi</span></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader><DialogTitle>{editingExamIdx !== null ? "Cập nhật lịch thi" : "Thêm mới lịch thi"}</DialogTitle></DialogHeader>
                <Form {...examForm}>
                  <form onSubmit={examForm.handleSubmit(onExamSubmit)} className="space-y-3">
                    <FormField control={examForm.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Tên môn thi</FormLabel><FormControl><Input placeholder="Nhập tên môn thi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={examForm.control} name="room" render={({ field }) => (<FormItem><FormLabel>Phòng thi</FormLabel><FormControl><Input placeholder="Ví dụ: A101" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={examForm.control} name="date" render={({ field }) => (<FormItem><FormLabel>Ngày thi</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-2">
                      <FormField control={examForm.control} name="startTime" render={({ field }) => (<FormItem><FormLabel>Giờ bắt đầu</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={examForm.control} name="endTime" render={({ field }) => (<FormItem><FormLabel>Giờ kết thúc</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={examForm.control} name="color" render={({ field }) => (
                      <FormItem><FormLabel>Màu sắc</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Chọn màu" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="blue">Xanh dương</SelectItem>
                            <SelectItem value="green">Xanh lá</SelectItem>
                            <SelectItem value="purple">Tím</SelectItem>
                            <SelectItem value="orange">Cam</SelectItem>
                            <SelectItem value="red">Đỏ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={examForm.control} name="type" render={({ field }) => (
                      <FormItem><FormLabel>Loại kỳ thi</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Chọn loại kỳ thi" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Thường xuyên">Thường xuyên</SelectItem>
                            <SelectItem value="Giữa kỳ">Giữa kỳ</SelectItem>
                            <SelectItem value="Kết thúc học phần">Kết thúc học phần</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={examForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Mô tả</FormLabel><FormControl><Textarea placeholder="Ghi chú thêm (tùy chọn)" className="resize-none" rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="submit" className="w-full">{editingExamIdx !== null ? "Cập nhật" : "Lưu lịch thi"}</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button variant="secondary" onClick={() => setActiveTab("study")}>Lịch học</Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "study" | "exam")} className="w-full">
        {/* Lịch học */}
       <TabsContent value="study">
  <Card>
    <CardHeader><CardTitle>Thời khóa biểu tuần</CardTitle></CardHeader>
    <CardContent className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-sm min-w-[900px]">
          <thead>
            <tr>
              <th className="border p-2 w-20">Giờ</th>
              {weekDays.map((d) => (
                <th key={d} className="border p-2 text-center">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, i) => {
              const slotStartMin = toMinutes(slot);
              const slotEndMin = i + 1 < timeSlots.length ? toMinutes(timeSlots[i + 1]) : slotStartMin + SLOT_MIN;
              return (
                <tr key={slot}>
                  <td className="border p-2 font-medium text-center">{slot}</td>
                  {weekDays.map((day) => {
                    const sStart = subjectStartingAt(day, slotStartMin, slotEndMin);
                    const sCover = getCoveringSubject(day, slotStartMin, slotEndMin);
                    const stillCoversNext =
                      i + 1 < timeSlots.length
                        ? !!getCoveringSubject(day, slotEndMin, toMinutes(timeSlots[i + 2] ?? minutesToHHMM(slotEndMin + SLOT_MIN)))
                        : false;

                    const bg = sCover ? (cellBgMap[sCover.color] ?? cellBgMap.blue) : "";
                    const noTop = sCover && !sStart ? "border-t-transparent" : "";
                    const noBottom = sCover && stillCoversNext ? "border-b-transparent" : "";

                    return (
                      <td key={`${day}-${slot}`} className={`border p-2 align-top ${bg} ${noTop} ${noBottom}`}>
                        {sStart ? SubjectCard(sStart[0], sStart[1]) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        *Các ô trong khoảng thời gian môn học sẽ được bôi nền liên tục, viền ngang trong khoảng được ẩn để nhìn liền khối.
      </p>
    </CardContent>
  </Card>
</TabsContent>


        {/* Lịch thi */}
        <TabsContent value="exam">
          <Card>
            <CardHeader><CardTitle>Lịch thi theo tuần</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border text-sm min-w-[900px]">
                  <thead>
                    <tr>
                      <th className="border p-2 w-20">Giờ</th>
                      {weekDays.map((d) => (<th key={d} className="border p-2 text-center">{d}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot, i) => {
                      const slotStartMin = toMinutes(slot);
                      const slotEndMin = i + 1 < timeSlots.length ? toMinutes(timeSlots[i + 1]) : slotStartMin + SLOT_MIN;
                      return (
                        <tr key={slot}>
                          <td className="border p-2 font-medium text-center">{slot}</td>
                          {weekDays.map((day) => {
                            const exStart = examStartingAt(day, slotStartMin, slotEndMin);
                            const exCover = getCoveringExam(day, slotStartMin, slotEndMin);
                            const stillCoversNext =
                              i + 1 < timeSlots.length
                                ? !!getCoveringExam(day, slotEndMin, toMinutes(timeSlots[i + 2] ?? minutesToHHMM(slotEndMin + SLOT_MIN)))
                                : false;

                            const bg = exCover ? (cellBgMap[exCover.color] ?? cellBgMap.red) : "";
                            const noTop = exCover && !exStart ? "border-t-transparent" : "";
                            const noBottom = exCover && stillCoversNext ? "border-b-transparent" : "";

                            return (
                              <td key={`${day}-${slot}`} className={`border p-2 text-center align-top ${bg} ${noTop} ${noBottom}`}>
                                {exStart ? ExamCard(exStart[0], exStart[1]) : null}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">*Các ô trong khoảng thời gian kỳ thi sẽ được bôi nền liên tục, viền ngang trong khoảng được ẩn để nhìn liền khối.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirm delete dialog */}
      <Dialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{getConfirmTitle()}</DialogTitle>
          </DialogHeader>
          <div className="pt-2 pb-4 text-sm text-muted-foreground">
            {getConfirmBody()}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm({ type: null, idx: null, open: false })}>Hủy</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmDelete}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
