import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Wrench } from 'lucide-react';

export default function ServiceProvidersPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Service Providers' }]} />
      <h1 className="text-xl font-semibold mb-5">Service Providers</h1>
      <div className="rounded-lg border bg-card p-12 flex flex-col items-center justify-center text-center">
        <Wrench className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">Service Providers — Coming Soon</p>
        <p className="text-xs text-muted-foreground">This feature is not yet active. Provider management will be available in a future update.</p>
      </div>
    </div>
  );
}
