import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KPICard } from '@/components/KPICard';
import { clients, incidents, monthlyFinancials, monthlyServiceVolume, cohortBreakdown } from '@/data/mockData';
import { Users, AlertTriangle, TrendingUp, UserX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

export default function CEODashboard() {
  const activeClients = clients.filter(c => c.cohort === 'Active').length;
  const dormantClients = clients.filter(c => c.cohort === 'Dormant').length;
  const totalPremiums = monthlyFinancials.reduce((s, m) => s + m.premiums, 0);
  const totalClaims = monthlyFinancials.reduce((s, m) => s + m.claims, 0);
  const ratio = ((totalPremiums / totalClaims) * 100).toFixed(0);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Executive Dashboard' }]} />
      <h1 className="text-xl font-semibold mb-5">Executive Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Active Clients" value={activeClients} icon={<Users className="h-5 w-5" />} />
        <KPICard title="Incidents This Month" value={incidents.length} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPICard title="Premiums:Claims Ratio" value={`${ratio}%`} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Dormant Clients" value={dormantClients} icon={<UserX className="h-5 w-5" />} danger />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Cohort Breakdown */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Client Cohort Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={cohortBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                {cohortBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Service Volume */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Monthly Service Volume (12 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyServiceVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="incidents" stroke="hsl(38, 78%, 52%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard title="Total Premiums (6 mo)" value={`KES ${totalPremiums.toLocaleString()}`} />
        <KPICard title="Total Claims (6 mo)" value={`KES ${totalClaims.toLocaleString()}`} />
        <KPICard title="Net Position" value={`KES ${(totalPremiums - totalClaims).toLocaleString()}`} trend="Healthy margin" trendUp />
      </div>
    </div>
  );
}
