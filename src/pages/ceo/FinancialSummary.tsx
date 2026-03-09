import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KPICard } from '@/components/KPICard';
import { monthlyFinancials } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function FinancialSummary() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Financial Summary' }]} />
      <h1 className="text-xl font-semibold mb-5">Financial Summary</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard title="Avg Approval Time" value="1.8 days" />
        <KPICard title="Avg Payment Delay" value="2.3 days" />
        <KPICard title="Premiums (6 mo)" value={`KES ${monthlyFinancials.reduce((s, m) => s + m.premiums, 0).toLocaleString()}`} />
        <KPICard title="Claims (6 mo)" value={`KES ${monthlyFinancials.reduce((s, m) => s + m.claims, 0).toLocaleString()}`} />
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Monthly Premiums vs Claims</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthlyFinancials}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="premiums" name="Premiums Collected" fill="hsl(38, 78%, 52%)" radius={[4,4,0,0]} />
            <Bar dataKey="claims" name="Claims Paid" fill="hsl(0, 72%, 51%)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
