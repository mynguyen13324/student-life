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
  | "EDUCATION"
  | "ENTERTAINMENT"
  | "TRANSPORT"
  | "SHOPPING"
  | "OTHER";

export const ExpenseAPI = {
  add: (dto: InsertExpenseDTO) =>
    apiRequest<ExpenseDTO>("/expenses/add", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  update: (id: string, dto: UpdateExpenseDTO) =>
    apiRequest<ExpenseDTO>(`/expenses/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  remove: (id: string) =>
    apiRequest<string>(`/expenses/delete/${id}`, { method: "DELETE" }),

  search: (dto: SearchExpenseDTO) =>
    apiRequest<Page<ExpenseDTO>>("/expenses/search", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};
