import { useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { invoices } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

const tabs = ['All', 'Pending', 'Paid', 'Overdue'];

export default function InvoicesPage() {
  const [tab, setTab] = useState('All');
  const filtered = invoices.filter(i => tab === 'All' || i.status === tab);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Invoices' }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Invoices</h1>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Generate Invoice</Button>
      </div>

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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Invoice #</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicle(s)</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Coverage</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-mono font-medium text-primary">{inv.id}</td>
                <td className="px-4 py-3">{inv.client}</td>
                <td className="px-4 py-3 font-mono text-xs">{inv.vehicles}</td>
                <td className="px-4 py-3 font-mono font-medium">KES {inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{inv.coverageStart} — {inv.coverageEnd}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.dueDate}</td>
                <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
