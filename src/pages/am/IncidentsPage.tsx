import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type Incident = Tables<'incidents'> & {
  clients: { name: string | null } | null;
  vehicles: { registration: string } | null;
};

const statuses = ['All', 'open', 'in_progress', 'completed', 'closed'];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    supabase
      .from('incidents')
      .select('*, clients(name), vehicles(registration)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setIncidents((data as Incident[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = incidents.filter(i => statusFilter === 'All' || i.status === statusFilter);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Incidents' }]} />
      <h1 className="text-xl font-semibold mb-5">Incidents</h1>

      <div className="flex gap-1 mb-4">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1.5 text-xs rounded-md font-medium capitalize', statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Claim Code</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicle</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
            )}
            {!loading && filtered.map(i => (
              <tr key={i.id} className="border-b hover:bg-table-hover cursor-pointer">
                <td className="px-4 py-3 font-mono font-medium">
                  <Link to={`/incidents/${i.id}`} className="text-primary hover:underline">{i.claim_code ?? i.id.slice(0, 8)}</Link>
                </td>
                <td className="px-4 py-3">{i.clients?.name ?? '—'}</td>
                <td className="px-4 py-3 font-mono">{i.vehicles?.registration ?? '—'}</td>
                <td className="px-4 py-3">{i.type ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{i.location ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={i.status ?? 'unknown'} /></td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{i.created_at ? new Date(i.created_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No incidents found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
