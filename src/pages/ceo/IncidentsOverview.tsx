import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { incidents } from '@/data/mockData';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const statuses = ['All', 'Open', 'In Progress', 'Service Assigned', 'Completed', 'Closed'];

export default function IncidentsOverview() {
  const [statusFilter, setStatusFilter] = useState('All');
  const filtered = incidents.filter(i => statusFilter === 'All' || i.status === statusFilter);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Incidents Overview' }]} />
      <h1 className="text-xl font-semibold mb-5">Incidents Overview</h1>

      <div className="flex gap-1 mb-4">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1.5 text-xs rounded-md font-medium', statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Claim Ref</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicle</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Provider</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-mono font-medium">{i.claimRef}</td>
                <td className="px-4 py-3">{i.clientName}</td>
                <td className="px-4 py-3 font-mono">{i.vehicleReg}</td>
                <td className="px-4 py-3">{i.type}</td>
                <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{i.created}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.assignedProvider || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
