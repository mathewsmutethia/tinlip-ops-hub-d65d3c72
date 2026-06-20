import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KPICard } from '@/components/KPICard';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Payment = Pick<Tables<'payments'>, 'id' | 'amount' | 'status' | 'created_at'>;

type MonthRow = { month: string; confirmed: number; pending: number; failed: number };

function toCsv(rows: string[][]): string {
  return rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    supabase
      .from('payments')
      .select('id, amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(1000)
      .then(({ data, error }) => {
        if (error) { toast.error('Failed to load payment data'); }
        else { setPayments((data as Payment[]) ?? []); }
        setLoading(false);
      });
  }, []);

  const monthlyMap: Record<string, MonthRow> = {};
  payments.forEach(p => {
    if (!p.created_at) return;
    const month = p.created_at.slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { month, confirmed: 0, pending: 0, failed: 0 };
    if (p.status === 'confirmed') monthlyMap[month].confirmed += p.amount ?? 0;
    else if (p.status === 'pending') monthlyMap[month].pending += p.amount ?? 0;
    else if (p.status === 'failed') monthlyMap[month].failed += p.amount ?? 0;
  });
  const rows = Object.values(monthlyMap).sort((a, b) => b.month.localeCompare(a.month));

  const totalConfirmed = payments.filter(p => p.status === 'confirmed').reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount ?? 0), 0);

  const handleExport = async () => {
    setExporting(true);
    const { error } = await supabase
      .from('payments')
      .select('id, amount, status, stk_reference, coverage_start, coverage_end, created_at')
      .order('created_at', { ascending: false })
      .limit(10000);
    setExporting(false);
    if (error) { toast.error('Failed to export report'); return; }
    const date = new Date().toISOString().slice(0, 10);
    const exportRows: string[][] = [
      ['Month', 'Confirmed (KES)', 'Pending (KES)', 'Failed (KES)', 'Net (KES)'],
      ...rows.map(r => [
        r.month,
        String(r.confirmed),
        String(r.pending),
        String(r.failed),
        String(r.confirmed - r.pending - r.failed),
      ]),
    ];
    const blob = new Blob([toCsv(exportRows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tinlip-finance-report-${date}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Reports' }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Reports</h1>
        <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting || rows.length === 0}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
          Export CSV
        </Button>
      </div>

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

          <div className="rounded-lg border bg-card overflow-hidden">
            {rows.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No payment data available.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Month</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Confirmed</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Pending</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Failed</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.month} className="border-b hover:bg-table-hover">
                      <td className="px-4 py-3 font-medium">{r.month}</td>
                      <td className="px-4 py-3 text-right font-mono text-success">KES {r.confirmed.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">KES {r.pending.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-destructive">KES {r.failed.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">KES {(r.confirmed - r.pending - r.failed).toLocaleString()}</td>
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
