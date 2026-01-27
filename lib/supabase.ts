
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gdauerizfcphpscxkynx.supabase.co';
const supabaseKey = 'sb_publishable_47GWl1LcWaYzucJPkT3nPw_7FrlHBIB';

export const supabase = createClient(supabaseUrl, supabaseKey);
