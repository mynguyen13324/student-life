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

  // BƯỚC 1: Chuyển mảng tasks vào state để có thể cập nhật
  const [tasks, setTasks] = useState(initialTasks);

  const taskFormSchema = z.object({
    title: z.string().min(1, "Tiêu đề task là bắt buộc"),
    description: z.string().optional(),
    subject: z.string().min(1, "Môn học là bắt buộc"),
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
      subject: "",
      priority: "medium"
    }
  });

  const onSubmit = (values: z.infer<typeof taskFormSchema>) => {
    console.log(values);
    // Logic để thêm task mới vào state `tasks` có thể được thêm ở đây
    setDialogOpen(false);
    form.reset();
  };

  // BƯỚC 2: Tạo hàm xử lý khi nhấn checkbox
  const handleToggleTaskStatus = (taskId: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'done' ? 'todo' : 'done' }
          : task
      )
    );
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Thêm task</span>
            </Button>
          </DialogTrigger>
          {/* ... Nội dung Dialog giữ nguyên ... */}
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
                    onCheckedChange={() => handleToggleTaskStatus(task.id)}
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