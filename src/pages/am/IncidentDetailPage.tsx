import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { incidents } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Phone, MapPin, Car, User, Clock, MessageSquare, Send,
  CheckCircle2, Circle, AlertTriangle, Wrench, Star
} from 'lucide-react';

const timelineSteps = [
  { key: 'Open', label: 'Reported', icon: AlertTriangle },
  { key: 'In Progress', label: 'In Progress', icon: Clock },
  { key: 'Service Assigned', label: 'Service Assigned', icon: Wrench },
  { key: 'Completed', label: 'Service Completed', icon: CheckCircle2 },
  { key: 'Closed', label: 'Closed', icon: CheckCircle2 },
];

const statusOrder = ['Open', 'In Progress', 'Service Assigned', 'Completed', 'Closed'];

const timelineData: Record<string, { timestamp: string; actor: string }> = {
  'Open': { timestamp: '14 Jan 2025, 08:30', actor: 'James Mwangi (Client)' },
  'In Progress': { timestamp: '14 Jan 2025, 08:45', actor: 'Wanjiru K.' },
  'Service Assigned': { timestamp: '14 Jan 2025, 09:10', actor: 'Wanjiru K.' },
  'Completed': { timestamp: '14 Jan 2025, 11:30', actor: 'AA Kenya' },
  'Closed': { timestamp: '14 Jan 2025, 14:00', actor: 'Wanjiru K.' },
};

const mockNotes = [
  { id: 1, text: 'Client reports engine overheating. Requested immediate assistance.', author: 'Wanjiru K.', time: '08:45', internal: true },
  { id: 2, text: 'AA Kenya dispatched — ETA 25 minutes.', author: 'Wanjiru K.', time: '09:10', internal: true },
  { id: 3, text: 'Technician on site. Radiator hose replacement required.', author: 'AA Kenya', time: '09:40', internal: true },
];

const providers = ['Shell Kenya', 'AA Kenya', 'IDT', 'General Mechanic'];

