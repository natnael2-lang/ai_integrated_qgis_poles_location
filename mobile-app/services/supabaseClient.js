import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Same project as the backend uses -- only the public "anon" key goes in the
// mobile app (never the secret key, which stays server-side only).
const SUPABASE_URL = 'https://wjvgiivwtrovygyjpnrq.supabase.co';
const SUPABASE_ANON_KEY = 'PASTE_YOUR_PUBLISHABLE_ANON_KEY_HERE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
