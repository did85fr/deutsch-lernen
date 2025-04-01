import { createClient } from '@supabase/supabase-js';

console.log("=== Supabase Client Debug ===");
console.log("Initializing Supabase with URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Has ANON_KEY:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log("==========================");

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'sb-yofexqdswetgoscpwmjz-auth-token'
  }
});




