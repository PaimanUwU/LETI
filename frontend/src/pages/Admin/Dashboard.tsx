import React, { useState } from 'react';
import {
  Users, FileText, Plus, MoreHorizontal, Search, Briefcase,
  TrendingUp, AlertCircle, CheckCircle2, Clock, XCircle, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { CRIME_TYPES_BY_CATEGORY } from '@/lib/constants';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import type { ReportResponse } from '@/lib/api';

const Dashboard: React.FC = () => {
  const {
    reports, users, cases, reportStats, caseStats, loading, error, actionLoading,
    createOpen, setCreateOpen, newReport, setNewReport,
    updateStatus, createCase, deleteReport, createReport, deleteUser,
  } = useAdminDashboard();

  // ── Confirmation dialog state ──────────────────────────────
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusBadge = (s: string | undefined) => {
    if (s === 'approved') return <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-700">Approved</Badge>;
    if (s === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/20 text-orange-700">Pending</Badge>;
  };

  const pendingReports = reports.filter(r => r.approval_status === 'pending');
  const statCards = [
    { title: 'Total Users', value: users.length.toString(), description: 'Platform members', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    { title: 'Active Reports', value: reportStats?.total?.toString() || '0', description: `${reportStats?.pending || 0} pending review`, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
    { title: 'Cases', value: caseStats?.total?.toString() || '0', description: `${caseStats?.open || 0} open investigations`, icon: Briefcase, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    { title: 'Rejected', value: reportStats?.rejected?.toString() || '0', description: 'Dismissed reports', icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
  ];

  const roleBadge = (user: typeof users[0]) => (
    <Badge variant={user.role === 'admin' ? 'default' : user.role === 'law_enforcer' ? 'secondary' : 'outline'}>
      {user.role === 'law_enforcer' ? 'Enforcer' : user.role === 'admin' ? 'Admin' : 'User'}
    </Badge>
  );

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">Manage your platform and monitor AI performance.</p>
        </div>
        <div className="flex items-center gap-2">
          {error && <Badge variant="destructive" className="animate-pulse">API Error: {error}</Badge>}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-2" />New Entry</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
              <form onSubmit={createReport}>
                <DialogHeader><DialogTitle>Create Report</DialogTitle><DialogDescription>Manually add a crime report.</DialogDescription></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-xs font-medium">Full Name</label><Input required value={newReport.name} onChange={e => setNewReport({...newReport, name: e.target.value})} placeholder="John Doe" /></div>
                    <div className="space-y-1"><label className="text-xs font-medium">Email</label><Input value={newReport.email} onChange={e => setNewReport({...newReport, email: e.target.value})} placeholder="john@email.com" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-xs font-medium">Phone</label><Input required value={newReport.phone_number} onChange={e => setNewReport({...newReport, phone_number: e.target.value})} placeholder="012-3456789" /></div>
                    <div className="space-y-1"><label className="text-xs font-medium">Status</label>
                      <select value={newReport.approval_status} onChange={e => setNewReport({...newReport, approval_status: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                        <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-xs font-medium">Category</label>
                      <select value={newReport.category} onChange={e => setNewReport({...newReport, category: e.target.value, type: CRIME_TYPES_BY_CATEGORY[e.target.value][0].value})} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                        <option value="assault">Assault</option><option value="property">Property</option>
                      </select>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-medium">Crime Type</label>
                      <select value={newReport.type} onChange={e => setNewReport({...newReport, type: e.target.value})} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                        {CRIME_TYPES_BY_CATEGORY[newReport.category]?.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1"><label className="text-xs font-medium">Title</label><Input required value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} placeholder="Brief summary" /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Location</label><Input required value={newReport.location} onChange={e => setNewReport({...newReport, location: e.target.value})} placeholder="e.g. Subang Jaya" /></div>
                  <div className="space-y-1"><label className="text-xs font-medium">Description</label><textarea required rows={3} value={newReport.description} onChange={e => setNewReport({...newReport, description: e.target.value})} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Describe..." /></div>
                </div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" disabled={actionLoading === -1}>{actionLoading === -1 ? 'Creating...' : 'Create Report'}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(s => (
          <Card key={s.title}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{s.title}</CardTitle><div className={`${s.bg} p-2 rounded-md`}><s.icon className={`h-4 w-4 ${s.color}`} /></div></CardHeader><CardContent><div className="text-2xl font-bold">{s.value}</div><p className="text-xs text-muted-foreground mt-1">{s.description}</p></CardContent></Card>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <Tabs defaultValue="reports" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>
          <div className="relative w-64"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-8" /></div>
        </div>

        {/* ── Reports Tab ──────────────────────────────────── */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Recent Crime Reports</CardTitle><CardDescription>View and manage community reports.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {reports.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No reports found.</TableCell></TableRow> :
                    reports.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">REP-{r.id}</TableCell><TableCell>{r.title}</TableCell><TableCell>{r.location}</TableCell><TableCell>{statusBadge(r.approval_status)}</TableCell>
                        <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {r.approval_status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => openConfirm(r, 'approved')} disabled={actionLoading === r.id}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => openConfirm(r, 'rejected')} disabled={actionLoading === r.id}><XCircle className="h-3.5 w-3.5" /></Button>
                              </>
                            )}
                            <Button size="sm" variant="ghost" className="h-8 text-red-500 hover:text-red-700" onClick={() => { if (confirm("Delete?")) deleteReport(r.id); }} disabled={actionLoading === r.id}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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

        {/* ── Users Tab ────────────────────────────────────── */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>User Management</CardTitle><CardDescription>Manage community members and administrators.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found.</TableCell></TableRow> :
                    users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.id}</TableCell><TableCell>{u.email}</TableCell><TableCell>{roleBadge(u)}</TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit profile</DropdownMenuItem><DropdownMenuItem>Reset password</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={() => deleteUser(u.id)}>Delete User</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AI Tab ───────────────────────────────────────── */}
        <TabsContent value="ai" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4"><CardHeader><CardTitle>AI Prediction Trends</CardTitle><CardDescription>Historical accuracy and upcoming predictions.</CardDescription></CardHeader><CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg m-6 mt-0"><div className="text-center"><TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground">Prediction Chart Visualization</p></div></CardContent></Card>
            <Card className="col-span-3"><CardHeader><CardTitle>Model Performance</CardTitle><CardDescription>Current active model stats.</CardDescription></CardHeader><CardContent className="space-y-6"><div className="space-y-2"><div className="flex items-center justify-between text-sm"><span>Inference Speed</span><span className="font-bold">24ms</span></div><div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-primary w-[85%]"></div></div></div><div className="space-y-2"><div className="flex items-center justify-between text-sm"><span>Model Confidence</span><span className="font-bold">92.4%</span></div><div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[92%]"></div></div></div><div className="pt-4 space-y-3"><div className="flex items-center gap-3 text-sm"><AlertCircle className="h-4 w-4 text-orange-500" /><span>3 low-confidence reports flagged for review</span></div><div className="flex items-center gap-3 text-sm"><Clock className="h-4 w-4 text-blue-500" /><span>Last retrained 2 days ago</span></div></div><Button className="w-full mt-4" variant="outline">Trigger Retraining</Button></CardContent></Card>
          </div>
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
                <div><span className="font-medium">Report ID:</span> REP-{confirmReport.id}</div>
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
                  <p className="text-sm font-medium">Add to case:</p>
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
