import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useMemo, useState } from "react";
import { Plus, TrendingUp, TrendingDown, PieChart, Target, AlertCircle, DollarSign, Pencil, Trash2 } from "lucide-react";

// --- Kiểu dữ liệu cho giao dịch ---
interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

// --- Dữ liệu ban đầu (fallback) ---
const initialTransactions: Transaction[] = [
  { id: 1, date: "2024-01-15", description: "Cơm trưa", category: "Ăn uống", amount: -45000, type: "expense" },
  { id: 2, date: "2024-01-14", description: "Học phí", category: "Học tập", amount: -850000, type: "expense" },
  { id: 3, date: "2024-01-13", description: "Tiền từ nhà", category: "Hỗ trợ", amount: 2000000, type: "income" },
  { id: 4, date: "2024-01-12", description: "Xem phim", category: "Giải trí", amount: -120000, type: "expense" },
  { id: 5, date: "2024-01-11", description: "Mua sách", category: "Học tập", amount: -85000, type: "expense" },
];


export const Expenses = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  
  // --- State quản lý danh sách giao dịch, đọc từ localStorage ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const savedTransactions = localStorage.getItem("transactions");
      return savedTransactions ? JSON.parse(savedTransactions) : initialTransactions;
    } catch (error) {
      console.error("Failed to parse transactions from localStorage", error);
      return initialTransactions;
    }
  });

  // --- State quản lý ngân sách tháng, đọc từ localStorage ---
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem("monthlyBudget");
    const parsed = saved ? Number(saved) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 3000000;
  });

  const [budgetInput, setBudgetInput] = useState<string>(String(monthlyBudget));

  // --- States cho bộ lọc ---
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all"); // SỬA LỖI: Giá trị mặc định là "all"
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // --- Lưu dữ liệu vào localStorage mỗi khi có thay đổi ---
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("monthlyBudget", String(monthlyBudget));
  }, [monthlyBudget]);

  // --- Định nghĩa Schema cho Form ---
  const transactionFormSchema = z.object({
    description: z.string().min(1, "Mô tả là bắt buộc"),
    amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Số tiền phải là một số lớn hơn 0",
    }),
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

  const watchedType = form.watch("type");
  
  // Reset danh mục khi thay đổi loại giao dịch
  useEffect(() => {
    form.setValue("category", "");
  }, [watchedType, form]);

  // --- Xử lý khi submit form ---
  const onSubmit = (values: z.infer<typeof transactionFormSchema>) => {
    const numericAmount = parseFloat(values.amount);

    // Chặn vượt ngân sách tháng đối với giao dịch chi tiêu
    if (values.type === 'expense') {
      const projected = totalSpentThisMonth + numericAmount;
      if (monthlyBudget >= 0 && projected > monthlyBudget) {
        alert(`Vượt giới hạn ngân sách tháng. Tổng chi dự kiến là ${projected.toLocaleString('vi-VN')} ₫ trong khi ngân sách là ${monthlyBudget.toLocaleString('vi-VN')} ₫.`);
        return;
      }
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      description: values.description,
      category: values.category,
      type: values.type,
      amount: values.type === 'expense' ? -numericAmount : numericAmount,
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setDialogOpen(false);
    form.reset();
  };

  // --- Form chỉnh sửa giao dịch ---
  const editForm = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      type: "expense"
    }
  });
  const editWatchedType = editForm.watch("type");
  useEffect(() => {
    editForm.setValue("category", "");
  }, [editWatchedType, editForm]);

  const openEditDialog = (tx: Transaction) => {
    setEditingTransaction(tx);
    editForm.reset({
      description: tx.description,
      amount: String(Math.abs(tx.amount)),
      category: tx.category,
      type: tx.type
    });
    setEditDialogOpen(true);
  };

  const onEditSubmit = (values: z.infer<typeof transactionFormSchema>) => {
    if (!editingTransaction) return;
    const numericAmount = parseFloat(values.amount);

    // Tính tổng chi dự kiến sau khi cập nhật
    const currentSpent = totalSpentThisMonth;
    const oldExpense = editingTransaction.type === 'expense' ? Math.abs(editingTransaction.amount) : 0;
    const newExpense = values.type === 'expense' ? numericAmount : 0;
    const projected = currentSpent - oldExpense + newExpense;
    if (monthlyBudget >= 0 && projected > monthlyBudget) {
      alert(`Vượt giới hạn ngân sách tháng. Tổng chi dự kiến là ${projected.toLocaleString('vi-VN')} ₫ trong khi ngân sách là ${monthlyBudget.toLocaleString('vi-VN')} ₫.`);
      return;
    }

    const updated: Transaction = {
      ...editingTransaction,
      description: values.description,
      category: values.category,
      type: values.type,
      amount: values.type === 'expense' ? -numericAmount : numericAmount,
    };

    setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? updated : t));
    setEditDialogOpen(false);
    setEditingTransaction(null);
  };
  
  // --- Các danh mục ---
  const expenseCategories = ["Ăn uống", "Học tập", "Giải trí", "Giao thông", "Mua sắm", "Khác"] as const;
  const incomeCategories = ["Hỗ trợ", "Học bổng", "Tiền lương", "Khác"] as const;
  const categoryOptionsForType = watchedType === "income" ? incomeCategories : expenseCategories;
  
  // --- Tính toán động các số liệu từ state `transactions` ---
  const { totalIncome, totalExpense, balance, totalSpentThisMonth, filteredTransactions, categorySpending } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const filtered = transactions.filter(t => {
      if (filterType !== "all" && t.type !== filterType) return false;
      // SỬA LỖI: Thêm điều kiện `filterCategory !== "all"`
      if (filterCategory && filterCategory !== "all" && t.category !== filterCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const text = `${t.description} ${t.category}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
    
    const spending = transactions // Tính toán trên tất cả giao dịch, không phải giao dịch đã lọc
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + Math.abs(curr.amount);
        return acc;
      }, {} as Record<string, number>);

    return {
      totalIncome: income,
      totalExpense: Math.abs(expense),
      balance: income + expense,
      totalSpentThisMonth: Math.abs(expense),
      filteredTransactions: filtered,
      categorySpending: spending
    };
  }, [transactions, filterType, filterCategory, searchQuery]);

  const budgetUsagePercentage = monthlyBudget > 0 ? Math.round((totalSpentThisMonth / monthlyBudget) * 100) : 0;
  
  // Dữ liệu cho biểu đồ, tính toán động
  const chartCategories = useMemo(() => {
    if(totalSpentThisMonth === 0) return [];
    
    const colors = ["bg-primary", "bg-green-600", "bg-purple-500", "bg-orange-500", "bg-red-500"];
    return Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .map(([name, amount], index) => ({
        name,
        amount,
        color: colors[index % colors.length],
        percentage: Math.round((amount / totalSpentThisMonth) * 100)
      }));
  }, [categorySpending, totalSpentThisMonth]);

  // Xử lý lưu ngân sách
  const handleSaveBudget = () => {
    const next = Number(budgetInput);
    if (Number.isFinite(next) && next >= 0) {
      setMonthlyBudget(next);
      setEditBudgetOpen(false);
    } else {
      alert("Vui lòng nhập một số hợp lệ cho ngân sách.");
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={watchedType === 'income' ? 'Chọn danh mục thu' : 'Chọn danh mục chi'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryOptionsForType.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              {balance.toLocaleString("vi-VN")} ₫
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngân sách tháng</CardTitle>
            <div className="flex items-center">
              <Target className="h-4 w-4 text-primary" />
              <Dialog open={editBudgetOpen} onOpenChange={setEditBudgetOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 ml-2">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Chỉnh sửa ngân sách tháng</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Ngân sách (VND)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" type="button" onClick={() => setEditBudgetOpen(false)}>Hủy</Button>
                      <Button type="button" onClick={handleSaveBudget}>
                        Lưu
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {monthlyBudget.toLocaleString("vi-VN")} ₫
            </div>
            <div className="mt-2 space-y-1">
              <Progress value={budgetUsagePercentage} className="h-2" />
              <div className={`text-xs flex items-center ${budgetUsagePercentage > 80 ? 'text-red-600' : 'text-muted-foreground'}`}>
                {budgetUsagePercentage > 100 && <AlertCircle className="h-3 w-3 mr-1" />}
                Đã dùng {budgetUsagePercentage}% ({totalSpentThisMonth.toLocaleString("vi-VN")} ₫)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Category Charts */}
      <div className="grid gap-6 lg:grid-cols-1">
        <Card>
            <CardHeader>
                <CardTitle>Phân tích chi tiêu</CardTitle>
            </CardHeader>
            <CardContent>
                {chartCategories.length > 0 ? (
                    <div className="space-y-4">
                        {chartCategories.map(category => (
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
                ) : (
                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu chi tiêu để hiển thị.</p>
                )}
            </CardContent>
        </Card>
      </div>


      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label htmlFor="filterType">Loại giao dịch</Label>
              <Select
                value={filterType}
                onValueChange={(v) => {
                  setFilterType(v as any);
                  setFilterCategory("all"); // Reset category filter
                }}
              >
                <SelectTrigger id="filterType" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="income">Thu nhập</SelectItem>
                  <SelectItem value="expense">Chi tiêu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterCategory">Danh mục</Label>
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger id="filterCategory" className="mt-1">
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {/* SỬA LỖI: value="all" */}
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {(filterType === "income"
                    ? incomeCategories
                    : filterType === "expense"
                    ? expenseCategories
                    : [...new Set([...incomeCategories, ...expenseCategories])]
                  ).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Tìm kiếm</Label>
              <Input
                id="search"
                className="mt-1"
                placeholder="Nhập mô tả, danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? filteredTransactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {new Date(transaction.date).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : ''
                    }`}>
                    {transaction.amount.toLocaleString("vi-VN")} ₫
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(transaction)}>Sửa</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="gap-1">
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa giao dịch?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Thao tác này không thể hoàn tác. Giao dịch sẽ bị xóa khỏi lịch sử.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setTransactions(prev => prev.filter(t => t.id !== transaction.id))}>Xóa</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Không tìm thấy giao dịch nào.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
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
                          <RadioGroupItem value="income" id="edit-income" />
                          <Label htmlFor="edit-income" className="text-green-600">Thu nhập</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="expense" id="edit-expense" />
                          <Label htmlFor="edit-expense" className="text-red-600">Chi tiêu</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
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
                  control={editForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền (VND)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={editWatchedType === 'income' ? 'Chọn danh mục thu' : 'Chọn danh mục chi'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(editWatchedType === 'income' ? incomeCategories : expenseCategories).map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">Lưu thay đổi</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};