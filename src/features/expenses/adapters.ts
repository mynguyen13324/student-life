// src/features/expenses/adapters.ts




import type {
  ExpenseDTO,
  InsertExpenseDTO,
  UpdateExpenseDTO,
  ExpenseCategory,
} from "@/api/expense";

export type UiExpense = {
  id?: string;                 // id từ BE
  amount: number;              // dương
  category: ExpenseCategory;
  description?: string;
  date: string;                // "YYYY-MM-DD"
  time: string;                // "HH:mm"
  paymentMethod?: string;
};

export const toUi = (e: ExpenseDTO): UiExpense => {
  const d = new Date(e.expenseDate);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");
  return {
    id: e.id,
    amount: Number(e.amount),
    category: e.category,
    description: e.description,
    date: `${yyyy}-${mm}-${dd}`,
    time: `${HH}:${MM}`,
    paymentMethod: e.paymentMethod,
  };
};

export const toInsert = (u: UiExpense): InsertExpenseDTO => ({
  amount: u.amount,
  category: u.category,
  description: u.description,
  expenseDate: `${u.date}T${u.time}:00`,
  paymentMethod: u.paymentMethod,
});

export const toUpdate = (u: UiExpense): UpdateExpenseDTO => ({
  amount: u.amount,
  category: u.category,
  description: u.description,
  expenseDate: `${u.date}T${u.time}:00`,
  paymentMethod: u.paymentMethod,
});
