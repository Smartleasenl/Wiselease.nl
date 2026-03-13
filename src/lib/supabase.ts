import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jtntbwioxszeocumgvzk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bnRid2lveHN6ZW9jdW1ndnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDE3OTksImV4cCI6MjA4ODgxNzc5OX0.F-oBtMLXOpqQcPHrJnSi9vJSulkqb3ys6ryCFD_h9tI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Dit zorgt ervoor dat de sessie bewaard blijft (localStorage)
    // en dat Chrome aanbiedt om wachtwoord op te slaan
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
