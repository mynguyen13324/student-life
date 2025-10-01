"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ExpenseAPI, type ExpenseCategory, type SearchExpenseDTO } from "@/api/expense";
import { toUi, toInsert, toUpdate, type UiExpense } from "../features/expenses/adapters";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // giữ import cho đồng bộ mẫu (không dùng)
import { Label } from "@/components/ui/label";
import { Plus, TrendingUp, TrendingDown, PieChart, Target, AlertCircle, DollarSign, Pencil, Trash2 } from "lucide-react";

// src/services/expenses.ts
import { apiRequest } from "@/api/http";

export const getExpenses = () => apiRequest("/expenses"); // tự gắn Bearer + auto refresh
export const createExpense = (payload: any) =>
  apiRequest("/expenses", { method: "POST", body: JSON.stringify(payload) });


const categoryOptions: ExpenseCategory[] = [
  "FOOD",
  "EDUCATION",
  "ENTERTAINMENT",
  "TRANSPORT",
  "SHOPPING",
  "OTHER",
];

const paymentOptions = ["CASH", "BANK", "CARD", "EWALLET", "OTHER"];

const expenseFormSchema = z.object({
  amount: z.string().refine((v) => !isNaN(+v) && +v > 0, "Số tiền > 0"),
  category: z.string().min(1, "Chọn danh mục"),
  description: z.string().optional(),
  date: z.string().min(1, "Chọn ngày"),       // yyyy-MM-dd
  time: z.string().min(1, "Chọn giờ"),        // HH:mm
  paymentMethod: z.string().optional(),
});

