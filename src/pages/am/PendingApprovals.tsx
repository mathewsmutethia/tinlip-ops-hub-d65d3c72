import { useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { pendingClients, pendingVehicles } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Check, Eye } from 'lucide-react';

export default function PendingApprovals() {
  const [tab, setTab] = useState<'clients' | 'vehicles'>('clients');
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const openReview = (item: any) => {
    setSelectedItem(item);
    setSlideOverOpen(true);
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Pending Approvals' }]} />
      <h1 className="text-xl font-semibold mb-5">Pending Approvals</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        <button
          onClick={() => setTab('clients')}
          className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px', tab === 'clients' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
        >
          Clients ({pendingClients.length})
        </button>
        <button
          onClick={() => setTab('vehicles')}
          className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px', tab === 'vehicles' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
        >
          Vehicles ({pendingVehicles.length})
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {tab === 'clients' ? (
                <>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicles</th>
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Documents</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {tab === 'clients' ? pendingClients.map(c => (
              <tr key={c.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.idType}</td>
                <td className="px-4 py-3 font-mono">{c.vehicles}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.submittedDate}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => openReview(c)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Review
                  </Button>
                </td>
              </tr>
            )) : pendingVehicles.map(v => (
              <tr key={v.id} className="border-b hover:bg-table-hover">
                <td className="px-4 py-3 font-mono font-medium">{v.reg}</td>
                <td className="px-4 py-3">{v.make} {v.model}</td>
                <td className="px-4 py-3 font-mono">{v.year}</td>
                <td className="px-4 py-3">{v.clientName}</td>
                <td className="px-4 py-3"><StatusBadge status={v.documents} /></td>
                <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => openReview(v)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over Panel */}
      {slideOverOpen && selectedItem && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setSlideOverOpen(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-[480px] bg-card border-l shadow-xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-base font-semibold">Review {selectedItem.name || selectedItem.reg}</h2>
              <button onClick={() => setSlideOverOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm">
              {selectedItem.name && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Client Profile</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedItem.name}</span></div>
                    <div><span className="text-muted-foreground">Email:</span> {selectedItem.email}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {selectedItem.phone}</div>
                    <div><span className="text-muted-foreground">ID Type:</span> {selectedItem.idType}</div>
                  </div>
                  <div className="rounded-md border p-3 bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">ID Document</p>
                    <div className="h-20 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">Document Preview</div>
                    <button className="text-xs text-primary mt-1 underline">View Full</button>
                  </div>
                </div>
              )}
              {selectedItem.reg && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Vehicle Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">Registration:</span> <span className="font-mono font-medium">{selectedItem.reg}</span></div>
                    <div><span className="text-muted-foreground">Make/Model:</span> {selectedItem.make} {selectedItem.model}</div>
                    <div><span className="text-muted-foreground">Year:</span> {selectedItem.year}</div>
                    <div><span className="text-muted-foreground">Engine No:</span> <span className="font-mono text-xs">{selectedItem.engineNo}</span></div>
                    <div><span className="text-muted-foreground">Chassis No:</span> <span className="font-mono text-xs">{selectedItem.chassisNo}</span></div>
                    <div><span className="text-muted-foreground">Mileage:</span> <span className="font-mono">{selectedItem.mileage?.toLocaleString()} km</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md border p-3 bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Logbook</p>
                      <div className="h-16 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">Preview</div>
                    </div>
                    <div className="rounded-md border p-3 bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Insurance</p>
                      <div className="h-16 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">Preview</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border border-primary bg-primary/20" />
                    <span className="text-sm">Signed agreement received</span>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t px-6 py-4 flex gap-3">
              <Button className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => setRejectModalOpen(true)}>
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
              <Button variant="destructive" disabled={!rejectReason.trim()} onClick={() => { setRejectModalOpen(false); setSlideOverOpen(false); setRejectReason(''); }}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
