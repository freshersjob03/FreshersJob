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
  const session = clerk?.session;
  if (!session?.getToken) return null;

  try {
    const token = await session.getToken({ template: supabaseJwtTemplate });
    return token || null;
  } catch {
    return null;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: getAccessToken,
});
