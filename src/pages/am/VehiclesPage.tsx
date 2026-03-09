import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { vehicles } from '@/data/mockData';

export default function VehiclesPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Vehicles' }]} />
      <h1 className="text-xl font-semibold mb-5">Vehicles</h1>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reg</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Make/Model</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Year</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mileage</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Documents</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-mono font-medium">{v.reg}</td>
                <td className="px-4 py-3">{v.make} {v.model}</td>
                <td className="px-4 py-3 font-mono">{v.year}</td>
                <td className="px-4 py-3">{v.clientName}</td>
                <td className="px-4 py-3 font-mono">{v.mileage.toLocaleString()} km</td>
                <td className="px-4 py-3"><StatusBadge status={v.documents} /></td>
                <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
