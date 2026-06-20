import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    const timer = setTimeout(() => setExpired(true), 8000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleReset = async () => {
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/.test(password);
    if (!strong) {
      toast.error('Password must be at least 12 characters with an uppercase letter, number, and symbol');
      return;
    }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error('Failed to update password. Please request a new reset link.');
    } else {
      setDone(true);
      await supabase.auth.signOut();
      setTimeout(() => navigate('/'), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar">
      <div className="w-full max-w-sm rounded-xl bg-card p-8 shadow-lg">
        {done ? (
          <div className="text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
            <p className="font-semibold text-foreground">Password updated</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </div>
        ) : !ready && expired ? (
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="font-semibold text-foreground">Link expired or invalid</p>
            <p className="text-sm text-muted-foreground">Request a new password reset from the login page.</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>Back to Login</Button>
          </div>
        ) : !ready ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Verifying reset link...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col items-center gap-2">
              <Lock className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Set New Password</h1>
              <p className="text-sm text-muted-foreground text-center">Choose a strong password for your admin account.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleReset(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
