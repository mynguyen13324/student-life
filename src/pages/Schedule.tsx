"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, BookOpen } from "lucide-react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"






export const Schedule = () => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const [activeTab, setActiveTab] = useState("study") //tab hiện tại

  //thêm môn
  const subjectFormSchema = z.object({
    name: z.string().min(1, "Tên môn học là bắt buộc"),
    room: z.string().min(1, "Phòng học là bắt buộc"),
    day: z.string().min(1, "Ngày học là bắt buộc"),
    startTime: z.string().min(1, "Giờ vào là bắt buộc"),
    endTime: z.string().min(1, "Giờ ra là bắt buộc"),
    color: z.string().min(1, "Màu sắc là bắt buộc"),
    description: z.string().optional(),
  })

//thêm lịch thi
  const examFormSchema = z.object({
  subject: z.string().min(1, "Tên môn thi là bắt buộc"),
  room: z.string().min(1, "Phòng thi là bắt buộc"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Ngày thi không hợp lệ",
  }),
  startTime: z.string().min(1, "Giờ vào là bắt buộc"),
  endTime: z.string().min(1, "Giờ ra là bắt buộc"),
  color: z.string().min(1, "Màu sắc là bắt buộc"),
  type: z.enum(["Thường xuyên", "Giữa kỳ", "Kết thúc học phần"]),
  description: z.string().optional(),
})


//form thêm môn

  const form = useForm<z.infer<typeof subjectFormSchema>>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
      room: "",
      day: "",
      startTime: "",
      endTime: "",
      color: "blue",
      description: "",
    },
  })

// form lịch thi
const [examDialogOpen, setExamDialogOpen] = useState(false)

const examForm = useForm<z.infer<typeof examFormSchema>>({
  resolver: zodResolver(examFormSchema),
  defaultValues: {
    subject: "",
    room: "",
    date: "",
    startTime: "",
    endTime: "",
    color: "red",
    type: "Kết thúc học phần",
    description: "",
  },
})

const onExamSubmit = (values: z.infer<typeof examFormSchema>) => {
  console.log("Exam data:", values)
  setExamDialogOpen(false)
  examForm.reset()
}





  const onSubmit = (values: z.infer<typeof subjectFormSchema>) => {
    console.log(values)
    setDialogOpen(false)
    form.reset()
  }

  const timeSlots = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ]

  const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]

  const scheduleData = {
    "Thứ 2-08:00": {
      subject: "Toán cao cấp",
      room: "A101",
      startTime: "08:00",
      endTime: "10:00",
      description: "Giải tích và đại số tuyến tính",
      color: "bg-blue-100 border-blue-300 text-blue-800",
    },
    "Thứ 2-10:00": {
      subject: "Lập trình Web",
      room: "B205",
      startTime: "10:00",
      endTime: "12:00",
      description: "HTML, CSS, JavaScript cơ bản",
      color: "bg-green-100 border-green-300 text-green-800",
    },
    "Thứ 3-14:00": {
      subject: "Cơ sở dữ liệu",
      room: "C301",
      startTime: "14:00",
      endTime: "16:00",
      description: "SQL và thiết kế CSDL",
      color: "bg-purple-100 border-purple-300 text-purple-800",
    },
    "Thứ 4-08:00": {
      subject: "Toán cao cấp",
      room: "A101",
      startTime: "08:00",
      endTime: "10:00",
      description: "Giải tích và đại số tuyến tính",
      color: "bg-blue-100 border-blue-300 text-blue-800",
    },
    "Thứ 5-10:00": {
      subject: "Lập trình Web",
      room: "B205",
      startTime: "10:00",
      endTime: "12:00",
      description: "HTML, CSS, JavaScript cơ bản",
      color: "bg-green-100 border-green-300 text-green-800",
    },
    "Thứ 6-14:00": {
      subject: "Cơ sở dữ liệu",
      room: "C301",
      startTime: "14:00",
      endTime: "16:00",
      description: "SQL và thiết kế CSDL",
      color: "bg-purple-100 border-purple-300 text-purple-800",
    },
  }


