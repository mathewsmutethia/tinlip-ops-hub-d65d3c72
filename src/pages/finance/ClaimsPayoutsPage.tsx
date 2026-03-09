import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { claims } from '@/data/mockData';
import { Button } from '@/components/ui/button';

export default function ClaimsPayoutsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Claims & Payouts' }]} />
      <h1 className="text-xl font-semibold mb-5">Claims & Payouts</h1>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Claim Ref</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicle</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Est. Cost</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(c => (
              <tr key={c.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-mono font-medium text-primary">{c.claimRef}</td>
                <td className="px-4 py-3">{c.type}</td>
                <td className="px-4 py-3">{c.client}</td>
                <td className="px-4 py-3 font-mono">{c.vehicle}</td>
                <td className="px-4 py-3 font-mono font-medium">KES {c.estCost.toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">
                  {c.status === 'Pending Review' && (
                    <div className="flex gap-1">
                      <Button size="sm" className="h-7 text-xs bg-success hover:bg-success/90 text-success-foreground">Approve</Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs">Reject</Button>
                    </div>
                  )}
                  {c.status === 'Approved' && <Button size="sm" variant="outline" className="h-7 text-xs">Record Payment</Button>}
                  {c.status === 'Paid' && <span className="font-mono text-xs text-muted-foreground">{c.paymentRef}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
