// src/api/expense.ts

export type ExpenseDTO = {
  id: string;
  amount: number;                 // BigDecimal ↔ number
  category: ExpenseCategory;      // enum string
  description?: string;
  expenseDate: string;            // ISO LocalDateTime, ví dụ "2025-09-30T10:15:00"
  paymentMethod?: string;
  // kèm trường audit nếu BE trả trong AbstractDTO: createdBy, createdDate, ...
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
};

export type InsertExpenseDTO = {
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expenseDate: string;            // "YYYY-MM-DDTHH:mm:ss"
  paymentMethod?: string;
};
export type UpdateExpenseDTO = InsertExpenseDTO;

export type SearchExpenseDTO = {
  pageSize: number;
  pageIndex: number;              // 0-based
  category?: ExpenseCategory;
  minAmount?: number;
  maxAmount?: number;
  description?: string;
  startDate?: string;             // "YYYY-MM-DDTHH:mm:ss" (hoặc chỉ "YYYY-MM-DDT00:00:00")
  endDate?: string;
  paymentMethod?: string;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;                 // current page
  size: number;
};

export type ExpenseCategory =
  | "FOOD"        // ví dụ — đổi theo enum thật của bạn
  | "EDUCATION"
  | "ENTERTAINMENT"
  | "TRANSPORT"
  | "SHOPPING"
  | "OTHER";

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(`/api${path}`, { ...init, headers });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = json?.message || json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  // BE bọc ResponseDTO => trả data nếu có
  return (json?.data ?? json) as T;
}

export const ExpenseAPI = {
  add: (dto: InsertExpenseDTO) =>
    apiRequest<ExpenseDTO>("/expenses/add", { method: "POST", body: JSON.stringify(dto) }),

  update: (id: string, dto: UpdateExpenseDTO) =>
    apiRequest<ExpenseDTO>(`/expenses/update/${id}`, { method: "PUT", body: JSON.stringify(dto) }),

  remove: (id: string) =>
    apiRequest<string>(`/expenses/delete/${id}`, { method: "DELETE" }),

  search: (dto: SearchExpenseDTO) =>
    apiRequest<Page<ExpenseDTO>>("/expenses/search", { method: "POST", body: JSON.stringify(dto) }),
};
