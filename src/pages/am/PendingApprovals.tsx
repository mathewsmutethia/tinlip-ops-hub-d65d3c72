import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Check, Eye } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Client = Tables<'clients'>;
type Vehicle = Tables<'vehicles'> & { clients: { name: string | null } | null };

export default function PendingApprovals() {
  const [tab, setTab] = useState<'clients' | 'vehicles'>('clients');
  const [pendingClients, setPendingClients] = useState<Client[]>([]);
  const [pendingVehicles, setPendingVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      supabase.from('clients').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('vehicles').select('*, clients(name)').eq('status', 'pending').order('created_at', { ascending: false }),
    ]).then(([clientsRes, vehiclesRes]) => {
      setPendingClients(clientsRes.data ?? []);
      setPendingVehicles((vehiclesRes.data as Vehicle[]) ?? []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const openReview = (item: any) => {
    setSelectedItem(item);
    setSlideOverOpen(true);
  };

  const createCoverageForVehicle = async (clientId: string, vehicleId: string) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setFullYear(endDate.getFullYear() + 1);
    await supabase.from('coverage').insert({
      client_id: clientId,
      vehicle_id: vehicleId,
      status: 'active',
      start_date: today.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });
  };

  const approveClient = async (id: string) => {
    setActionLoading(true);
    await supabase.from('clients').update({ status: 'active' }).eq('id', id);

    // Create coverage records for all of this client's vehicles
    const { data: clientVehicles } = await supabase.from('vehicles').select('id').eq('client_id', id);
    if (clientVehicles && clientVehicles.length > 0) {
      await Promise.all(clientVehicles.map(v => createCoverageForVehicle(id, v.id)));
    }

    setSlideOverOpen(false);
    fetchData();
    setActionLoading(false);
  };

  const rejectClient = async (id: string) => {
    setActionLoading(true);
    await supabase.from('clients').update({ status: 'rejected' }).eq('id', id);
    setRejectModalOpen(false);
    setSlideOverOpen(false);
    setRejectReason('');
    fetchData();
    setActionLoading(false);
  };

  const approveVehicle = async (id: string) => {
    setActionLoading(true);

    // Get the vehicle's client_id before updating
    const { data: vehicle } = await supabase.from('vehicles').select('client_id').eq('id', id).single();
    await supabase.from('vehicles').update({ status: 'active' }).eq('id', id);

    // Create coverage if the client is already active
    if (vehicle?.client_id) {
      const { data: client } = await supabase.from('clients').select('status').eq('id', vehicle.client_id).single();
      if (client?.status === 'active') {
        await createCoverageForVehicle(vehicle.client_id, id);
      }
    }

    setSlideOverOpen(false);
    fetchData();
    setActionLoading(false);
  };

  const rejectVehicle = async (id: string) => {
    setActionLoading(true);
    await supabase.from('vehicles').update({ status: 'rejected' }).eq('id', id);
    setRejectModalOpen(false);
    setSlideOverOpen(false);
    setRejectReason('');
    fetchData();
    setActionLoading(false);
  };

  const isClient = selectedItem && 'email' in selectedItem;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Pending Approvals' }]} />
      <h1 className="text-xl font-semibold mb-5">Pending Approvals</h1>

      <div className="flex gap-1 mb-4 border-b">
        <button onClick={() => setTab('clients')} className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px', tab === 'clients' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
          Clients ({pendingClients.length})
        </button>
        <button onClick={() => setTab('vehicles')} className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px', tab === 'vehicles' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
          Vehicles ({pendingVehicles.length})
        </button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {tab === 'clients' ? (
                <>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Submitted</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicle Reg</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Make/Model</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Year</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>}
            {!loading && tab === 'clients' && pendingClients.map(c => (
              <tr key={c.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-medium">{c.name ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status ?? 'pending'} /></td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => openReview(c)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Review
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && tab === 'vehicles' && pendingVehicles.map(v => (
              <tr key={v.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-mono font-medium">{v.registration}</td>
                <td className="px-4 py-3">{v.make ?? '—'} {v.model ?? ''}</td>
                <td className="px-4 py-3 font-mono">{v.year ?? '—'}</td>
                <td className="px-4 py-3">{v.clients?.name ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={v.status ?? 'pending'} /></td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => openReview(v)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Review
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && tab === 'clients' && pendingClients.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No pending clients</td></tr>
            )}
            {!loading && tab === 'vehicles' && pendingVehicles.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No pending vehicles</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over Panel */}
      {slideOverOpen && selectedItem && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setSlideOverOpen(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-[480px] bg-card border-l shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-base font-semibold">Review {selectedItem.name || selectedItem.registration}</h2>
              <button onClick={() => setSlideOverOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm">
              {isClient ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">Client Profile</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedItem.name ?? '—'}</span></div>
                    <div><span className="text-muted-foreground">Email:</span> {selectedItem.email}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {selectedItem.phone ?? '—'}</div>
                    <div><span className="text-muted-foreground">ID No:</span> {selectedItem.id_number ?? '—'}</div>
                    <div><span className="text-muted-foreground">Company:</span> {selectedItem.company_name ?? '—'}</div>
                    <div><span className="text-muted-foreground">Address:</span> {selectedItem.address ?? '—'}</div>
                  </div>
                  {selectedItem.id_document_url && (
                    <div className="rounded-md border p-3 bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">ID Document</p>
                      <a href={selectedItem.id_document_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View Document</a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold">Vehicle Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">Registration:</span> <span className="font-mono font-medium">{selectedItem.registration}</span></div>
                    <div><span className="text-muted-foreground">Make/Model:</span> {selectedItem.make ?? '—'} {selectedItem.model ?? ''}</div>
                    <div><span className="text-muted-foreground">Year:</span> {selectedItem.year ?? '—'}</div>
                    <div><span className="text-muted-foreground">Engine No:</span> <span className="font-mono text-xs">{selectedItem.engine_number ?? '—'}</span></div>
                    <div><span className="text-muted-foreground">Chassis No:</span> <span className="font-mono text-xs">{selectedItem.chassis_number ?? '—'}</span></div>
                    <div><span className="text-muted-foreground">Mileage:</span> <span className="font-mono">{selectedItem.mileage != null ? `${selectedItem.mileage.toLocaleString()} km` : '—'}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedItem.logbook_url && (
                      <div className="rounded-md border p-3 bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Logbook</p>
                        <a href={selectedItem.logbook_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View</a>
                      </div>
                    )}
                    {selectedItem.insurance_url && (
                      <div className="rounded-md border p-3 bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Insurance</p>
                        <a href={selectedItem.insurance_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View</a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t px-6 py-4 flex gap-3">
              <Button
                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                disabled={actionLoading}
                onClick={() => isClient ? approveClient(selectedItem.id) : approveVehicle(selectedItem.id)}
              >
                <Check className="h-4 w-4 mr-1" /> {actionLoading ? 'Processing...' : 'Approve'}
              </Button>
              <Button variant="destructive" className="flex-1" disabled={actionLoading} onClick={() => setRejectModalOpen(true)}>
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm" onClick={() => setRejectModalOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-[70] w-full max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow-xl">
            <h3 className="text-base font-semibold mb-3">Rejection Reason</h3>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Please provide a reason for rejection..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={!rejectReason.trim() || actionLoading}
                onClick={() => isClient ? rejectClient(selectedItem.id) : rejectVehicle(selectedItem.id)}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
