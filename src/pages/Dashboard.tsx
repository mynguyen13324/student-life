import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, DollarSign, CheckCircle } from "lucide-react";

export const Dashboard = () => {
  // Mock data
  const todaySchedule = [
    { time: "08:00", subject: "Toán cao cấp", room: "A101" },
    { time: "10:00", subject: "Lập trình Web", room: "B205" },
    { time: "14:00", subject: "Cơ sở dữ liệu", room: "C301" },
  ];

  const upcomingTasks = [
    { title: "Bài tập Toán", deadline: "2024-01-15", subject: "Toán cao cấp" },
    { title: "Project Web", deadline: "2024-01-18", subject: "Lập trình Web" },
    { title: "Report CSDL", deadline: "2024-01-20", subject: "Cơ sở dữ liệu" },
  ];

  const monthlyExpenses = 2850000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("vi-VN", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch học hôm nay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((schedule, index) => (
                <div key={index} className="flex items-center space-x-3 rounded-lg bg-muted/50 p-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">{schedule.subject}</div>
                    <div className="text-sm text-muted-foreground">
                      {schedule.time} • {schedule.room}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task sắp đến hạn</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-3 rounded-lg bg-muted/50 p-3">
                  <div className="h-2 w-2 rounded-full bg-destructive"></div>
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {task.deadline} • {task.subject}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chi tiêu tháng này</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {monthlyExpenses.toLocaleString("vi-VN")} ₫
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ăn uống</span>
                <span className="font-medium">1,200,000₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Học tập</span>
                <span className="font-medium">850,000₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Giải trí</span>
                <span className="font-medium">800,000₫</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};