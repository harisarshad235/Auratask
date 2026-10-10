import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zamtslutoccexvqjepqz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbXRzbHV0b2NjZXh2cWplcHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1OTg5NTIsImV4cCI6MjEwNzE3NDk1Mn0.Y6Chu7UiUD_qxGKQagmlVwZ6_VX3We4F57zs_pWLJFg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});