import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { UserResponse, ReportResponse, ReportStats, CaseStats, CaseResponse } from "@/lib/api";
import type { CreateReportData } from "./useAdminDashboard";

const EMPTY_FORM: CreateReportData = {
  name: "", email: "", phone_number: "",
  category: "property", type: "theft_other",
  title: "", description: "", location: "",
  approval_status: "pending",
};

export function useEnforcerDashboard() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [caseStats, setCaseStats] = useState<CaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newReport, setNewReport] = useState<CreateReportData>({ ...EMPTY_FORM });

  const refreshAll = useCallback(async () => {
    const results = await Promise.allSettled([
      api.reports.getAll(), api.users.getAll(),
      api.reports.getStats(), api.cases.getStats(), api.cases.getAll(),
    ]);
    const [r, u, rs, cs, c] = results.map((x, i) => {
      if (x.status === 'fulfilled') return x.value;
      if (i >= 3) return i === 3 ? { total: 0, active: 0, empty: 0 } : [];
      return i === 0 ? [] : i === 1 ? [] : null;
    });
    setReports(r as any); setUsers(u as any); setStats(rs as any);
    setCaseStats(cs as any); setCases(c as any);
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

  return {
    reports, users, cases, stats, caseStats, loading, error, actionLoading,
    createOpen, setCreateOpen, newReport, setNewReport,
    updateStatus, createCase, deleteReport, createReport, refreshAll,
  };
}
