import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KPICard } from '@/components/KPICard';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

type Payment = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
};

type MonthRow = {
  month: string;
  confirmed: number;
  pending: number;
};

export default function ReconciliationPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('payments')
      .select('id, amount, status, created_at')
      .then(({ data }) => {
        setPayments((data as Payment[]) ?? []);
        setLoading(false);
      });
  }, []);

  const monthlyMap: Record<string, MonthRow> = {};
  payments.forEach(p => {
    const month = p.created_at.slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { month, confirmed: 0, pending: 0 };
    if (p.status === 'confirmed') monthlyMap[month].confirmed += p.amount ?? 0;
    if (p.status === 'pending') monthlyMap[month].pending += p.amount ?? 0;
  });
  const rows = Object.values(monthlyMap).sort((a, b) => b.month.localeCompare(a.month));

  const totalConfirmed = payments.filter(p => p.status === 'confirmed').reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Reconciliation' }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Reconciliation</h1>
        <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> Export Report</Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <KPICard title="Total Confirmed" value={`KES ${totalConfirmed.toLocaleString()}`} />
            <KPICard title="Total Pending" value={`KES ${totalPending.toLocaleString()}`} />
            <KPICard title="Net Balance" value={`KES ${(totalConfirmed - totalPending).toLocaleString()}`} trend="Confirmed minus pending" trendUp />
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            {rows.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No payment data available.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Month</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Confirmed In</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Pending</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.month} className="border-b hover:bg-table-hover">
                      <td className="px-4 py-3 font-medium">{r.month}</td>
                      <td className="px-4 py-3 text-right font-mono text-success">KES {r.confirmed.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">KES {r.pending.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">KES {(r.confirmed - r.pending).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
