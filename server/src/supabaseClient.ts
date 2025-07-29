import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Role Key must be provided in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // The service_role key should bypass RLS policies.
    // However, it's good practice to explicitly state this.
    autoRefreshToken: false,
    persistSession: false,
  },
});
