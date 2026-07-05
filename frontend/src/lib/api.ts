const BASE_URL = "http://localhost:8000";

// --- Types ---

export interface Token {
  access_token: string;
  token_type: string;
  role?: string;
  is_admin?: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  is_admin: boolean;
  role?: string;
  created_at: string;
}

export interface ReportResponse {
  id: number;
  name: string;
  email?: string;
  phone_number: string;
  category?: string;
  title: string;
  description: string;
  location: string;
  created_at: string;
  type?: string;
  approval_status?: string;
}

export interface ReportStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface CaseResponse {
  id: number;
  title: string;
  description?: string;
  assigned_to?: number;
  notes?: string;
  report_count: number;
  created_at: string;
}

export interface CaseStats {
  total: number;
  active: number;
  empty: number;
}

export interface DashboardStats {
  total_cases?: number;
  monthly_trend_pct?: number;
  affected_areas?: number;
  resolved_cases?: number;
  [key: string]: any;
}

export interface CrimePredictionInput {
  district: string;
  category: string;
  type: string;
  year: number;
  month: number;
}

// --- Helper ---

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail 
      ? (typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail))
      : `API Error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

// --- API Functions ---

export const api = {
  auth: {
    login: (data: any) =>
      apiFetch<Token>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    signup: (data: any) =>
      apiFetch<UserResponse>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  users: {
    getAll: () => apiFetch<UserResponse[]>("/api/users"),
    getOne: (userId: number) => apiFetch<UserResponse>(`/api/users/${userId}`),
    delete: (userId: number) =>
      apiFetch<void>(`/api/users/${userId}`, { method: "DELETE" }),
  },
  dashboard: {
    getStats: () => apiFetch<DashboardStats>("/api/dashboard/stats"),
    getSummary: (limit = 10) =>
      apiFetch<any>(`/api/dashboard/summary?limit=${limit}`),
    getTopDistricts: (limit = 10) =>
      apiFetch<any>(`/api/dashboard/top-districts?limit=${limit}`),
    getCrimeCountsByCategory: (limit = 10) =>
      apiFetch<any>(`/api/dashboard/crime-counts-by-category?limit=${limit}`),
    getMonthlyTrends: (district?: string) =>
      apiFetch<any>(
        `/api/dashboard/monthly-trends${district ? `?district=${encodeURIComponent(district)}` : ""}`,
      ),
  },
  ai: {
    predict: (data: CrimePredictionInput) =>
      apiFetch<any>("/api/ai/predict", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getHeatmap: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiFetch<any>(`/api/ai/heatmap${query ? `?${query}` : ""}`);
    },
    getHeatmapPredictions: (params: any = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiFetch<any>(`/api/ai/heatmap_predictions${query ? `?${query}` : ""}`);
    },
  },
  reports: {
    getAll: (params?: { status?: string }) => {
      const query = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
      return apiFetch<ReportResponse[]>(`/api/reports${query}`);
    },
    getStats: () => apiFetch<ReportStats>("/api/reports/stats"),
    create: (data: any) => apiFetch<ReportResponse>("/api/reports/submit", { method: "POST", body: JSON.stringify(data) }),
    update: (reportId: number, data: any) =>
      apiFetch<ReportResponse>(`/api/reports/${reportId}`, { method: "PATCH", body: JSON.stringify(data) }),
    updateStatus: (reportId: number, approvalStatus: string, caseId?: number) =>
      apiFetch<ReportResponse>(`/api/reports/${reportId}/status`, { method: "PATCH", body: JSON.stringify({ approval_status: approvalStatus, case_id: caseId ?? null }) }),
    delete: (reportId: number) => apiFetch<void>(`/api/reports/${reportId}`, { method: "DELETE" }),
  },
  cases: {
    getAll: () => apiFetch<CaseResponse[]>("/api/cases"),
    getStats: () => apiFetch<CaseStats>("/api/cases/stats"),
    getOne: (id: number) => apiFetch<any>(`/api/cases/${id}`),
    create: (data: { title: string; description?: string }) =>
      apiFetch<CaseResponse>("/api/cases", { method: "POST", body: JSON.stringify(data) }),
    linkReport: (caseId: number, reportId: number) =>
      apiFetch<any>(`/api/cases/${caseId}/link/${reportId}`, { method: "POST" }),
  },
  health: {
    check: () => apiFetch<any>("/health"),
  }
};
