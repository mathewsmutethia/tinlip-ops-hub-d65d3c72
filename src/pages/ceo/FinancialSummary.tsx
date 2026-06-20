import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KPICard } from '@/components/KPICard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Tables } from '@/integrations/supabase/types';

type Payment = Pick<Tables<'payments'>, 'id' | 'amount' | 'status' | 'created_at'>;

type MonthlyData = {
  month: string;
  confirmed: number;
  pending: number;
};

export default function FinancialSummary() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('payments')
      .select('id, amount, status, created_at')
      .limit(1000)
      .then(({ data, error }) => {
        if (error) { toast.error('Failed to load payments'); }
        else { setPayments((data as Payment[]) ?? []); }
        setLoading(false);
      });
  }, []);

  const confirmed = payments.filter(p => p.status === 'confirmed');
  const pending = payments.filter(p => p.status === 'pending');
  const totalConfirmed = confirmed.reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalPending = pending.reduce((s, p) => s + (p.amount ?? 0), 0);

  const monthlyMap: Record<string, MonthlyData> = {};
  payments.forEach(p => {
    if (!p.created_at) return;
    const month = p.created_at.slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { month, confirmed: 0, pending: 0 };
    if (p.status === 'confirmed') monthlyMap[month].confirmed += p.amount ?? 0;
    if (p.status === 'pending') monthlyMap[month].pending += p.amount ?? 0;
  });
  const chartData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Financial Summary' }]} />
      <h1 className="text-xl font-semibold mb-5">Financial Summary</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <KPICard title="Confirmed Premiums" value={`KES ${totalConfirmed.toLocaleString()}`} />
            <KPICard title="Pending Payments" value={`KES ${totalPending.toLocaleString()}`} />
            <KPICard title="Total Transactions" value={payments.length.toString()} />
          </div>

          <div className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Confirmed vs Pending by Month</h3>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="confirmed" name="Confirmed" fill="hsl(38, 78%, 52%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="hsl(214, 32%, 70%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
