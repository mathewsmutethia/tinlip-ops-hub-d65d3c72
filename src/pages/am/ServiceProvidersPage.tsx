import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { serviceProviders } from '@/data/mockData';

export default function ServiceProvidersPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Service Providers' }]} />
      <h1 className="text-xl font-semibold mb-5">Service Providers</h1>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Provider Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Active Incidents</th>
            </tr>
          </thead>
          <tbody>
            {serviceProviders.map(sp => (
              <tr key={sp.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-medium">{sp.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{sp.type}</td>
                <td className="px-4 py-3 font-mono text-xs">{sp.contact}</td>
                <td className="px-4 py-3 font-mono">{sp.activeIncidents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
