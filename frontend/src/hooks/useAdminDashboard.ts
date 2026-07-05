import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { UserResponse, ReportResponse, DashboardStats, ReportStats, CaseStats, CaseResponse } from "@/lib/api";

export interface CreateReportData {
  name: string; email: string; phone_number: string;
  category: string; type: string; title: string;
  description: string; location: string; approval_status: string;
}

const EMPTY_FORM: CreateReportData = {
  name: "", email: "", phone_number: "",
  category: "property", type: "theft_other",
  title: "", description: "", location: "",
  approval_status: "pending",
};

export function useAdminDashboard() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [caseStats, setCaseStats] = useState<CaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newReport, setNewReport] = useState<CreateReportData>({ ...EMPTY_FORM });

  const refreshAll = useCallback(async () => {
    const results = await Promise.allSettled([
      api.reports.getAll(), api.users.getAll(), api.dashboard.getStats(),
      api.reports.getStats(), api.cases.getStats(), api.cases.getAll(),
    ]);
    const [r, u, s, rs, cs, c] = results.map((x, i) => {
      if (x.status === 'fulfilled') return x.value;
      // Fallback for cases endpoints
      if (i >= 4) return i === 4 ? { total: 0, active: 0, empty: 0 } : [];
      return i === 0 ? [] : i === 1 ? [] : null;
    });
    setReports(r as any); setUsers(u as any); setStatsData(s as any);
    setReportStats(rs as any); setCaseStats(cs as any); setCases(c as any);
  }, []);

  useEffect(() => { refreshAll().then(() => setLoading(false)); }, [refreshAll]);

  const updateStatus = useCallback(async (id: number, status: string, caseId?: number) => {
    setActionLoading(id);
    try {
      await api.reports.updateStatus(id, status, caseId);
      await refreshAll();
    } catch (err: any) { alert(err.message); }
    finally { setActionLoading(null); }
  }, [refreshAll]);

  const createCase = useCallback(async (title: string, desc: string) => {
    return await api.cases.create({ title, description: desc });
  }, []);

  const deleteReport = useCallback(async (id: number) => {
    setActionLoading(id);
    try { await api.reports.delete(id); await refreshAll(); }
    catch (err: any) { alert(err.message); }
    finally { setActionLoading(null); }
  }, [refreshAll]);

  const createReport = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(-1);
    try {
      await api.reports.create(newReport);
      setCreateOpen(false);
      setNewReport({ ...EMPTY_FORM });
      await refreshAll();
    } catch (err: any) { alert(err.message); }
    finally { setActionLoading(null); }
  }, [newReport, refreshAll]);

  const deleteUser = useCallback(async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try { await api.users.delete(id); setUsers(prev => prev.filter(u => u.id !== id)); }
    catch (err: any) { alert(err.message); }
  }, []);

  return {
    reports, users, cases, statsData, reportStats, caseStats, loading, error, actionLoading,
    createOpen, setCreateOpen, newReport, setNewReport,
    updateStatus, createCase, deleteReport, createReport, deleteUser, refreshAll,
  };
}
