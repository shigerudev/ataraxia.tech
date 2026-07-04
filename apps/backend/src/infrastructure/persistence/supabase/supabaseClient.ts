import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { assertSupabaseConfigured, env } from '../../config/env.js';

let serviceClient: SupabaseClient | null = null;

/** Cliente con service_role key (solo servidor; ignora RLS). */
export function getServiceClient(): SupabaseClient {
  assertSupabaseConfigured();
  if (!serviceClient) {
    serviceClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return serviceClient;
}
