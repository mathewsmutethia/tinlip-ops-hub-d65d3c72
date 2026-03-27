import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KPICard } from '@/components/KPICard';
import { supabase } from '@/integrations/supabase/client';
import { Banknote, FileWarning, Receipt, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Tables } from '@/integrations/supabase/types';

type Payment = Tables<'payments'> & { clients: { name: string | null } | null };

export default function FinanceDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

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

  const confirmed = payments.filter(p => p.status === 'confirmed');
  const pending = payments.filter(p => p.status === 'pending');
  const totalCollected = confirmed.reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalPending = pending.reduce((s, p) => s + (p.amount ?? 0), 0);

  // Build monthly chart data from real payments
  const monthlyMap: Record<string, { month: string; premiums: number }> = {};
  confirmed.forEach(p => {
    if (!p.created_at) return;
    const month = new Date(p.created_at).toLocaleString('default', { month: 'short' });
    if (!monthlyMap[month]) monthlyMap[month] = { month, premiums: 0 };
    monthlyMap[month].premiums += p.amount ?? 0;
  });
  const chartData = Object.values(monthlyMap).slice(-6);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Dashboard' }]} />
      <h1 className="text-xl font-semibold mb-5">Finance Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard title="Premiums Collected" value={loading ? '—' : `KES ${totalCollected.toLocaleString()}`} icon={<Banknote className="h-5 w-5" />} />
        <KPICard title="Pending Payments" value={loading ? '—' : `KES ${totalPending.toLocaleString()}`} icon={<FileWarning className="h-5 w-5" />} />
        <KPICard title="Total Transactions" value={loading ? '—' : payments.length} icon={<Receipt className="h-5 w-5" />} />
        <KPICard title="Net Confirmed" value={loading ? '—' : `KES ${totalCollected.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} trendUp />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Premiums Collected by Month</h3>
          {loading ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : chartData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No payment data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="premiums" name="Premiums" fill="hsl(38, 78%, 52%)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Recent Payments</h3>
          <div className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {!loading && payments.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{p.clients?.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.stk_reference ?? p.id.slice(0, 10)}</p>
                </div>
                <span className="font-mono font-medium">KES {p.amount != null ? p.amount.toLocaleString() : '—'}</span>
              </div>
            ))}
            {!loading && payments.length === 0 && <p className="text-sm text-muted-foreground">No payments yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
