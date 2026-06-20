import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Client = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  created_at: string | null;
};

const statuses = ['All', 'active', 'pending_approval', 'profile_incomplete', 'rejected'];

function statusLabel(s: string): string {
  if (s === 'pending_approval') return 'Pending';
  if (s === 'profile_incomplete') return 'Incomplete';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ClientsOverview() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    supabase
      .from('clients')
      .select('id, name, email, phone, status, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) { toast.error('Failed to load clients'); }
        else { setClients((data as Client[]) ?? []); }
        setLoading(false);
      });
  }, []);

  const filtered = statusFilter === 'All' ? clients : clients.filter(c => c.status === statusFilter);

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    const rows = [
      ['Name', 'Email', 'Phone', 'Status', 'Joined'],
      ...filtered.map(c => [
        c.name ?? '',
        c.email ?? '',
        c.phone ?? '',
        c.status ?? '',
        c.created_at ? new Date(c.created_at).toLocaleDateString('en-KE') : '',
      ]),
    ];
    const content = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tinlip-clients-${date}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Clients Overview' }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Clients Overview</h1>
        <Button size="sm" variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export</Button>
      </div>

      <div className="flex gap-1 mb-4">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {statusLabel(s)}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No clients found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b hover:bg-table-hover">
                  <td className="px-4 py-3 font-medium">{c.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status ?? 'unknown'} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('en-KE') : '—'}
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
