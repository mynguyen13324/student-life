// src/api/task.ts
import { apiRequest } from "@/api/http";

// Khớp với enum BE
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export type TaskDTO = {
  id: string;
  title: string;
  description?: string;
  deadline?: string;        // ISO string
  status: TaskStatus;
  priority: TaskPriority;
  courseId?: string | null; // nếu có liên kết Course
  createdDate?: string;
  lastModifiedDate?: string;
};

export type InsertTaskDTO = {
  title: string;
  description?: string;
  deadline?: string;       // "YYYY-MM-DDTHH:mm:ss"
  status: TaskStatus;
  priority: TaskPriority;
  courseId?: string | null;
};

export type UpdateTaskDTO = Partial<InsertTaskDTO>;

export type SearchTaskDTO = {
  keyword?: string;        // tìm theo title/description
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  from?: string | null;    // ISO
  to?: string | null;      // ISO
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;          // page index
  size: number;
};

const base = "/tasks";

// helpers phòng thủ
const clamp = (n: number, min: number, max = Infinity) =>
  Math.max(min, Math.min(max, Math.trunc(Number.isFinite(n as any) ? n : min)));

const clean = <T extends Record<string, any>>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== ""));

export const TaskAPI = {
  // POST /api/tasks/add
  async add(dto: InsertTaskDTO) {
    const body = clean(dto as any); // không gửi courseId=null, string rỗng...
    return apiRequest<TaskDTO>(`${base}/add`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // PUT /api/tasks/update/{id}
  async update(id: string, dto: UpdateTaskDTO) {
    const body = clean(dto as any);
    return apiRequest<TaskDTO>(`${base}/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  // DELETE /api/tasks/delete/{id}
  async remove(id: string) {
    // Nếu BE trả 204, apiRequest sẽ trả null
    return apiRequest<string | null>(`${base}/delete/${id}`, { method: "DELETE" });
  },

  // GET /api/tasks/{id}
  async get(id: string) {
    return apiRequest<TaskDTO>(`${base}/${id}`);
  },

  // POST /api/tasks/search?page=&size=
  async search(body: SearchTaskDTO, page = 0, size = 10) {
    size = clamp(size, 1);     // chặn size < 1
    page = clamp(page, 0);     // chặn page < 0
    const url = `${base}/search?page=${page}&size=${size}`;
    const payload = clean(body as any); // bỏ field null/"" trong body search
    return apiRequest<Page<TaskDTO>>(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// =========================
// Helpers chuyển đổi datetime
// =========================
export function toLocalDateTimeString(d: Date | string | undefined) {
  if (!d) return undefined;
  const x = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const yyyy = x.getFullYear();
  const MM = pad(x.getMonth() + 1);
  const dd = pad(x.getDate());
  const HH = pad(x.getHours());
  const mm = pad(x.getMinutes());
  const ss = pad(x.getSeconds());
  // Spring LocalDateTime thường ok với dạng này (không 'Z')
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}`;
}
