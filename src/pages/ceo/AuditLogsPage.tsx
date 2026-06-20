import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type AuditLog = Pick<Tables<'audit_logs'>, 'id' | 'action' | 'entity_type' | 'entity_id' | 'user_id' | 'created_at'>;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select('id, action, entity_type, entity_id, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) { toast.error('Failed to load audit logs'); }
        else { setLogs((data as AuditLog[]) ?? []); }
        setLoading(false);
      });
  }, []);

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const rows = [
      ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User ID'],
      ...logs.map(l => [
        l.created_at ? new Date(l.created_at).toLocaleString('en-KE') : '',
        l.action ?? '',
        l.entity_type ?? '',
        l.entity_id ?? '',
        l.user_id ?? '',
      ]),
    ];
    const content = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tinlip-audit-${date}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Audit Logs' }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Audit Logs</h1>
        <Button size="sm" variant="outline" onClick={handleExport} disabled={logs.length === 0}><Download className="h-4 w-4 mr-1" /> Export</Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No audit logs recorded yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entity Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b hover:bg-table-hover">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {l.created_at ? new Date(l.created_at).toLocaleString('en-KE') : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {l.user_id ? l.user_id.slice(0, 8) + '…' : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium">{l.action ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.entity_type ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {l.entity_id ? l.entity_id.slice(0, 8) + '…' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
