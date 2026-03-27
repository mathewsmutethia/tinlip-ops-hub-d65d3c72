import { useRole, UserRole } from '@/contexts/RoleContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck, Users, Car, AlertTriangle, Wrench, Settings,
  FileText, CreditCard, Receipt, ArrowLeftRight, BarChart3, Eye, Shield,
  ScrollText, Download, LogOut, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const roleLabels: Record<UserRole, string> = {
  account_manager: 'Account Manager',
  finance: 'Finance',
  ceo: 'CEO',
};

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: Record<UserRole, NavItem[]> = {
  account_manager: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Pending Approvals', path: '/approvals', icon: ClipboardCheck, badge: 20 },
    { label: 'Clients', path: '/clients', icon: Users },
    { label: 'Vehicles', path: '/vehicles', icon: Car },
    { label: 'Incidents', path: '/incidents', icon: AlertTriangle },
    { label: 'Service Providers', path: '/providers', icon: Wrench },
    { label: 'Settings', path: '/settings', icon: Settings },
  ],
  finance: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Claims & Payouts', path: '/claims', icon: Receipt },
    { label: 'Reconciliation', path: '/reconciliation', icon: ArrowLeftRight },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
  ],
  ceo: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Clients Overview', path: '/clients-overview', icon: Users },
    { label: 'Incidents Overview', path: '/incidents-overview', icon: Eye },
    { label: 'Financial Summary', path: '/financial-summary', icon: BarChart3 },
    { label: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
    { label: 'Export Reports', path: '/export-reports', icon: Download },
  ],
};

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { role, setRole, signOut } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const items = navItems[role];

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setRoleSwitcherOpen(false);
    navigate('/dashboard');
  };

  const width = collapsed ? 'w-[56px]' : 'w-52';

  return (
    <aside className={cn('fixed left-0 top-0 z-30 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-200', width)}>
      {/* Logo */}
      <div className={cn('flex items-center border-b border-sidebar-border', collapsed ? 'justify-center px-2 py-3' : 'gap-2 px-4 py-3')}>
        <div className="flex items-center gap-1 text-sidebar-primary shrink-0">
          <Shield className="h-4.5 w-4.5" />
          {!collapsed && <Car className="h-4.5 w-4.5" />}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-sidebar-accent-foreground leading-tight">Tinlip Autocare</h2>
            <p className="text-[9px] uppercase tracking-wider text-sidebar-muted">{roleLabels[role]}</p>
          </div>
        )}
      </div>

      {/* Role Switcher */}
      {!collapsed && (
        <div className="relative border-b border-sidebar-border px-2 py-1.5">
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="flex w-full items-center justify-between rounded px-2 py-1 text-[11px] text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <span>Switch Role</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {roleSwitcherOpen && (
            <div className="absolute left-2 right-2 top-full z-50 mt-0.5 rounded border border-sidebar-border bg-sidebar shadow-lg">
              {(Object.keys(roleLabels) as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={cn(
                    'flex w-full items-center px-3 py-1.5 text-[11px] hover:bg-sidebar-accent',
                    r === role && 'text-sidebar-primary font-medium'
                  )}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {items.map(item => {
          const active = location.pathname === item.path;
          const linkContent = (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center rounded transition-colors',
                collapsed ? 'justify-center px-0 py-1.5' : 'gap-2.5 px-2.5 py-1.5',
                active
                  ? 'border-l-2 border-sidebar-primary bg-sidebar-primary/10 text-sidebar-primary font-medium'
                  : 'border-l-2 border-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                'text-[13px]'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="rounded-full bg-sidebar-primary px-1.5 py-0.5 text-[9px] font-semibold text-sidebar-primary-foreground leading-none">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-sidebar-primary" />
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="relative">{linkContent}</div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                  {item.badge ? ` (${item.badge})` : ''}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border px-2 py-1.5">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded py-1 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Logout */}
      <div className="border-t border-sidebar-border px-2 py-1.5">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => signOut()}
                className="flex w-full items-center justify-center rounded py-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Logout</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-[13px] text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
