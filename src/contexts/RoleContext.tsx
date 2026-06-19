import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'account_manager' | 'finance' | 'ceo';

const VALID_ROLES: UserRole[] = ['account_manager', 'finance', 'ceo'];

function resolveRole(raw: unknown): UserRole {
  return VALID_ROLES.includes(raw as UserRole) ? (raw as UserRole) : 'account_manager';
}

interface RoleContextType {
  role: UserRole;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: 'account_manager',
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  session: null,
  signOut: async () => {},
  loading: true,
});

export const useRole = () => useContext(RoleContext);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('account_manager');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setIsLoggedIn(true);
        setRole(resolveRole(session.user.app_metadata?.role));
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      if (session?.user) {
        setRole(resolveRole(session.user.app_metadata?.role));
      } else {
        setRole('account_manager');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setSession(null);
    setRole('account_manager');
  };

  return (
    <RoleContext.Provider value={{ role, isLoggedIn, setIsLoggedIn, user, session, signOut, loading }}>
      {children}
    </RoleContext.Provider>
  );
};
