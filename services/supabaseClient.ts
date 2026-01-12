import { createClient } from '@supabase/supabase-js';

// URL do seu projeto Supabase
const SUPABASE_URL = 'https://zjztlkojehpglalcehno.supabase.co';

// Chave Pública (Anon Key) fornecida
const SUPABASE_ANON_KEY = 'sb_publishable_fOsCcyJJZSFBWq_CYrcfpw_NPL3qXMR'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);