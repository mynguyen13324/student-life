import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Plus, Calendar, CheckSquare, CalendarIcon } from "lucide-react";




// Dữ liệu ban đầu cho tasks
const initialTasks = [
  {
    id: 1,
    title: "Bài tập Toán cao cấp - Chương 3",
    subject: "Toán cao cấp",
    deadline: "2024-01-15",
    status: "todo",
    priority: "high"
  },
  {
    id: 2,
    title: "Project Website - Frontend",
    subject: "Lập trình Web",
    deadline: "2024-01-18",
    status: "doing",
    priority: "high"
  },
  {
    id: 3,
    title: "Báo cáo Database Design",
    subject: "Cơ sở dữ liệu",
    deadline: "2024-01-20",
    status: "todo",
    priority: "medium"
  },
  {
    id: 4,
    title: "Ôn tập giữa kỳ Toán",
    subject: "Toán cao cấp",
    deadline: "2024-01-22",
    status: "done",
    priority: "low"
  }
];

export const Tasks = () => {
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const priorities = ["high", "medium", "low"] as const;

  

  
  // BƯỚC 1: Chuyển mảng tasks vào state để có thể cập nhật
  const [tasks, setTasks] = useState(initialTasks);

  const taskFormSchema = z.object({
    title: z.string().min(1, "Tiêu đề task là bắt buộc"),
    description: z.string().optional(),
    category: z.string().min(1, "Danh mục là bắt buộc"),
    deadline: z.date({
      required_error: "Hạn chót là bắt buộc"
    }),
    priority: z.string().min(1, "Độ ưu tiên là bắt buộc")
  });

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "học tập",
      priority: "medium"
    }
  });

  const onSubmit = (values: z.infer<typeof taskFormSchema>) => {
  const newTask = {
    id: tasks.length + 1,
    title: values.title,
    description: values.description,
    subject: values.category,
    deadline: values.deadline.toISOString(),
    status: "todo",
    priority: values.priority
  };
  setTasks(prev => [...prev, newTask]);
  setDialogOpen(false);
  form.reset();
};



  const subjects = ["all", "Toán cao cấp", "Lập trình Web", "Cơ sở dữ liệu"];
  
  const filteredTasks = tasks.filter(task => 
    filter === "all" || task.subject === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-red-100 text-red-800 border-red-200";
      case "doing": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "done": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo": return "To Do";
      case "doing": return "Doing";
      case "done": return "Done";
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

   return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
            <p className="text-muted-foreground">Quản lý công việc và bài tập của bạn</p>
          </div>
        </div>

        {/* Nút thêm task + Form dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Thêm task</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm task mới</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề task" {...field} />
                      </FormControl>
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
                        <Textarea placeholder="Nhập mô tả" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Độ ưu tiên</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn độ ưu tiên" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map(p => (
                            <SelectItem key={p} value={p}>
                              {p === "high" ? "Cao" : p === "medium" ? "Trung bình" : "Thấp"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(c => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Hạn chót</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd/MM/yyyy") : "Chọn ngày"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">Lưu</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>




      <div className="flex items-center space-x-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo môn học" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject === "all" ? "Tất cả môn học" : subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredTasks.map(task => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  
                  {/* BƯỚC 3: Gắn hàm vào sự kiện onCheckedChange của Checkbox */}
                  <Checkbox 
                    checked={task.status === "done"} 
                    onCheckedChange={() => 
                      setTasks(prevTasks =>
                        prevTasks.map(t =>
                          t.id === task.id
                            ? { ...t, status: t.status === "done" ? "todo" : "done" }
                            : t
                        )
                      )
                    }
                    className="h-5 w-5"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    <div>
                      <h3 className={`font-medium text-foreground ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{task.subject}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(task.deadline).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </Badge>

   
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      
    </div>
  );
};