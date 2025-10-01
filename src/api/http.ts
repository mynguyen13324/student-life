// src/lib/http.ts
// Wrapper fetch tự gắn Authorization + tự refresh 401 (serialize) rồi retry 1 lần

const API_BASE = "/api"; // Vite proxy: /api -> BE

const getAT = () => localStorage.getItem("accessToken");
const getRT = () => localStorage.getItem("refreshToken");
const setAT = (t: string) => localStorage.setItem("accessToken", t);
const setRT = (t: string) => localStorage.setItem("refreshToken", t);

export function logout(reason?: string) {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  if (reason) console.warn("[logout]", reason);
  // Thêm logic chuyển hướng đến trang đăng nhập nếu cần (navigate('/login'))
}

const SKIP_AUTH = [/\/users\/login$/, /\/users\/refresh$/];

function buildUrl(input: string) {
  return input.startsWith("http") ? input : `${API_BASE}${input}`;
}

function shouldSkipAuth(url: string) {
  return SKIP_AUTH.some((re) => re.test(url));
}

// ---- refresh queue: tránh gọi nhiều lần song song
let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const rt = getRT();
  if (!rt) throw new Error("No refresh token"); // LỖI ĐÃ ĐƯỢC SỬA: Bỏ từ khóa 'new' thứ hai

  const res = await fetch(`${API_BASE}/users/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // KHÔNG gửi Authorization
    body: JSON.stringify({ refreshToken: rt }),
  });

  if (!res.ok) throw new Error("Refresh failed");
  const data = (await res.json()) as { accessToken: string; refreshToken?: string };

  if (!data?.accessToken) throw new Error("No access token from refresh");
  setAT(data.accessToken);
  if (data.refreshToken) setRT(data.refreshToken);
}

async function ensureRefreshedOnce() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ---- fetch có gắn Authorization (trừ các path SKIP_AUTH)
export async function authFetch(input: string, init: RequestInit = {}) {
  const url = buildUrl(input);
  const headers = new Headers(init.headers || {});
  if (!shouldSkipAuth(url)) {
    const at = getAT();
    if (at) headers.set("Authorization", `Bearer ${at}`);
  }
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  // Nếu BE dùng cookie session, bật dòng dưới:
  // return fetch(url, { ...init, headers, credentials: "include" });

  return fetch(url, { ...init, headers });
}

// ---- API helper: auto refresh 401 và retry đúng 1 lần
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const exec = async () => {
    const res = await authFetch(path, init);
    const text = await res.text();
    // Bắt lỗi JSON.parse khi body rỗng hoặc không phải JSON (ví dụ: 204 No Content)
    let json = null;
    try {
        json = text ? JSON.parse(text) : null;
    } catch (e) {
        // Bỏ qua lỗi parse nếu text rỗng hoặc không phải json
        if (text) console.error("Lỗi phân tích JSON:", e, "Text:", text);
    }
    return { res, json };
  };

  try {
    let { res, json } = await exec();

    if (res.status === 401 && !shouldSkipAuth(buildUrl(path))) {
      // chỉ refresh khi không phải login/refresh
      try {
        await ensureRefreshedOnce();
      } catch {
        logout("Refresh failed");
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
      // retry sau khi refresh
      ({ res, json } = await exec());
    }

    if (!res.ok) {
      const msg = json?.message || json?.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    if (json && "success" in json && json.success === false) {
      throw new Error(json.message || "Request failed");
    }
    return (json?.data ?? json) as T;
  } catch (e: any) {
    // network / parse error
    if (e?.name === "TypeError" && e?.message?.includes("Failed to fetch")) {
      throw new Error("Không thể kết nối máy chủ. Vui lòng kiểm tra mạng hoặc API_BASE.");
    }
    throw e;
  }
}

// Tiện ích ngắn gọn
export async function getJSON<T>(url: string): Promise<T> {
  return apiRequest<T>(url);
}
export async function postJSON<T>(url: string, body: unknown): Promise<T> {
  return apiRequest<T>(url, { method: "POST", body: JSON.stringify(body) });
}
