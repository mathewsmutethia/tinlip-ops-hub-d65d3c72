import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';

type Incident = {
  id: string;
  claim_code: string;
  type: string;
  status: string;
  created_at: string;
  clients: { name: string } | null;
  vehicles: { registration: string } | null;
};

export default function ClaimsPayoutsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Claims & Payouts' }]} />
      <h1 className="text-xl font-semibold mb-5">Claims & Payouts</h1>

      <div className="rounded-lg border bg-card overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : incidents.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No claims recorded yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Claim Code</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicle</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(c => (
                <tr key={c.id} className="border-b hover:bg-table-hover">
                  <td className="px-4 py-3 font-mono font-medium text-primary">{c.claim_code}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3">{c.clients?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-mono">{c.vehicles?.registration ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString('en-KE')}
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
