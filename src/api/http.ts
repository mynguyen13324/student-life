// src/api/http.ts
const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

const LS = { AT: "accessToken", RT: "refreshToken", USER: "user" };

const getAT = () => localStorage.getItem(LS.AT);
const getRT = () => localStorage.getItem(LS.RT);
const setAT = (t: string) => localStorage.setItem(LS.AT, t);
const setRT = (t: string) => localStorage.setItem(LS.RT, t);

export function logout(reason?: string) {
  [LS.AT, LS.RT, LS.USER].forEach(k => localStorage.removeItem(k));
  if (reason) console.warn("[logout]", reason);
  window.location.assign("/login");
}

const SKIP_AUTH = [/\/users\/login$/, /\/users\/refresh$/, /\/users\/register$/];

function buildUrl(input: string) {
  if (input.startsWith("http")) return input;
  const path = input.startsWith("/") ? input : `/${input}`;
  return `${API_BASE}${path}`;
}
function shouldSkipAuth(url: string) {
  return SKIP_AUTH.some((re) => re.test(url));
}

// — refresh queue —
let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const rt = getRT();
  if (!rt) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE}/users/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  });
  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();
  if (!data?.accessToken) throw new Error("No access token from refresh");
  setAT(data.accessToken);
  if (data.refreshToken) setRT(data.refreshToken);
}

export async function ensureAuthOnBoot() {
  const hasAT = !!getAT();
  const hasRT = !!getRT();
  if (!hasAT && hasRT) {
    await doRefresh().catch(() => logout("refresh on boot failed"));
  }
}

async function ensureRefreshedOnce() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function authFetch(input: string, init: RequestInit = {}) {
  const url = buildUrl(input);
  const headers = new Headers(init.headers || {});
  if (!shouldSkipAuth(url)) {
    const at = getAT();
    if (at) headers.set("Authorization", `Bearer ${at}`);
  }
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(url, { ...init, headers });
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const exec = async () => {
    const res = await authFetch(path, init);
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch {}
    return { res, json };
  };

  let { res, json } = await exec();

  if (res.status === 401 && !shouldSkipAuth(buildUrl(path))) {
    try {
      await ensureRefreshedOnce();
      ({ res, json } = await exec());
    } catch {
      logout("refresh failed");
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }

  if (!res.ok) {
    const msg = json?.message || json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return (json?.data ?? json) as T;
}
