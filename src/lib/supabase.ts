import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bcjbghqrdlzwxgfuuxss.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjamJnaHFyZGx6d3hnZnV1eHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTUzNDksImV4cCI6MjA4NzY5MTM0OX0.TboqxP8kTiJgouaO5zZJdvbki07HK6M0FPj6uo5uG-M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Dit zorgt ervoor dat de sessie bewaard blijft (localStorage)
    // en dat Chrome aanbiedt om wachtwoord op te slaan
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
