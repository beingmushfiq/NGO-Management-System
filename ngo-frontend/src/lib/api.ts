// ============================================================
// NGO SYSTEM: RESTful API Client with Live/Demo Fallback
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    currentPage?: number;
    lastPage?: number;
    total?: number;
  };
  code?: string;
}

class ApiError extends Error {
  code?: string;
  status: number;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Token storage helpers
export const getAuthToken = (): string | null => localStorage.getItem("ngo_token");
export const setAuthToken = (token: string): void => localStorage.setItem("ngo_token", token);
export const clearAuthToken = (): void => localStorage.removeItem("ngo_token");

// Mode storage (live vs demo)
export const getApiMode = (): "live" | "demo" => {
  return (localStorage.getItem("ngo_api_mode") as "live" | "demo") || "live";
};
export const setApiMode = (mode: "live" | "demo"): void => {
  localStorage.setItem("ngo_api_mode", mode);
};

// Generic fetch wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json().catch(() => ({
      success: response.ok,
      message: response.statusText,
      data: null as any,
    }));

    if (!response.ok) {
      const err = new ApiError(data.message || "An API error occurred", response.status, data.code);
      try {
        const { useAuditStore } = await import("@/store/audit-store");
        useAuditStore.getState().logError({
          severity: response.status >= 500 ? "CRITICAL" : "API_ERROR",
          endpoint,
          statusCode: response.status,
          errorCode: data.code || `HTTP_${response.status}`,
          message: data.message || `API request to ${endpoint} returned status ${response.status}`,
          stackTrace: `Request failed at ${url}\nPayload: ${JSON.stringify(options.body || {})}`,
        });
      } catch {}
      throw err;
    }

    return data;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Only log network errors if live mode is actively configured and online
    if (getApiMode() === "live") {
      try {
        const { useAuthStore } = await import("@/store");
        if (useAuthStore.getState().backendOnline) {
          const { useAuditStore } = await import("@/store/audit-store");
          useAuditStore.getState().logError({
            severity: "NETWORK_OFFLINE",
            endpoint,
            statusCode: 0,
            errorCode: "NETWORK_ERROR",
            message: error.message || "Failed to reach backend server.",
            stackTrace: error.stack || "Network connection failed or request timed out.",
          });
        }
      } catch {}
    }
    throw new ApiError(error.message || "Failed to connect to backend server.", 0, "NETWORK_ERROR");
  }
}

// API Health Check
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