export default function Expenses() {
  // ---- data state ----
  const [items, setItems] = useState<UiExpense[]>([]);
  const [loading, setLoading] = useState(false);

  // ---- pagination ----
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ---- filters (rút gọn thành 3 cột như bố cục mẫu) ----
  const [fCategory, setFCategory] = useState<ExpenseCategory | "ALL">("ALL");
  const [fPayment, setFPayment] = useState<string | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // vẫn giữ min/max/start/end ẩn để không thay đổi API search (gán từ searchQuery khi bấm Tìm)
  const [fMin, setFMin] = useState<string>("");
  const [fMax, setFMax] = useState<string>("");
  const [fStart, setFStart] = useState<string>("");
  const [fEnd, setFEnd] = useState<string>("");

  // ---- dialog ----
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UiExpense | null>(null);

  // ---- monthly budget (UI-only, giống mẫu) ----
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem("monthlyBudget");
    const parsed = saved ? Number(saved) : NaN;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3000000;
  });
  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState<string>(String(monthlyBudget));
  useEffect(() => {
    localStorage.setItem("monthlyBudget", String(monthlyBudget));
  }, [monthlyBudget]);
  const handleSaveBudget = () => {
    const next = Number(budgetInput);
    if (Number.isFinite(next) && next >= 0) {
      setMonthlyBudget(next);
      setEditBudgetOpen(false);
    } else {
      alert("Vui lòng nhập một số hợp lệ cho ngân sách.");
    }
  };

  // ---- forms ----
  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: "",
      category: "",
      description: "",
      date: "",
      time: "",
      paymentMethod: "",
    },
  });

  const editForm = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: "",
      category: "",
      description: "",
      date: "",
      time: "",
      paymentMethod: "",
    },
  });

  // ---- fetch ----
  const fetchData = async () => {
    setLoading(true);
    try {
      const payload: SearchExpenseDTO = {
        pageIndex,
        pageSize,
        category: fCategory === "ALL" ? undefined : (fCategory as any),
        description: searchQuery || undefined,
        minAmount: fMin ? +fMin : undefined,
        maxAmount: fMax ? +fMax : undefined,
        startDate: fStart ? `${fStart}T00:00:00` : undefined,
        endDate: fEnd ? `${fEnd}T23:59:59` : undefined,
        paymentMethod: fPayment === "ALL" ? undefined : fPayment,
      };
      const page = await ExpenseAPI.search(payload);
      setItems((page.content ?? []).map(toUi));
      setTotalPages(page.totalPages ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  // ---- handlers ----
  const onSubmit = async (values: z.infer<typeof expenseFormSchema>) => {
    try {
      const ui: UiExpense = {
        amount: +values.amount,
        category: values.category as ExpenseCategory,
        description: values.description,
        date: values.date,
        time: values.time,
        paymentMethod: values.paymentMethod || "CASH",
      };
      await ExpenseAPI.add(toInsert(ui));
      setDialogOpen(false);
      form.reset();
      await fetchData();
    } catch (e: any) {
      alert(e?.message || "Thêm chi tiêu thất bại");
    }
  };

  const openEdit = (it: UiExpense) => {
    setEditing(it);
    editForm.reset({
      amount: String(it.amount),
      category: it.category,
      description: it.description || "",
      date: it.date,
      time: it.time,
      paymentMethod: it.paymentMethod || "",
    });
    setEditDialogOpen(true);
  };

  const onEditSubmit = async (values: z.infer<typeof expenseFormSchema>) => {
    if (!editing?.id) return;
    try {
      const ui: UiExpense = {
        id: editing.id,
        amount: +values.amount,
        category: values.category as ExpenseCategory,
        description: values.description,
        date: values.date,
        time: values.time,
        paymentMethod: values.paymentMethod || "CASH",
      };
      await ExpenseAPI.update(editing.id, toUpdate(ui));
      setEditDialogOpen(false);
      setEditing(null);
      await fetchData();
    } catch (e: any) {
      alert(e?.message || "Cập nhật chi tiêu thất bại");
    }
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    try {
      await ExpenseAPI.remove(id);
      await fetchData();
    } catch (e: any) {
      alert(e?.message || "Xóa chi tiêu thất bại");
    }
  };

  // ---- computed (để hiện 4 Summary Cards & Chart giống mẫu) ----
  const totalExpense = useMemo(
    () => items.reduce((s, i) => s + i.amount, 0),
    [items]
  );
  const totalIncome = 0; // không có API thu, để 0 cho giống bố cục
  const balance = totalIncome - totalExpense;
  const totalSpentThisMonth = totalExpense;
  const budgetUsagePercentage =
    monthlyBudget > 0 ? Math.round((totalSpentThisMonth / monthlyBudget) * 100) : 0;

  const categorySpending: Record<string, number> = useMemo(() => {
    return items.reduce((acc, curr) => {
      const key = curr.category || "OTHER";
      acc[key] = (acc[key] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [items]);

  const chartCategories = useMemo(() => {
    if (totalSpentThisMonth === 0) return [];
    const colors = ["bg-primary", "bg-green-600", "bg-purple-500", "bg-orange-500", "bg-red-500"];
    return Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .map(([name, amount], index) => {
        const pct = Math.round((amount / totalSpentThisMonth) * 100);
        return { name, amount, color: colors[index % colors.length], percentage: pct };
      });
  }, [categorySpending, totalSpentThisMonth]);

  // ===================== UI (BỐ CỤC GIỐNG MẪU) =====================
  return (
    <div className="space-y-6">
      {/* Header */}
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

        {/* Add dialog (giữ form theo API hiện có) */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Thêm chi tiêu</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Thêm chi tiêu mới</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  name="amount"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền (VND)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step={1000} placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    name="date"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="time"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ</FormLabel>
                        <FormControl><Input type="time" step={60} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="paymentMethod"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phương thức</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phương thức" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentOptions.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl><Input placeholder="Ghi chú (tuỳ chọn)" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
                  <Button type="submit">Lưu</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards (4 ô giống mẫu) */}
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
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
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
                      <Button type="button" onClick={handleSaveBudget}>Lưu</Button>
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
              <div className={`text-xs flex items-center ${budgetUsagePercentage > 80 ? "text-red-600" : "text-muted-foreground"}`}>
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
                {chartCategories.map((category) => (
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

      {/* Filters (3 cột giống bố cục) */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label>Danh mục</Label>
              <Select value={fCategory} onValueChange={(v) => setFCategory(v as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Phương thức</Label>
              <Select value={fPayment} onValueChange={(v) => setFPayment(v as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  {paymentOptions.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Tìm kiếm</Label>
              <Input
                id="search"
                className="mt-1"
                placeholder="Nhập mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-end gap-2 mt-3">
            <Button onClick={() => { setPageIndex(0); fetchData(); }}>Tìm</Button>
            <Button
              variant="outline"
              onClick={() => {
                setFCategory("ALL");
                setFPayment("ALL");
                setSearchQuery("");
                setFMin("");
                setFMax("");
                setFStart("");
                setFEnd("");
                setPageIndex(0);
                fetchData();
              }}
            >
              Xóa lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Giờ</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>PTTT</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length ? items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{new Date(`${it.date}T00:00:00`).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell>{it.time}</TableCell>
                  <TableCell className="max-w-[280px] truncate" title={it.description}>
                    {it.description || "-"}
                  </TableCell>
                  <TableCell><Badge variant="outline">{it.category}</Badge></TableCell>
                  <TableCell>{it.paymentMethod || "-"}</TableCell>
                  <TableCell className="text-right text-red-600">-{it.amount.toLocaleString("vi-VN")} ₫</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(it)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="gap-1">
                            <Trash2 className="h-4 w-4" /> Xóa
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa chi tiêu?</AlertDialogTitle>
                            <AlertDialogDescription>Thao tác này không thể hoàn tác.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(it.id)}>Xóa</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Không có dữ liệu.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Chỉnh sửa chi tiêu</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                name="amount"
                control={editForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền (VND)</FormLabel>
                    <FormControl><Input type="number" min="0" step={1000} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="date"
                  control={editForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="time"
                  control={editForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ</FormLabel>
                      <FormControl><Input type="time" step={60} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                name="category"
                control={editForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categoryOptions.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="paymentMethod"
                control={editForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phương thức</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {paymentOptions.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="description"
                control={editForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Hủy</Button>
                <Button type="submit">Lưu</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
