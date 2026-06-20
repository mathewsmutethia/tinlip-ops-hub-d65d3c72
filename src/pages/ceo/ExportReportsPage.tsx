import { useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type ExportKey = 'clients-csv' | 'incidents-csv' | 'financial-csv' | 'audit-csv' | 'sla-pdf';

function toCsv(rows: string[][]): string {
  return rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ExportReportsPage() {
  const [loading, setLoading] = useState<ExportKey | null>(null);
  const date = new Date().toISOString().slice(0, 10);

  const exportClients = async () => {
    setLoading('clients-csv');
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, email, phone, status, company_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10000);
    setLoading(null);
    if (error) { toast.error('Failed to export clients'); return; }
    const rows: string[][] = [
      ['Name', 'Email', 'Phone', 'Company', 'Status', 'Joined'],
      ...(data ?? []).map(c => [
        c.name ?? '',
        c.email,
        c.phone ?? '',
        c.company_name ?? '',
        c.status ?? '',
        c.created_at ? new Date(c.created_at).toLocaleDateString('en-KE') : '',
      ]),
    ];
    triggerDownload(toCsv(rows), `tinlip-clients-${date}.csv`);
  };

  const exportIncidents = async () => {
    setLoading('incidents-csv');
    const { data, error } = await supabase
      .from('incidents')
      .select('id, claim_code, type, status, location, description, created_at')
      .order('created_at', { ascending: false })
      .limit(10000);
    setLoading(null);
    if (error) { toast.error('Failed to export incidents'); return; }
    const rows: string[][] = [
      ['Claim Code', 'Type', 'Status', 'Location', 'Description', 'Created'],
      ...(data ?? []).map(i => [
        i.claim_code ?? i.id.slice(0, 8),
        i.type ?? '',
        i.status ?? '',
        i.location ?? '',
        i.description ?? '',
        i.created_at ? new Date(i.created_at).toLocaleDateString('en-KE') : '',
      ]),
    ];
    triggerDownload(toCsv(rows), `tinlip-incidents-${date}.csv`);
  };

  const exportFinancials = async () => {
    setLoading('financial-csv');
    const { data, error } = await supabase
      .from('payments')
      .select('id, amount, status, stk_reference, coverage_start, coverage_end, created_at')
      .order('created_at', { ascending: false })
      .limit(10000);
    setLoading(null);
    if (error) { toast.error('Failed to export financials'); return; }
    const rows: string[][] = [
      ['STK Reference', 'Amount (KES)', 'Status', 'Coverage Start', 'Coverage End', 'Date'],
      ...(data ?? []).map(p => [
        p.stk_reference ?? '',
        String(p.amount ?? 0),
        p.status ?? '',
        p.coverage_start ?? '',
        p.coverage_end ?? '',
        p.created_at ? new Date(p.created_at).toLocaleDateString('en-KE') : '',
      ]),
    ];
    triggerDownload(toCsv(rows), `tinlip-financials-${date}.csv`);
  };

  const exportAudit = async () => {
    setLoading('audit-csv');
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, action, entity_type, entity_id, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10000);
    setLoading(null);
    if (error) { toast.error('Failed to export audit logs'); return; }
    const rows: string[][] = [
      ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User ID'],
      ...(data ?? []).map(l => [
        l.created_at ? new Date(l.created_at).toLocaleString('en-KE') : '',
        l.action ?? '',
        l.entity_type ?? '',
        l.entity_id ?? '',
        l.user_id ?? '',
      ]),
    ];
    triggerDownload(toCsv(rows), `tinlip-audit-${date}.csv`);
  };

  const reports: {
    key: string;
    name: string;
    description: string;
    formats: { fmt: string; exportKey: ExportKey; handler: () => void }[];
  }[] = [
    {
      key: 'clients',
      name: 'Client Summary Report',
      description: 'Overview of all clients, cohorts, and coverage status',
      formats: [{ fmt: 'CSV', exportKey: 'clients-csv', handler: exportClients }],
    },
    {
      key: 'incidents',
      name: 'Incidents Report',
      description: 'All incidents with status, response times, and provider details',
      formats: [{ fmt: 'CSV', exportKey: 'incidents-csv', handler: exportIncidents }],
    },
    {
      key: 'financial',
      name: 'Financial Overview',
      description: 'Premiums collected, claims paid, and net position',
      formats: [{ fmt: 'CSV', exportKey: 'financial-csv', handler: exportFinancials }],
    },
    {
      key: 'audit',
      name: 'Audit Trail Export',
      description: 'Complete audit log of all system actions',
      formats: [{ fmt: 'CSV', exportKey: 'audit-csv', handler: exportAudit }],
    },
    {
      key: 'sla',
      name: 'SLA Compliance Report',
      description: 'Response times, breaches, and provider performance',
      formats: [{ fmt: 'PDF', exportKey: 'sla-pdf', handler: () => toast.info('PDF export is not yet available.') }],
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Export Reports' }]} />
      <h1 className="text-xl font-semibold mb-5">Export Reports</h1>

      <div className="space-y-3">
        {reports.map(r => (
          <div key={r.key} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {r.formats.map(f => (
                <Button
                  key={f.exportKey}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  disabled={loading === f.exportKey}
                  onClick={f.handler}
                >
                  {loading === f.exportKey
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    : <Download className="h-3.5 w-3.5 mr-1" />
                  }
                  {f.fmt}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
