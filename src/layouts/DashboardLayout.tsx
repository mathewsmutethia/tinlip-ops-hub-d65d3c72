import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={cn('flex-1 bg-background p-6 transition-all duration-200', collapsed ? 'ml-[56px]' : 'ml-52')}>
        <Outlet />
      </main>
    </div>
  );
}
