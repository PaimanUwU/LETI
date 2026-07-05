import React, { useState } from 'react';
import {
  FileText, Clock, CheckCircle2, XCircle, Search,
  Loader2, Cpu, Plus, Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { CRIME_TYPES_BY_CATEGORY } from '@/lib/constants';
import { useEnforcerDashboard } from '@/hooks/useEnforcerDashboard';
import type { ReportResponse } from '@/lib/api';

const Dashboard: React.FC = () => {
  const {
    reports, users, cases, stats, caseStats, loading, error, actionLoading,
    createOpen, setCreateOpen, newReport, setNewReport,
    updateStatus, createCase, deleteReport, createReport,
  } = useEnforcerDashboard();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmReport, setConfirmReport] = useState<ReportResponse | null>(null);
  const [confirmAction, setConfirmAction] = useState<'approved' | 'rejected'>('approved');
  const [confirmMode, setConfirmMode] = useState<'new' | 'existing'>('new');
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [existingCaseId, setExistingCaseId] = useState<number | null>(null);

  const openConfirm = (r: ReportResponse, action: 'approved' | 'rejected') => {
    setConfirmReport(r); setConfirmAction(action); setConfirmOpen(true);
    setConfirmMode('new'); setExistingCaseId(null);
    setNewCaseTitle(action === 'approved' ? (r.title || '') : '');
  };

  const handleConfirm = async () => {
    if (!confirmReport) return;
    if (confirmAction === 'approved') {
      if (confirmMode === 'new' && newCaseTitle.trim()) {
        const c = await createCase(newCaseTitle.trim(), confirmReport.description || '');
        await updateStatus(confirmReport.id, 'approved', c.id);
      } else if (confirmMode === 'existing' && existingCaseId) {
        await updateStatus(confirmReport.id, 'approved', existingCaseId);
      } else {
        await updateStatus(confirmReport.id, 'approved');
      }
    } else {
      await updateStatus(confirmReport.id, 'rejected');
    }
    setConfirmOpen(false); setConfirmReport(null);
  };

  const handleApproveAll = async () => {
    const pending = reports.filter(r => r.approval_status === 'pending');
    for (const r of pending) await updateStatus(r.id, 'approved');
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getUserEmail = (email?: string) => {
    const u = users.find(x => x.email === email);
    return u ? u.email : (email || 'Anonymous');
  };

  const statusBadge = (s: string | undefined) => {
    if (s === 'approved') return <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-700">Approved</Badge>;
    if (s === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/20 text-orange-700">Pending</Badge>;
  };

  const pendingReports = reports.filter(r => r.approval_status === 'pending');
  const statCards = [
    { title: 'Total Reports', value: stats?.total?.toString() || '0', description: 'All submitted reports', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    { title: 'Pending', value: stats?.pending?.toString() || '0', description: 'Awaiting review', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
    { title: 'Cases', value: caseStats?.total?.toString() || '0', description: `${caseStats?.active || 0} with reports`, icon: Briefcase, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    { title: 'Rejected', value: stats?.rejected?.toString() || '0', description: 'Dismissed reports', icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
  ];

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex justify-between items-start">
        <div><h2 className="text-3xl font-bold tracking-tight">Enforcer Dashboard</h2><p className="text-muted-foreground">Review and manage crime reports from the community.</p></div>
        <div className="flex items-center gap-2">
          {error && <Badge variant="destructive" className="animate-pulse">API Error: {error}</Badge>}
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(s => (<Card key={s.title}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{s.title}</CardTitle><div className={`${s.bg} p-2 rounded-md`}><s.icon className={`h-4 w-4 ${s.color}`} /></div></CardHeader><CardContent><div className="text-2xl font-bold">{s.value}</div><p className="text-xs text-muted-foreground mt-1">{s.description}</p></CardContent></Card>))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <Tabs defaultValue="reports" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>
          <div className="relative w-64"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search reports..." className="pl-8" /></div>
        </div>

        {/* ── Reports Tab ──────────────────────────────────── */}
        <TabsContent value="reports" className="space-y-4">
          {pendingReports.length > 0 && (
            <Card className="border-orange-200 dark:border-orange-900/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-orange-500" /><CardTitle>Pending Review</CardTitle><Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 border-orange-200">{pendingReports.length} new</Badge></div>
                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={handleApproveAll}><CheckCircle2 className="h-4 w-4 mr-1" />Approve All Pending</Button>
                </div>
                <CardDescription>Reports that need your immediate attention.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Submitted By</TableHead><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {pendingReports.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">#{r.id}</TableCell>
                        <TableCell><div><span className="text-sm font-medium">{r.name}</span><span className="text-xs text-muted-foreground block">{getUserEmail(r.email)}</span></div></TableCell>
                        <TableCell>{r.title}</TableCell>
                        <TableCell><Badge variant="outline">{r.type || 'other'}</Badge></TableCell>
                        <TableCell className="max-w-[150px] truncate">{r.location}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => openConfirm(r, 'approved')} disabled={actionLoading === r.id}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Approve</Button>
                            <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => openConfirm(r, 'rejected')} disabled={actionLoading === r.id}><XCircle className="h-3.5 w-3.5 mr-1" />Reject</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Cases Tab ────────────────────────────────────── */}
        <TabsContent value="cases" className="space-y-4">
          <Card><CardHeader><CardTitle>Investigation Cases</CardTitle><CardDescription>Cases created from approved reports.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Case ID</TableHead><TableHead>Title</TableHead><TableHead>Reports</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
                <TableBody>
                  {cases.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No cases yet. Approve a report to create one.</TableCell></TableRow> :
                    cases.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">CASE-{c.id}</TableCell>
                        <TableCell>{c.title}</TableCell>
                        <TableCell><Badge variant="secondary">{c.report_count} report{c.report_count !== 1 ? 's' : ''}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AI Tab ───────────────────────────────────────── */}
        <TabsContent value="ai" className="space-y-4">
          <Card><CardHeader><CardTitle>AI Insights</CardTitle><CardDescription>ML-powered predictions.</CardDescription></CardHeader>
            <CardContent><div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30"><div className="text-center space-y-2"><Cpu className="h-8 w-8 text-muted-foreground mx-auto" /><p className="text-sm text-muted-foreground">AI insights and predictions are available here.</p><Button variant="outline" size="sm" asChild><a href="/enforcer/ai">Open AI Dashboard</a></Button></div></div></CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* ── Approve/Reject Confirmation Dialog ──────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{confirmAction === 'approved' ? 'Approve Report' : 'Reject Report'}</DialogTitle>
            <DialogDescription>Review the details before confirming.</DialogDescription>
          </DialogHeader>
          {confirmReport && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Report ID:</span> #{confirmReport.id}</div>
                <div><span className="font-medium">Type:</span> {confirmReport.type}</div>
                <div><span className="font-medium">Submitter:</span> {confirmReport.name}</div>
                <div><span className="font-medium">Phone:</span> {confirmReport.phone_number}</div>
              </div>
              <div className="text-sm"><span className="font-medium">Title:</span> {confirmReport.title}</div>
              <div className="text-sm"><span className="font-medium">Location:</span> {confirmReport.location}</div>
              <div className="text-sm"><span className="font-medium">Description:</span></div>
              <div className="p-3 bg-muted/50 rounded-md text-sm max-h-[80px] overflow-y-auto">{confirmReport.description}</div>

              {confirmAction === 'approved' && (
                <div className="space-y-3 border-t pt-3">
                  <Label className="text-sm font-medium">Add to case:</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="caseMode" checked={confirmMode === 'new'} onChange={() => setConfirmMode('new')} />
                      <span className="text-sm">Create new case</span>
                    </label>
                    {confirmMode === 'new' && (
                      <Input placeholder="Case title (e.g. USJ 6 burglary spree)" value={newCaseTitle} onChange={e => setNewCaseTitle(e.target.value)} className="ml-6" />
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="caseMode" checked={confirmMode === 'existing'} onChange={() => setConfirmMode('existing')} />
                      <span className="text-sm">Add to existing case</span>
                    </label>
                    {confirmMode === 'existing' && (
                      <div className="ml-6 border rounded-md max-h-[120px] overflow-y-auto">
                        {cases.map(c => (
                          <label key={c.id} className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted text-sm ${existingCaseId === c.id ? 'bg-muted' : ''}`}>
                            <div className="flex items-center gap-2">
                              <input type="radio" name="caseId" checked={existingCaseId === c.id} onChange={() => setExistingCaseId(c.id)} />
                              <span>CASE-{c.id}: {c.title}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{c.report_count} rpt</Badge>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant={confirmAction === 'approved' ? 'default' : 'destructive'} onClick={handleConfirm} disabled={actionLoading === confirmReport?.id}>
              {actionLoading === confirmReport?.id ? 'Processing...' : confirmAction === 'approved' ? 'Confirm Approve' : 'Confirm Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