// Exported API Services
export const api = {
  // Auth
  auth: {
    login: (phone: string, password: string) =>
      request<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      }),
    me: () => request<any>("/auth/me"),
    logout: () => request<any>("/auth/logout", { method: "POST" }),
  },

  // Dashboard
  dashboard: {
    getSummary: (branchId?: string | number | null) =>
      request<any>(`/dashboard/summary${branchId ? `?branch_id=${branchId}` : ""}`),
    getTrends: (days = 14, branchId?: string | number | null) =>
      request<any[]>(`/dashboard/trends?days=${days}${branchId ? `&branch_id=${branchId}` : ""}`),
  },

  // Customers
  customers: {
    list: (params?: { search?: string; branch_id?: string | number | null; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append("search", params.search);
      if (params?.branch_id) q.append("branch_id", String(params.branch_id));
      if (params?.status) q.append("status", params.status);
      return request<any[]>(`/customers?${q.toString()}`);
    },
    get: (id: string | number) => request<any>(`/customers/${id}`),
    create: (data: any) =>
      request<any>("/customers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string | number, data: any) =>
      request<any>(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Loans
  loans: {
    list: (params?: { search?: string; branch_id?: string | number | null; status?: string; customer_id?: string | number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append("search", params.search);
      if (params?.branch_id) q.append("branch_id", String(params.branch_id));
      if (params?.status) q.append("status", params.status);
      if (params?.customer_id) q.append("customer_id", String(params.customer_id));
      return request<any[]>(`/loans?${q.toString()}`);
    },
    get: (id: string | number) => request<any>(`/loans/${id}`),
    getSchedule: (id: string | number) => request<any>(`/loans/${id}/schedule`),
    create: (data: {
      customer_id: number | string;
      principal_amount: number;
      service_charge_pct?: number;
      duration_weeks?: number;
      start_date?: string;
      purpose?: string;
    }) =>
      request<any>("/loans", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Due Queue
  due: {
    list: (params?: { date?: string; branch_id?: string | number | null; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.date) q.append("date", params.date);
      if (params?.branch_id) q.append("branch_id", String(params.branch_id));
      if (params?.search) q.append("search", params.search);
      return request<any[]>(`/installments/due?${q.toString()}`);
    },
  },

  // Collections (Atomic)
  collections: {
    list: (params?: { date?: string; branch_id?: string | number | null; staff_id?: string | number; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.date) q.append("date", params.date);
      if (params?.branch_id) q.append("branch_id", String(params.branch_id));
      if (params?.staff_id) q.append("staff_id", String(params.staff_id));
      if (params?.search) q.append("search", params.search);
      return request<any[]>(`/collections?${q.toString()}`);
    },
    create: (data: {
      customer_id: number | string;
      loan_id?: number | string | null;
      installment_id?: number | string | null;
      loan_amount?: number | string;
      savings_amount?: number | string;
      payment_method?: string;
      payment_reference?: string;
      collection_date?: string;
      idempotency_key?: string;
    }) =>
      request<any>("/collections", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    get: (id: string | number) => request<any>(`/collections/${id}`),
    getReceipt: (id: string | number) => request<any>(`/collections/${id}/receipt`),
  },

  // Savings
  savings: {
    list: (params?: { search?: string; branch_id?: string | number | null }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append("search", params.search);
      if (params?.branch_id) q.append("branch_id", String(params.branch_id));
      return request<any[]>(`/savings?${q.toString()}`);
    },
    get: (id: string | number) => request<any>(`/savings/${id}`),
    deposit: (id: string | number, amount: number, note?: string) =>
      request<any>(`/savings/${id}/deposit`, {
        method: "POST",
        body: JSON.stringify({ amount, note }),
      }),
    withdraw: (id: string | number, amount: number, note?: string) =>
      request<any>(`/savings/${id}/withdraw`, {
        method: "POST",
        body: JSON.stringify({ amount, note }),
      }),
  },

  // Branches
  branches: {
    list: () => request<any[]>("/branches"),
    create: (data: any) =>
      request<any>("/branches", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    get: (id: string | number) => request<any>(`/branches/${id}`),
    update: (id: string | number, data: any) =>
      request<any>(`/branches/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Staff
  staff: {
    list: (params?: { search?: string; branch_id?: string | number | null; role?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append("search", params.search);
      if (params?.branch_id) q.append("branch_id", String(params.branch_id));
      if (params?.role) q.append("role", params.role);
      return request<any[]>(`/staff?${q.toString()}`);
    },
    create: (data: any) =>
      request<any>("/staff", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    get: (id: string | number) => request<any>(`/staff/${id}`),
    update: (id: string | number, data: any) =>
      request<any>(`/staff/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Reports
  reports: {
    dailyCollection: (date?: string, branchId?: string | number | null) => {
      const q = new URLSearchParams();
      if (date) q.append("date", date);
      if (branchId) q.append("branch_id", String(branchId));
      return request<any>(`/reports/daily-collection?${q.toString()}`);
    },
    loanPortfolio: (branchId?: string | number | null, status?: string) => {
      const q = new URLSearchParams();
      if (branchId) q.append("branch_id", String(branchId));
      if (status) q.append("status", status);
      return request<any>(`/reports/loan-portfolio?${q.toString()}`);
    },
    savingsLedger: (branchId?: string | number | null) => {
      const q = new URLSearchParams();
      if (branchId) q.append("branch_id", String(branchId));
      return request<any>(`/reports/savings?${q.toString()}`);
    },
    branchAudit: () => request<any[]>("/reports/branch-audit"),
  },

  // Settings
  settings: {
    get: () => request<any>("/settings"),
    update: (data: any) =>
      request<any>("/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
};
