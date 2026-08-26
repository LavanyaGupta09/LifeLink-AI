import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bmxtdvqyjtdozglbcbst.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sbp_mock_key';

export const supabase = createClient(supabaseUrl, supabaseKey, { 
  auth: { 
    experimental: { 
      passkey: true 
    } 
  } 
});
