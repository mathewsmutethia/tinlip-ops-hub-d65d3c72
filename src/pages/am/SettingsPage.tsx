import { useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/contexts/RoleContext';
import { useToast } from '@/hooks/use-toast';
import { Lock, User } from 'lucide-react';

export default function SettingsPage() {
  const { user, role } = useRole();
  const { toast } = useToast();
  const [passwordCooldown, setPasswordCooldown] = useState(false);

  const email = user?.email ?? '';

  const handleChangePassword = async () => {
    if (passwordCooldown || !email) return;
    setPasswordCooldown(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      toast({ title: 'Reset email sent', description: `Check your inbox at ${email}` });
    } catch {
      toast({ title: 'Failed to send reset email', variant: 'destructive' });
      setPasswordCooldown(false);
      return;
    }
    setTimeout(() => setPasswordCooldown(false), 60000);
  };

  const roleLabel: Record<string, string> = {
    account_manager: 'Account Manager',
    finance: 'Finance',
    ceo: 'CEO',
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Settings' }]} />
      <h1 className="text-xl font-semibold mb-5">Settings</h1>

      <div className="max-w-md space-y-4">
        {/* Profile Info */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" /> Account
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{email || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">{roleLabel[role] ?? role}</span>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" /> Security
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            A password reset link will be sent to your email address.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleChangePassword}
            disabled={passwordCooldown || !email}
          >
            {passwordCooldown ? 'Reset email sent — check inbox' : 'Change Password'}
          </Button>
        </div>
      </div>
    </div>
  );
}
