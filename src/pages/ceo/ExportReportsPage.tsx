import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

export default function ExportReportsPage() {
  const reports = [
    { name: 'Client Summary Report', description: 'Overview of all clients, cohorts, and coverage status', formats: ['CSV', 'PDF'] },
    { name: 'Incidents Report', description: 'All incidents with status, response times, and provider details', formats: ['CSV', 'PDF'] },
    { name: 'Financial Overview', description: 'Premiums collected, claims paid, and net position', formats: ['CSV', 'PDF'] },
    { name: 'Audit Trail Export', description: 'Complete audit log of all system actions', formats: ['CSV'] },
    { name: 'SLA Compliance Report', description: 'Response times, breaches, and provider performance', formats: ['PDF'] },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Export Reports' }]} />
      <h1 className="text-xl font-semibold mb-5">Export Reports</h1>

      <div className="space-y-3">
        {reports.map((r, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {r.formats.map(f => (
                <Button key={f} size="sm" variant="outline" className="h-8 text-xs">
                  <Download className="h-3.5 w-3.5 mr-1" /> {f}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
