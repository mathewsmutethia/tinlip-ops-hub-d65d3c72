import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KPICard } from '@/components/KPICard';
import { supabase } from '@/integrations/supabase/client';
import { ClipboardCheck, AlertTriangle, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';

type AuditLog = Tables<'audit_logs'>;

export default function AMDashboard() {
  const [pendingClientsCount, setPendingClientsCount] = useState(0);
  const [activeIncidentsCount, setActiveIncidentsCount] = useState(0);
  const [totalClientsCount, setTotalClientsCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(8),
    ]).then(([pending, activeInc, total, logs]) => {
      setPendingClientsCount(pending.count ?? 0);
      setActiveIncidentsCount(activeInc.count ?? 0);
      setTotalClientsCount(total.count ?? 0);
      setRecentLogs(logs.data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Dashboard' }]} />
      <h1 className="text-xl font-semibold mb-5">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <KPICard title="Pending Approvals" value={loading ? '—' : pendingClientsCount} icon={<ClipboardCheck className="h-5 w-5" />} />
        <KPICard title="Active Incidents" value={loading ? '—' : activeIncidentsCount} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPICard title="Total Clients" value={loading ? '—' : totalClientsCount} icon={<Users className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="flex gap-3">
            <Link to="/approvals">
              <Button size="sm">
                Review Approvals <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link to="/incidents">
              <Button variant="outline" size="sm">
                View Open Incidents <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {!loading && recentLogs.length === 0 && <p className="text-sm text-muted-foreground">No recent activity</p>}
            {recentLogs.map(log => (
              <div key={log.id} className="flex gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground shrink-0 w-20">
                  {log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
                <div>
                  <p className="text-foreground">{log.action ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{log.entity_type ?? ''} {log.entity_id ? `· ${log.entity_id.slice(0, 8)}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
