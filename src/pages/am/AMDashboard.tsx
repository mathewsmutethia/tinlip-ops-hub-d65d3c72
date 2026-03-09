import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KPICard } from '@/components/KPICard';
import { StatusBadge } from '@/components/StatusBadge';
import { recentActivity } from '@/data/mockData';
import { ClipboardCheck, AlertTriangle, Users, ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AMDashboard() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Dashboard' }]} />
      <h1 className="text-xl font-semibold mb-5">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard title="Pending Approvals" value={12} icon={<ClipboardCheck className="h-5 w-5" />} />
        <KPICard title="Active Incidents" value={7} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPICard title="Clients This Month" value={34} icon={<Users className="h-5 w-5" />} />
        <KPICard title="SLA Breaches" value={2} icon={<ShieldAlert className="h-5 w-5" />} danger />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Quick Actions + Alerts */}
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

          {/* Alerts */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Alerts</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md bg-destructive/5 px-3 py-2 text-sm">
                <span>Vehicle KDD 456E — Insurance expired 15 days ago</span>
                <StatusBadge status="Expired" />
              </div>
              <div className="flex items-center justify-between rounded-md bg-warning/5 px-3 py-2 text-sm">
                <span>Incident INC-001 — Open for 48+ hours (SLA breach)</span>
                <StatusBadge status="Overdue" />
              </div>
              <div className="flex items-center justify-between rounded-md bg-warning/5 px-3 py-2 text-sm">
                <span>Client Ahmed Hassan — 2 vehicles with incomplete docs</span>
                <StatusBadge status="Incomplete" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground shrink-0 w-16">{a.time}</span>
                <div>
                  <p className="text-foreground">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.actor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
