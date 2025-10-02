// src/api/expense.ts
import { apiRequest } from "@/api/http";

export type ExpenseDTO = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expenseDate: string; // ISO LocalDateTime
  paymentMethod?: string;

  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
};

export type InsertExpenseDTO = {
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expenseDate: string;  // "YYYY-MM-DDTHH:mm:ss"
  paymentMethod?: string;
};
export type UpdateExpenseDTO = InsertExpenseDTO;

export type SearchExpenseDTO = {
  pageSize: number;
  pageIndex: number;     // 0-based
  category?: ExpenseCategory;
  minAmount?: number;
  maxAmount?: number;
  description?: string;
  startDate?: string;    // "YYYY-MM-DDTHH:mm:ss"
  endDate?: string;
  paymentMethod?: string;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type ExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "STUDY"
  | "OTHER";

// ⬇️ BE trả bọc trong ResponseDTO
type Resp<T> = {
  data: T;
  status?: string;
  message?: string;
  code?: number;
  success?: boolean;
};

export const ExpenseAPI = {
  add: (dto: InsertExpenseDTO) =>
    apiRequest<Resp<ExpenseDTO>>("/expenses/add", {
      method: "POST",
      body: JSON.stringify(dto),
    }).then(r => r.data),

  update: (id: string, dto: UpdateExpenseDTO) =>
    apiRequest<Resp<ExpenseDTO>>(`/expenses/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }).then(r => r.data),

  remove: (id: string) =>
    apiRequest<Resp<string>>(`/expenses/delete/${id}`, { method: "DELETE" })
      .then(r => r.data),

  search: (dto: SearchExpenseDTO) =>
    apiRequest<Resp<Page<ExpenseDTO>>>("/expenses/search", {
      method: "POST",
      body: JSON.stringify(dto),
    }).then(r => r.data), // ⬅️ Unwrap để FE nhận thẳng Page<ExpenseDTO>
};
