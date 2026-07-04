import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en apps/frontend/.env',
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}

/** Garantiza una sesión anónima y devuelve el access token. */
export async function ensureAnonymousSession(): Promise<string> {
  const supabase = getSupabase();
  const { data: existing } = await supabase.auth.getSession();
  if (existing.session?.access_token) return existing.session.access_token;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.session) {
    throw new Error(error?.message ?? 'No se pudo crear la sesión anónima');
  }
  return data.session.access_token;
}