//lịch thi
 const examData = [
    {
      subject: "Toán cao cấp",
      date: "2025-10-05",
      time: "08:00 - 10:00",
      room: "Hội trường A",
      description: "Thi kết thúc học phần Toán cao cấp",
    },
    {
      subject: "Cơ sở dữ liệu",
      date: "2025-10-12",
      time: "14:00 - 16:00",
      room: "Phòng C301",
      description: "Thi thực hành SQL",
    },
    {
      subject: "Lập trình Web",
      date: "2025-10-20",
      time: "09:00 - 11:00",
      room: "Phòng B205",
      description: "Thi HTML, CSS, JavaScript",
    },
  ]






 return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {activeTab === "study" ? "Lịch học" : "Lịch thi"}
            </h1>
            <p className="text-muted-foreground">
              {activeTab === "study"
                ? "Quản lý thời khóa biểu của bạn"
                : "Quản lý lịch thi của bạn"}
            </p>
          </div>
        </div>

        {/* Nút bấm */}
        {activeTab === "study" ? (
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Thêm môn học</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm môn học mới</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên môn học</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên môn học" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phòng học</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: A101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Chọn theo THỨ */}
                {/* <FormField
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày học</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn ngày" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weekDays.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                {/* Chọn theo NGÀY - THÁNG - NĂM */}
                <FormField
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày học</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />









                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ vào</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giờ vào" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ ra</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giờ ra" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Màu sắc</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn màu" />
                          </SelectTrigger>
                        </FormControl>
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
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả môn học (tùy chọn)"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">Thêm môn học</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>





            <Button variant="secondary" onClick={() => setActiveTab("exam")}>Lịch thi</Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setActiveTab("study")}>Lịch học</Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        
        {/* Tab Lịch học */}
        <TabsContent value="study">
          <Card>
            <CardHeader><CardTitle>Thời khóa biểu tuần</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-8 gap-1 min-w-[800px]">
                  <div className="p-3 font-medium text-center border-b">Giờ</div>
                  {weekDays.map((day) => (
                    <div key={day} className="p-3 font-medium text-center border-b">{day}</div>
                  ))}
                  {timeSlots.map((time) => (
                    <div key={time} className="contents">
                      <div className="p-3 text-sm font-medium text-center border-r bg-muted/30">{time}</div>
                      {weekDays.map((day) => {
                        const scheduleKey = `${day}-${time}`
                        const schedule = scheduleData[scheduleKey as keyof typeof scheduleData]
                        return (
                          <div key={`${day}-${time}`} className="p-1 min-h-[60px] border border-border">
                            {schedule && (
                              <div className={`h-full rounded border p-2 ${schedule.color}`}>
                                <div className="text-xs font-medium">{schedule.subject}</div>
                                <div className="text-xs opacity-80">{schedule.room}</div>
                                <div className="text-xs opacity-70 mt-1">{schedule.startTime} - {schedule.endTime}</div>
                                {schedule.description && (
                                  <div className="text-xs opacity-60 mt-1 truncate" title={schedule.description}>
                                    {schedule.description}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Lịch thi */}
        <TabsContent value="exam">
<div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-bold">Quản lý lịch thi</h2>
  <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
    <DialogTrigger asChild>
      <Button>Thêm lịch thi</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Thêm mới lịch thi</DialogTitle>
      </DialogHeader>
      <Form {...examForm}>
        <form onSubmit={examForm.handleSubmit(onExamSubmit)} className="space-y-3">
          <FormField control={examForm.control} name="subject" render={({ field }) => (
            <FormItem>
              <FormLabel>Tên môn thi</FormLabel>
              <FormControl><Input placeholder="Nhập tên môn thi" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={examForm.control} name="room" render={({ field }) => (
            <FormItem>
              <FormLabel>Phòng thi</FormLabel>
              <FormControl><Input placeholder="Ví dụ: A101" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={examForm.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày thi</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-2 gap-2">
            <FormField control={examForm.control} name="startTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Giờ vào</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giờ vào" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
              </FormItem>
            )} />
            <FormField control={examForm.control} name="endTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Giờ ra</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giờ ra" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={examForm.control} name="color" render={({ field }) => (
            <FormItem>
              <FormLabel>Màu sắc</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn màu" />
                          </SelectTrigger>
                        </FormControl>
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
            <FormItem>
              <FormLabel>Loại kỳ thi</FormLabel>
              <FormControl>
                <select {...field} className="w-full border rounded p-2">
                  <option>Thường xuyên</option>
                  <option>Giữa kỳ</option>
                  <option>Kết thúc học phần</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={examForm.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" className="w-full">Lưu lịch thi</Button>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
</div>





  <Card>
    <CardContent className="p-4">
      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr>
            <th className="border p-2 w-20">Giờ</th>
            {weekDays.map((day, i) => (
              <th key={i} className="border p-2 text-center">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot, i) => (
            <tr key={i}>
              <td className="border p-2 font-medium">{slot}</td>
              {weekDays.map((day, j) => {
                // kiểm tra có lịch thi nào khớp slot + day không
                const exam = examData.find((ex) => {
                  const examDate = new Date(ex.date)
                  const examDay = examDate.getDay() // 0=CN, 1=Thứ 2 ...
                  const slotHour = parseInt(slot.split(":")[0])
                  const examStart = parseInt(ex.time.split(":")[0])
                  return examDay === (j + 1) % 7 && slotHour === examStart
                })
                return (
                  <td key={j} className="border p-2 text-center">
                    {exam ? (
                      <div className="bg-red-100 text-red-800 rounded p-1">
                        <div className="font-semibold">{exam.subject}</div>
                        <div className="text-xs">{exam.time}</div>
                        <div className="text-xs">{exam.room}</div>
                      </div>
                    ) : null}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent>
  </Card>
</TabsContent>
      </Tabs>
    </div>
  )

}

