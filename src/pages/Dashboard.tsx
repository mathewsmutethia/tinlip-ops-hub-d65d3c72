import { useRole } from '@/contexts/RoleContext';
import AMDashboard from './am/AMDashboard';
import FinanceDashboard from './finance/FinanceDashboard';
import CEODashboard from './ceo/CEODashboard';

export default function Dashboard() {
  const { role } = useRole();
  if (role === 'finance') return <FinanceDashboard />;
  if (role === 'ceo') return <CEODashboard />;
  return <AMDashboard />;
}
