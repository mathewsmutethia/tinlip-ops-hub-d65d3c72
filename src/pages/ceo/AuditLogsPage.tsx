import { useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { auditLogs } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function AuditLogsPage() {
  const [roleFilter, setRoleFilter] = useState('All');
  const roles = ['All', 'Account Manager', 'Finance'];
  const filtered = auditLogs.filter(l => roleFilter === 'All' || l.role === roleFilter);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Audit Logs' }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Audit Logs</h1>
        <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> Export</Button>
      </div>

      <div className="flex gap-1 mb-4">
        {roles.map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 text-xs rounded-md font-medium ${roleFilter === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {r}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actor</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entity</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.timestamp}</td>
                <td className="px-4 py-3 font-medium">{l.actor}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.role}</td>
                <td className="px-4 py-3">{l.action}</td>
                <td className="px-4 py-3 font-mono text-xs">{l.entity}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
