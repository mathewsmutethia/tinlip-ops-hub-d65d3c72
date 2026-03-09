import { useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { clients } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [cohortFilter, setCohortFilter] = useState('All');
  const cohorts = ['All', 'Active', 'Dormant', 'Prospects', 'Waiting Period'];

  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesCohort = cohortFilter === 'All' || c.cohort === cohortFilter;
    return matchesSearch && matchesCohort;
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Clients' }]} />
      <h1 className="text-xl font-semibold mb-5">Clients</h1>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {cohorts.map(c => (
            <button key={c} onClick={() => setCohortFilter(c)} className={`px-3 py-1.5 text-xs rounded-md font-medium ${cohortFilter === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicles</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cohort</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Coverage</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b hover:bg-table-hover cursor-pointer">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.phone}</td>
                <td className="px-4 py-3 font-mono">{c.vehicles}</td>
                <td className="px-4 py-3"><StatusBadge status={c.cohort} /></td>
                <td className="px-4 py-3"><StatusBadge status={c.coverageStatus} /></td>
                <td className="px-4 py-3 text-muted-foreground">{c.joinedDate}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No clients found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