export default function IncidentDetailPage() {
  const { id } = useParams();
  const incident = incidents.find(i => i.id === id);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState(mockNotes);
  const [selectedProvider, setSelectedProvider] = useState(incident?.assignedProvider || '');

  if (!incident) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Home' }, { label: 'Incidents' }, { label: 'Not Found' }]} />
        <p className="text-muted-foreground">Incident not found.</p>
      </div>
    );
  }

  const currentStepIndex = statusOrder.indexOf(incident.status);

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes([...notes, { id: notes.length + 1, text: noteText, author: 'You', time: 'Just now', internal: true }]);
    setNoteText('');
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Incidents', href: '/incidents' }, { label: incident.claimRef }]} />

      {/* Back + Header */}
      <div className="mb-6">
        <Link to="/incidents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Incidents
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold font-mono">{incident.claimRef}</h1>
              <StatusBadge status={incident.status} />
            </div>
            <p className="text-sm text-muted-foreground">{incident.type} — {incident.vehicleReg}</p>
          </div>
          {incident.status !== 'Closed' && (
            <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
              Mark as Resolved
            </Button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="rounded-lg border bg-card p-6 mb-6">
        <h3 className="text-sm font-semibold mb-5">Status Timeline</h3>
        <div className="relative">
          {/* Progress Track */}
          <div className="flex items-start justify-between relative">
            {/* Background line */}
            <div className="absolute top-[18px] left-[18px] right-[18px] h-[3px] bg-border rounded-full" />
            {/* Active line */}
            {currentStepIndex > 0 && (
              <div
                className="absolute top-[18px] left-[18px] h-[3px] rounded-full transition-all duration-500"
                style={{
                  width: `calc(${(currentStepIndex / (timelineSteps.length - 1)) * 100}% - 36px)`,
                  background: 'linear-gradient(90deg, hsl(142, 72%, 29%), hsl(38, 78%, 52%))',
                }}
              />
            )}

            {timelineSteps.map((step, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isFuture = i > currentStepIndex;
              const StepIcon = step.icon;
              const data = timelineData[step.key];

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10" style={{ width: `${100 / timelineSteps.length}%` }}>
                  {/* Node */}
                  <div
                    className={cn(
                      'relative flex h-9 w-9 items-center justify-center rounded-full border-[3px] transition-all duration-300',
                      isCompleted && 'border-success bg-success text-success-foreground shadow-[0_0_0_4px_hsl(142,72%,29%,0.15)]',
                      isCurrent && 'border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(38,78%,52%,0.2)] scale-110',
                      isFuture && 'border-border bg-card text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <div className="relative">
                        <StepIcon className="h-4 w-4" />
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
                      </div>
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>

                  {/* Label */}
                  <p className={cn(
                    'mt-2.5 text-xs font-medium text-center leading-tight',
                    isCompleted && 'text-success',
                    isCurrent && 'text-primary font-semibold',
                    isFuture && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </p>

                  {/* Timestamp + Actor */}
                  {(isCompleted || isCurrent) && data && (
                    <div className="mt-1 text-center">
                      <p className="text-[10px] font-mono text-muted-foreground">{data.timestamp}</p>
                      <p className="text-[10px] text-muted-foreground">{data.actor}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Incident Info + Actions */}
        <div className="col-span-2 space-y-5">
          {/* Incident Info */}
          <div className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Incident Details</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{incident.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-mono font-medium">{incident.vehicleReg}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Client:</span>
                <span className="font-medium">{incident.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-mono text-xs">{incident.clientPhone}</span>
              </div>
              <div className="flex items-start gap-2 col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Location:</span>
                <span>{incident.location}</span>
              </div>
              <div className="col-span-2 pt-2 border-t">
                <p className="text-muted-foreground text-xs mb-1">Description</p>
                <p className="text-sm">{incident.description}</p>
              </div>
            </div>
          </div>

          {/* Assign Provider + Update Status */}
          {incident.status !== 'Closed' && (
            <div className="rounded-lg border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Actions</h3>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Assign Provider</label>
                  <select
                    value={selectedProvider}
                    onChange={e => setSelectedProvider(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select provider...</option>
                    {providers.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <Button size="sm" variant="outline">Update Status</Button>
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Internal Notes
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-normal">Not visible to client</span>
            </h3>
            <div className="space-y-3 mb-4 max-h-[240px] overflow-y-auto">
              {notes.map(n => (
                <div key={n.id} className="rounded-md bg-muted/50 px-3 py-2.5 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs">{n.author}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="text-muted-foreground">{n.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a note..."
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNote()}
              />
              <Button size="sm" onClick={addNote} disabled={!noteText.trim()}>
                <Send className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Questionnaire (if closed) or Summary */}
        <div className="space-y-5">
          {incident.status === 'Closed' && (incident as any).rating && (
            <div className="rounded-lg border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Client Feedback</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Overall Rating</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={cn('h-4 w-4', s <= (incident as any).rating ? 'text-primary fill-primary' : 'text-border')} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Timeliness</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={cn('h-3.5 w-3.5', s <= (incident as any).timeliness ? 'text-primary fill-primary' : 'text-border')} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Professionalism</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={cn('h-3.5 w-3.5', s <= (incident as any).professionalism ? 'text-primary fill-primary' : 'text-border')} />
                    ))}
                  </div>
                </div>
                {(incident as any).comments && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Comments</p>
                    <p className="text-sm italic text-muted-foreground">"{(incident as any).comments}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Info Card */}
          <div className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Quick Info</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Claim Ref</span>
                <span className="font-mono font-medium">{incident.claimRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-mono text-xs">{incident.created}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span>{incident.assignedProvider || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={incident.status} />
              </div>
            </div>
          </div>

          {/* Client Updates */}
          <div className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Client-Visible Updates</h3>
            <div className="space-y-2 text-sm text-muted-foreground mb-3">
              <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                <p className="font-medium text-foreground">Service dispatched</p>
                <p>A technician has been dispatched to your location.</p>
              </div>
              <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                <p className="font-medium text-foreground">Incident received</p>
                <p>We've received your report and are processing it.</p>
              </div>
            </div>
            <textarea
              placeholder="Send update to client..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <Button size="sm" variant="outline" className="mt-2 w-full">
              <Send className="h-3.5 w-3.5 mr-1" /> Send to Client
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
