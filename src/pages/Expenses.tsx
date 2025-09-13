import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, PieChart, Target, AlertCircle, DollarSign } from "lucide-react";

export const Expenses = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const transactionFormSchema = z.object({
    description: z.string().min(1, "Mô tả là bắt buộc"),
    amount: z.string().min(1, "Số tiền là bắt buộc"),
    category: z.string().min(1, "Danh mục là bắt buộc"),
    type: z.enum(["income", "expense"], {
      required_error: "Loại giao dịch là bắt buộc"
    })
  });

  const form = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      type: "expense"
    }
  });

  const onSubmit = (values: z.infer<typeof transactionFormSchema>) => {
    console.log(values);
    setDialogOpen(false);
    form.reset();
  };
  // Mock data
  const transactions = [
    { id: 1, date: "2024-01-15", description: "Cơm trưa", category: "Ăn uống", amount: -45000, type: "expense" },
    { id: 2, date: "2024-01-14", description: "Học phí", category: "Học tập", amount: -850000, type: "expense" },
    { id: 3, date: "2024-01-13", description: "Tiền từ nhà", category: "Hỗ trợ", amount: 2000000, type: "income" },
    { id: 4, date: "2024-01-12", description: "Xem phim", category: "Giải trí", amount: -120000, type: "expense" },
    { id: 5, date: "2024-01-11", description: "Mua sách", category: "Học tập", amount: -85000, type: "expense" },
  ];

  // Budget data
  const monthlyBudget = 3000000; // 3 triệu VND
  const budgets = {
    "Ăn uống": { limit: 1200000, spent: 800000 },
    "Học tập": { limit: 1000000, spent: 935000 },
    "Giải trí": { limit: 500000, spent: 320000 },
    "Khác": { limit: 300000, spent: 50000 }
  };

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = Math.abs(transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0));

  const balance = totalIncome - totalExpense;

  // Calculate total spent this month
  const totalSpentThisMonth = Object.values(budgets).reduce((sum, budget) => sum + budget.spent, 0);
  const budgetUsagePercentage = Math.round((totalSpentThisMonth / monthlyBudget) * 100);

  // Category data for pie chart simulation
  const categories = [
    { name: "Ăn uống", amount: 800000, color: "bg-primary", percentage: 38 },
    { name: "Học tập", amount: 935000, color: "bg-green-600", percentage: 45 },
    { name: "Giải trí", amount: 320000, color: "bg-purple-500", percentage: 15 },
    { name: "Khác", amount: 50000, color: "bg-orange-500", percentage: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quản lý chi tiêu</h1>
            <p className="text-muted-foreground">Theo dõi thu chi và ngân sách của bạn</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Thêm giao dịch</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm giao dịch mới</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Loại giao dịch</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="income" id="income" />
                            <Label htmlFor="income" className="text-green-600">Thu nhập</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="expense" id="expense" />
                            <Label htmlFor="expense" className="text-red-600">Chi tiêu</Label>
                          </div>
                        </RadioGroup>
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
                        <Input placeholder="Nhập mô tả giao dịch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền (VND)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Ăn uống">Ăn uống</SelectItem>
                            <SelectItem value="Học tập">Học tập</SelectItem>
                            <SelectItem value="Giải trí">Giải trí</SelectItem>
                            <SelectItem value="Giao thông">Giao thông</SelectItem>
                            <SelectItem value="Hỗ trợ">Hỗ trợ</SelectItem>
                            <SelectItem value="Khác">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">Thêm giao dịch</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thu</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{totalIncome.toLocaleString("vi-VN")} ₫
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chi</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{totalExpense.toLocaleString("vi-VN")} ₫
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số dư</CardTitle>
            <PieChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance >= 0 ? '+' : ''}{balance.toLocaleString("vi-VN")} ₫
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngân sách tháng</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {monthlyBudget.toLocaleString("vi-VN")} ₫
            </div>
            <div className="mt-2 space-y-1">
              <Progress value={budgetUsagePercentage} className="h-2" />
              <div className={`text-xs flex items-center ${budgetUsagePercentage > 80 ? 'text-red-600' : 'text-muted-foreground'}`}>
                {budgetUsagePercentage > 80 && <AlertCircle className="h-3 w-3 mr-1" />}
                Đã dùng {budgetUsagePercentage}% ({totalSpentThisMonth.toLocaleString("vi-VN")} ₫)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Ngân sách theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(budgets).map(([category, budget]) => {
                const percentage = Math.round((budget.spent / budget.limit) * 100);
                const isOverBudget = budget.spent > budget.limit;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category}</span>
                      <span className={`${isOverBudget ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {budget.spent.toLocaleString("vi-VN")} / {budget.limit.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`}
                    />
                    <div className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {percentage}% {isOverBudget && '(Vượt ngân sách!)'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiêu theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{category.name}</span>
                    <span className="font-medium">{category.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${category.color} rounded-full`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {category.amount.toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Giao dịch gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {new Date(transaction.date).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}
                    {transaction.amount.toLocaleString("vi-VN")} ₫
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};