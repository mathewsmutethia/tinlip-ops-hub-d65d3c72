import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KPICard } from '@/components/KPICard';
import { monthlyFinancials, payments } from '@/data/mockData';
import { Banknote, FileWarning, Receipt, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function FinanceDashboard() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Dashboard' }]} />
      <h1 className="text-xl font-semibold mb-5">Finance Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard title="Premiums Collected" value="KES 248,000" icon={<Banknote className="h-5 w-5" />} />
        <KPICard title="Outstanding Invoices" value="KES 72,000" icon={<FileWarning className="h-5 w-5" />} />
        <KPICard title="Claims Paid" value="KES 34,500" icon={<Receipt className="h-5 w-5" />} />
        <KPICard title="Net Position" value="KES 213,500" icon={<TrendingUp className="h-5 w-5" />} trend="+12% from last month" trendUp />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Premiums vs Claims (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyFinancials}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="premiums" name="Premiums" fill="hsl(38, 78%, 52%)" radius={[4,4,0,0]} />
              <Bar dataKey="claims" name="Claims" fill="hsl(0, 72%, 51%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Recent Payments</h3>
          <div className="space-y-3">
            {payments.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{p.client}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.ref}</p>
                </div>
                <span className="font-mono font-medium">KES {p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
