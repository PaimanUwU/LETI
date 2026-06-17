const BASE_URL = "http://localhost:8000";

// --- Types ---

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface ReportResponse {
  id: number;
  name: string;
  phone_number: string;
  title: string;
  description: string;
  location: string;
  created_at: string;
  type?: string;
  approval_status?: string;
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
    login: (data: any) => apiFetch<Token>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
    signup: (data: any) => apiFetch<UserResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  },
  users: {
    getAll: () => apiFetch<UserResponse[]>("/api/users"),
    getOne: (userId: number) => apiFetch<UserResponse>(`/api/users/${userId}`),
    delete: (userId: number) => apiFetch<void>(`/api/users/${userId}`, { method: "DELETE" }),
  },
  dashboard: {
    getStats: () => apiFetch<DashboardStats>("/api/dashboard/stats"),
    getSummary: (limit = 10) => apiFetch<any>(`/api/dashboard/summary?limit=${limit}`),
    getTopDistricts: (limit = 10) => apiFetch<any>(`/api/dashboard/top-districts?limit=${limit}`),
    getCrimeCountsByCategory: (limit = 10) => apiFetch<any>(`/api/dashboard/crime-counts-by-category?limit=${limit}`),
    getMonthlyTrends: (district?: string) => 
      apiFetch<any>(`/api/dashboard/monthly-trends${district ? `?district=${encodeURIComponent(district)}` : ""}`),
  },
  ai: {
    predict: (data: CrimePredictionInput) => apiFetch<any>("/api/ai/predict", { method: "POST", body: JSON.stringify(data) }),
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
    getAll: () => apiFetch<ReportResponse[]>("/api/reports"),
    create: (data: any) => apiFetch<ReportResponse>("/api/reports", { method: "POST", body: JSON.stringify(data) }),
    update: (reportId: number, data: any) => 
      apiFetch<ReportResponse>(`/api/reports/${reportId}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  health: {
    check: () => apiFetch<any>("/health"),
  }
};
