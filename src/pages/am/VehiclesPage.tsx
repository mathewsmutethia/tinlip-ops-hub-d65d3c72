import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'> & { clients: { name: string | null } | null };

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('vehicles')
      .select('*, clients(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setVehicles((data as Vehicle[]) ?? []);
        setLoading(false);
      });
  }, []);

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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
            )}
            {!loading && vehicles.map(v => (
              <tr key={v.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-mono font-medium">{v.registration}</td>
                <td className="px-4 py-3">{v.make ?? '—'} {v.model ?? ''}</td>
                <td className="px-4 py-3 font-mono">{v.year ?? '—'}</td>
                <td className="px-4 py-3">{v.clients?.name ?? '—'}</td>
                <td className="px-4 py-3 font-mono">{v.mileage != null ? `${v.mileage.toLocaleString()} km` : '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={v.status ?? 'unknown'} /></td>
              </tr>
            ))}
            {!loading && vehicles.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No vehicles found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
