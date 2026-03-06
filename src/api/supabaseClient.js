import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseJwtTemplate = import.meta.env.VITE_SUPABASE_JWT_TEMPLATE || 'supabase';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or anon key is not set.');
}

async function getAccessToken() {
  if (typeof window === 'undefined') return null;
  const clerk = window?.Clerk;
  if (!clerk) return null;

  try {
    if (!clerk.loaded && typeof clerk.load === 'function') {
      await clerk.load();
    }

    const tokenGetter =
      clerk?.session?.getToken ||
      clerk?.user?.getToken;

    if (typeof tokenGetter !== 'function') return null;

    const token = await tokenGetter.call(clerk.session || clerk.user, { template: supabaseJwtTemplate });
    return token || null;
  } catch (error) {
    console.warn('Supabase Clerk token fetch failed:', error?.message || error);
    return null;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: getAccessToken,
});
