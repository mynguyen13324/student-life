// src/features/expenses/adapters.ts

import type {
  ExpenseDTO,
  InsertExpenseDTO,
  UpdateExpenseDTO,
  ExpenseCategory,
} from "@/api/expense";

export type UiExpense = {
  id?: string;                 // id từ BE
  amount: number;              // luôn dương (đơn vị VND)
  category: ExpenseCategory;
  description?: string;
  date: string;                // "YYYY-MM-DD"
  time: string;                // "HH:mm"
  paymentMethod?: string;
};

// Helpers
const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Parse ISO string (hoặc Date) -> tách về ngày/giờ theo local time
 * Nếu không hợp lệ, trả về rỗng để tránh crash UI
 */
const splitIsoToDateTime = (iso: string | Date | undefined) => {
  if (!iso) return { date: "", time: "" };
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };

  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const HH = pad2(d.getHours());
  const MM = pad2(d.getMinutes());

  return { date: `${yyyy}-${mm}-${dd}`, time: `${HH}:${MM}` };
};

/** Ghép "YYYY-MM-DD" + "HH:mm" thành "YYYY-MM-DDTHH:mm:00" */
const joinDateTime = (date: string, time?: string) => {
  const hhmm = time && /^\d{2}:\d{2}$/.test(time) ? time : "00:00";
  return `${date}T${hhmm}:00`;
};

// =================== Adapters ===================

export const toUi = (e: ExpenseDTO): UiExpense => {
  const { date, time } = splitIsoToDateTime(e.expenseDate);
  return {
    id: e.id,
    amount: Number(e.amount ?? 0),
    category: e.category as ExpenseCategory,
    description: e.description ?? "",
    date,
    time,
    paymentMethod: e.paymentMethod ?? undefined,
  };
};

export const toInsert = (u: UiExpense): InsertExpenseDTO => ({
  amount: u.amount,
  category: u.category,
  description: u.description?.trim() ? u.description : undefined,
  expenseDate: joinDateTime(u.date, u.time),
  paymentMethod: u.paymentMethod?.trim() ? u.paymentMethod : undefined,
});

export const toUpdate = (u: UiExpense): UpdateExpenseDTO => ({
  amount: u.amount,
  category: u.category,
  description: u.description?.trim() ? u.description : undefined,
  expenseDate: joinDateTime(u.date, u.time),
  paymentMethod: u.paymentMethod?.trim() ? u.paymentMethod : undefined,
});
