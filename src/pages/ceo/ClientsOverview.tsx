import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { clients } from '@/data/mockData';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ClientsOverview() {
  const [cohortFilter, setCohortFilter] = useState('All');
  const cohorts = ['All', 'Active', 'Dormant', 'Prospects', 'Waiting Period'];
  const filtered = clients.filter(c => cohortFilter === 'All' || c.cohort === cohortFilter);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Clients Overview' }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Clients Overview</h1>
        <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> Export</Button>
      </div>

      <div className="flex gap-1 mb-4">
        {cohorts.map(c => (
          <button key={c} onClick={() => setCohortFilter(c)} className={`px-3 py-1.5 text-xs rounded-md font-medium ${cohortFilter === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicles</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cohort</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Coverage</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 font-mono">{c.vehicles}</td>
                <td className="px-4 py-3"><StatusBadge status={c.cohort} /></td>
                <td className="px-4 py-3"><StatusBadge status={c.coverageStatus} /></td>
                <td className="px-4 py-3 text-muted-foreground">{c.joinedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
