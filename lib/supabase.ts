
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pcyknguyfqjpwxahinun.supabase.co';
const supabaseKey = 'sb_publishable_tqEWbu2llnnAvcpmZPpGeg_nRLQsgpy';

export const supabase = createClient(supabaseUrl, supabaseKey);
