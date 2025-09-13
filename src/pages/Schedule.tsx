import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, BookOpen, Clock } from "lucide-react";

export const Schedule = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const subjectFormSchema = z.object({
    name: z.string().min(1, "Tên môn học là bắt buộc"),
    room: z.string().min(1, "Phòng học là bắt buộc"),
    day: z.string().min(1, "Ngày học là bắt buộc"),
    time: z.string().min(1, "Giờ học là bắt buộc"),
    color: z.string().min(1, "Màu sắc là bắt buộc")
  });

  const form = useForm<z.infer<typeof subjectFormSchema>>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
      room: "",
      day: "",
      time: "",
      color: "blue"
    }
  });

  const onSubmit = (values: z.infer<typeof subjectFormSchema>) => {
    console.log(values);
    setDialogOpen(false);
    form.reset();
  };
  const timeSlots = [
    "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];
  
  const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

  // Mock schedule data
  const scheduleData = {
    "Thứ 2-08:00": { subject: "Toán cao cấp", room: "A101", color: "bg-blue-100 border-blue-300 text-blue-800" },
    "Thứ 2-10:00": { subject: "Lập trình Web", room: "B205", color: "bg-green-100 border-green-300 text-green-800" },
    "Thứ 3-14:00": { subject: "Cơ sở dữ liệu", room: "C301", color: "bg-purple-100 border-purple-300 text-purple-800" },
    "Thứ 4-08:00": { subject: "Toán cao cấp", room: "A101", color: "bg-blue-100 border-blue-300 text-blue-800" },
    "Thứ 5-10:00": { subject: "Lập trình Web", room: "B205", color: "bg-green-100 border-green-300 text-green-800" },
    "Thứ 6-14:00": { subject: "Cơ sở dữ liệu", room: "C301", color: "bg-purple-100 border-purple-300 text-purple-800" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lịch học</h1>
            <p className="text-muted-foreground">Quản lý thời khóa biểu của bạn</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Thêm môn học</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
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
                            {weekDays.map(day => (
                              <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ học</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giờ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thời khóa biểu tuần</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-1 min-w-[800px]">
              {/* Header row */}
              <div className="p-3 font-medium text-center border-b">Giờ</div>
              {weekDays.map(day => (
                <div key={day} className="p-3 font-medium text-center border-b">
                  {day}
                </div>
              ))}

              {/* Time slots */}
              {timeSlots.map(time => (
                <div key={time} className="contents">
                  <div className="p-3 text-sm font-medium text-center border-r bg-muted/30">
                    {time}
                  </div>
                  {weekDays.map(day => {
                    const scheduleKey = `${day}-${time}`;
                    const schedule = scheduleData[scheduleKey as keyof typeof scheduleData];
                    
                    return (
                      <div key={`${day}-${time}`} className="p-1 min-h-[60px] border border-border">
                        {schedule && (
                          <div className={`h-full rounded border p-2 ${schedule.color}`}>
                            <div className="text-xs font-medium">{schedule.subject}</div>
                            <div className="text-xs opacity-80">{schedule.room}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};