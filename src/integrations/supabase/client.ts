import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xpjqgcuywecqhkddncjq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwanFnY3V5d2VjcWhrZGRuY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDI2ODYsImV4cCI6MjA4ODcxODY4Nn0.YwDcaxS0DxP6rrfLjMe0ozrBGLJwQWF2znwmdCdlM9w';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});