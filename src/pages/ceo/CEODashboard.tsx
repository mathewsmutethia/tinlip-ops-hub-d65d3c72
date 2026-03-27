import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KPICard } from '@/components/KPICard';
import { supabase } from '@/integrations/supabase/client';
import { Users, AlertTriangle, TrendingUp, UserX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(38, 78%, 52%)', 'hsl(200, 80%, 50%)', 'hsl(0, 72%, 51%)'];

export default function CEODashboard() {
  const [activeClients, setActiveClients] = useState(0);
  const [dormantClients, setDormantClients] = useState(0);
  const [pendingClients, setPendingClients] = useState(0);
  const [incidentsCount, setIncidentsCount] = useState(0);
  const [totalPremiums, setTotalPremiums] = useState(0);
  const [cohortData, setCohortData] = useState<{ name: string; value: number }[]>([]);
  const [paymentsByMonth, setPaymentsByMonth] = useState<{ month: string; premiums: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('clients').select('status'),
      supabase.from('incidents').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('amount, created_at, status'),
    ]).then(([clientsRes, incRes, paymentsRes]) => {
      const clients = clientsRes.data ?? [];
      const active = clients.filter(c => c.status === 'active').length;
      const dormant = clients.filter(c => c.status === 'dormant').length;
      const pending = clients.filter(c => c.status === 'pending').length;
      const rejected = clients.filter(c => c.status === 'rejected').length;

      setActiveClients(active);
      setDormantClients(dormant);
      setPendingClients(pending);
      setIncidentsCount(incRes.count ?? 0);

      setCohortData([
        { name: 'Active', value: active },
        { name: 'Dormant', value: dormant },
        { name: 'Pending', value: pending },
        { name: 'Rejected', value: rejected },
      ].filter(c => c.value > 0));

      const payments = paymentsRes.data ?? [];
      const confirmed = payments.filter(p => p.status === 'confirmed');
      setTotalPremiums(confirmed.reduce((s, p) => s + (p.amount ?? 0), 0));

      const monthlyMap: Record<string, number> = {};
      confirmed.forEach(p => {
        if (!p.created_at) return;
        const month = new Date(p.created_at).toLocaleString('default', { month: 'short' });
        monthlyMap[month] = (monthlyMap[month] ?? 0) + (p.amount ?? 0);
      });
      setPaymentsByMonth(Object.entries(monthlyMap).map(([month, premiums]) => ({ month, premiums })));

      setLoading(false);
    });
  }, []);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Executive Dashboard' }]} />
      <h1 className="text-xl font-semibold mb-5">Executive Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard title="Active Clients" value={loading ? '—' : activeClients} icon={<Users className="h-5 w-5" />} />
        <KPICard title="Total Incidents" value={loading ? '—' : incidentsCount} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPICard title="Premiums Collected" value={loading ? '—' : `KES ${totalPremiums.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Dormant Clients" value={loading ? '—' : dormantClients} icon={<UserX className="h-5 w-5" />} danger />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Client Status Breakdown</h3>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : cohortData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No clients yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={cohortData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {cohortData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Monthly Premiums</h3>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : paymentsByMonth.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No payment data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={paymentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                <Bar dataKey="premiums" name="Premiums" fill="hsl(38, 78%, 52%)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KPICard title="Total Clients" value={loading ? '—' : activeClients + dormantClients + pendingClients} />
        <KPICard title="Pending Onboarding" value={loading ? '—' : pendingClients} />
        <KPICard title="Premiums Collected" value={loading ? '—' : `KES ${totalPremiums.toLocaleString()}`} trendUp />
      </div>
    </div>
  );
}
