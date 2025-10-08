// src/lib/dashboard-cache.ts

export const DASH_KEYS = {
  SCHEDULE: "dashboard.schedule",      // Course[]
  TASKS: "dashboard.tasks",            // Task[]
  EXPENSES: "dashboard.expensesCache", // Expense[]
  BUDGET: "monthlyBudget",             // number (đã dùng ở Expenses)
} as const;

export type Course = { time: string; subject: string; room: string };

export type Task = { title: string; deadline: string; subject?: string; done?: boolean };

export type ExpenseLite = {
  id?: string;
  amount: number;
  date: string;       // yyyy-MM-dd
  time?: string;      // HH:mm
  category?: string;  // FOOD | STUDY | TRANSPORT | OTHER | ...
  description?: string | null;
  paymentMethod?: string | null;
};

export function saveSchedule(courses: Course[]) {
  localStorage.setItem(DASH_KEYS.SCHEDULE, JSON.stringify(courses));
  window.dispatchEvent(new Event("dashboard:schedule-cache"));
}
export function loadSchedule(): Course[] {
  try {
    const raw = localStorage.getItem(DASH_KEYS.SCHEDULE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(DASH_KEYS.TASKS, JSON.stringify(tasks));
  window.dispatchEvent(new Event("dashboard:tasks-cache"));
}
export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(DASH_KEYS.TASKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: ExpenseLite[]) {
  localStorage.setItem(DASH_KEYS.EXPENSES, JSON.stringify(expenses));
  window.dispatchEvent(new Event("dashboard:expenses-cache"));
}
export function loadExpenses(): ExpenseLite[] {
  try {
    const raw = localStorage.getItem(DASH_KEYS.EXPENSES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
