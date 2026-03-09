import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KPICard } from '@/components/KPICard';
import { monthlyFinancials } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ReconciliationPage() {
  const totalPremiums = monthlyFinancials.reduce((s, m) => s + m.premiums, 0);
  const totalClaims = monthlyFinancials.reduce((s, m) => s + m.claims, 0);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Reconciliation' }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Reconciliation</h1>
        <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> Export Report</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <KPICard title="Total Premiums" value={`KES ${totalPremiums.toLocaleString()}`} />
        <KPICard title="Total Claims" value={`KES ${totalClaims.toLocaleString()}`} />
        <KPICard title="Balance" value={`KES ${(totalPremiums - totalClaims).toLocaleString()}`} trend="Net positive" trendUp />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Month</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Premiums In</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Claims Out</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Net</th>
            </tr>
          </thead>
          <tbody>
            {monthlyFinancials.map(m => (
              <tr key={m.month} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-medium">{m.month}</td>
                <td className="px-4 py-3 text-right font-mono">KES {m.premiums.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono text-destructive">KES {m.claims.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono font-medium text-success">KES {(m.premiums - m.claims).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
