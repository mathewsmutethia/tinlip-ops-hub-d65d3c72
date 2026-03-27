import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type Incident = {
  id: string;
  claim_code: string;
  type: string;
  status: string;
  created_at: string;
  clients: { name: string } | null;
  vehicles: { registration: string } | null;
};

const statuses = ['All', 'open', 'in_progress', 'completed', 'closed'];

export default function IncidentsOverview() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    supabase
      .from('incidents')
      .select('id, claim_code, type, status, created_at, clients(name), vehicles(registration)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setIncidents((data as Incident[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = statusFilter === 'All' ? incidents : incidents.filter(i => i.status === statusFilter);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Incidents Overview' }]} />
      <h1 className="text-xl font-semibold mb-5">Incidents Overview</h1>

      <div className="flex gap-1 mb-4">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 text-xs rounded-md font-medium', statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}
          >
            {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No incidents found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Claim Code</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicle</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i.id} className="border-b hover:bg-table-hover">
                  <td className="px-4 py-3 font-mono font-medium">{i.claim_code}</td>
                  <td className="px-4 py-3">{i.clients?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-mono">{i.vehicles?.registration ?? '—'}</td>
                  <td className="px-4 py-3">{i.type}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {new Date(i.created_at).toLocaleDateString('en-KE')}
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
