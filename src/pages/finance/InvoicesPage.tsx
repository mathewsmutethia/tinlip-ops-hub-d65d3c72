import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

// Invoices are derived from payments joined with clients
type Payment = Tables<'payments'> & { clients: { name: string | null } | null };

const tabs = ['All', 'pending', 'confirmed', 'failed'];

export default function InvoicesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');

  useEffect(() => {
    supabase
      .from('payments')
      .select('*, clients(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPayments((data as Payment[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = payments.filter(p => tab === 'All' || p.status === tab);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Invoices' }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Invoices</h1>
        <Button size="sm" disabled><Plus className="h-4 w-4 mr-1" /> Generate Invoice</Button>
      </div>

      <div className="flex gap-1 mb-4 border-b">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize', tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Payment ID</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Coverage</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>}
            {!loading && filtered.map(p => (
              <tr key={p.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-mono font-medium text-primary text-xs">{p.id.slice(0, 12)}...</td>
                <td className="px-4 py-3">{p.clients?.name ?? '—'}</td>
                <td className="px-4 py-3 font-mono font-medium">KES {p.amount != null ? p.amount.toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {p.coverage_start ? new Date(p.coverage_start).toLocaleDateString() : '—'}
                  {p.coverage_end ? ` — ${new Date(p.coverage_end).toLocaleDateString()}` : ''}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status ?? 'unknown'} /></td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No records found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
