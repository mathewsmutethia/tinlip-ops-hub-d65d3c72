import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Phone, MapPin, Car, User, Clock, MessageSquare, Send,
  CheckCircle2, Circle, AlertTriangle, Wrench, ShieldCheck
} from 'lucide-react';

const timelineSteps = [
  { key: 'open', label: 'Reported', icon: AlertTriangle },
  { key: 'in_progress', label: 'In Progress', icon: Clock },
  { key: 'service_assigned', label: 'Service Assigned', icon: Wrench },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'closed', label: 'Closed', icon: ShieldCheck },
];

const statusOrder = ['open', 'in_progress', 'service_assigned', 'completed', 'closed'];

const statusTransitions: Record<string, { next: string; label: string }> = {
  open: { next: 'in_progress', label: 'Start Working' },
  in_progress: { next: 'service_assigned', label: 'Assign Service' },
  service_assigned: { next: 'completed', label: 'Mark Completed' },
  completed: { next: 'closed', label: 'Close Incident' },
};

type PersistedNote = { text: string; author: string; created_at: string };

type Incident = {
  id: string;
  claim_code: string;
  type: string;
  status: string;
  description: string | null;
  location: string | null;
  created_at: string;
  notes: PersistedNote[] | null;
  clients: { name: string; phone: string | null } | null;
  vehicles: { registration: string } | null;
};

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { user } = useRole();
  const { toast } = useToast();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const fetchIncident = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('incidents')
      .select('id, claim_code, type, status, description, location, created_at, notes, clients(name, phone), vehicles(registration)')
      .eq('id', id)
      .single();
    setIncident(data as unknown as Incident | null);
    setLoading(false);
  };

  useEffect(() => { fetchIncident(); }, [id]);

  const handleAdvanceStatus = async () => {
    if (!incident) return;
    const transition = statusTransitions[incident.status];
    if (!transition) return;
    setAdvancing(true);
    try {
      const { error } = await supabase.from('incidents').update({ status: transition.next }).eq('id', incident.id);
      if (error) throw error;
      await fetchIncident();
    } catch (err) {
      console.error('Failed to advance incident status:', err);
      toast({ title: 'Failed to update status', variant: 'destructive' });
    } finally {
      setAdvancing(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim() || !incident) return;
    setSavingNote(true);
    try {
      const newNote: PersistedNote = {
        text: noteText.trim(),
        author: user?.id ?? 'unknown',
        created_at: new Date().toISOString(),
      };
      const updatedNotes = [...(incident.notes ?? []), newNote];
      const { error } = await supabase.from('incidents').update({ notes: updatedNotes }).eq('id', incident.id);
      if (error) throw error;
      setIncident({ ...incident, notes: updatedNotes });
      setNoteText('');
    } catch (err) {
      console.error('Failed to save note:', err);
      toast({ title: 'Failed to save note', variant: 'destructive' });
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground p-4">Loading...</div>;

  if (!incident) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Home' }, { label: 'Incidents' }, { label: 'Not Found' }]} />
        <p className="text-muted-foreground">Incident not found.</p>
      </div>
    );
  }

  const currentStepIndex = statusOrder.indexOf(incident.status);
  const transition = statusTransitions[incident.status];
  const persistedNotes = incident.notes ?? [];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Incidents', href: '/incidents' }, { label: incident.claim_code }]} />

      <div className="mb-6">
        <Link to="/incidents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Incidents
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold font-mono">{incident.claim_code}</h1>
              <StatusBadge status={incident.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {incident.type} — {incident.vehicles?.registration ?? '—'}
            </p>
          </div>
          {transition ? (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleAdvanceStatus}
              disabled={advancing}
            >
              {advancing ? 'Updating...' : transition.label}
            </Button>
          ) : incident.status === 'closed' ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
            </span>
          ) : null}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="rounded-lg border bg-card p-6 mb-6">
        <h3 className="text-sm font-semibold mb-5">Status Timeline</h3>
        <div className="flex items-start justify-between relative">
          <div className="absolute top-[18px] left-[18px] right-[18px] h-[3px] bg-border rounded-full" />
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
            return (
              <div key={step.key} className="flex flex-col items-center relative z-10" style={{ width: `${100 / timelineSteps.length}%` }}>
                <div className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-full border-[3px] transition-all duration-300',
                  isCompleted && 'border-success bg-success text-success-foreground',
                  isCurrent && 'border-primary bg-primary text-primary-foreground scale-110',
                  isFuture && 'border-border bg-card text-muted-foreground'
                )}>
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : isCurrent ? <StepIcon className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </div>
                <p className={cn(
                  'mt-2.5 text-xs font-medium text-center leading-tight',
                  isCompleted && 'text-success',
                  isCurrent && 'text-primary font-semibold',
                  isFuture && 'text-muted-foreground'
                )}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* Incident Details */}
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
                <span className="font-mono font-medium">{incident.vehicles?.registration ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Client:</span>
                <span className="font-medium">{incident.clients?.name ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-mono text-xs">{incident.clients?.phone ?? '—'}</span>
              </div>
              {incident.location && (
                <div className="flex items-start gap-2 col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Location:</span>
                  <span>{incident.location}</span>
                </div>
              )}
              {incident.description && (
                <div className="col-span-2 pt-2 border-t">
                  <p className="text-muted-foreground text-xs mb-1">Description</p>
                  <p className="text-sm">{incident.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Internal Notes
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-normal">Not visible to client</span>
            </h3>
            <div className="space-y-3 mb-4 max-h-[240px] overflow-y-auto">
              {persistedNotes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet.</p>}
              {persistedNotes.map((n, idx) => (
                <div key={idx} className="rounded-md bg-muted/50 px-3 py-2.5 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs font-mono">{n.author.length > 16 ? n.author.slice(0, 8) + '…' : n.author}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString('en-KE')}
                    </span>
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
                onKeyDown={e => e.key === 'Enter' && !savingNote && addNote()}
              />
              <Button size="sm" onClick={addNote} disabled={!noteText.trim() || savingNote}>
                <Send className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div>
          <div className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Quick Info</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Claim Code</span>
                <span className="font-mono font-medium">{incident.claim_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-mono text-xs">{new Date(incident.created_at).toLocaleDateString('en-KE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={incident.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notes</span>
                <span className="font-mono text-xs">{persistedNotes.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
