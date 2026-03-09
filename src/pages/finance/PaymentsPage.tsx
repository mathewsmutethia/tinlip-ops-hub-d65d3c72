import { useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { payments } from '@/data/mockData';
import { cn } from '@/lib/utils';

const tabs = ['All', 'Pending', 'Confirmed', 'Failed'];

export default function PaymentsPage() {
  const [tab, setTab] = useState('All');
  const filtered = payments.filter(p => tab === 'All' || p.stkStatus === tab);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Payments' }]} />
      <h1 className="text-xl font-semibold mb-5">Payments</h1>

      <div className="flex gap-1 mb-4 border-b">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px', tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Payment Ref</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Method</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">STK Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Invoice</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className={cn('border-b hover:bg-table-hover', p.stkStatus === 'Failed' && 'bg-destructive/5')}>
                <td className="px-4 py-3 font-mono text-xs">{p.ref}</td>
                <td className="px-4 py-3">{p.client}</td>
                <td className="px-4 py-3 font-mono font-medium">KES {p.amount.toLocaleString()}</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3"><StatusBadge status={p.stkStatus} /></td>
                <td className="px-4 py-3 font-mono text-xs text-primary">{p.invoiceId}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
