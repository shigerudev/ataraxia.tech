import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { assertSupabaseConfigured, env } from '../../config/env.js';

let serviceClient: SupabaseClient | null = null;

/** Cliente con service_role key (solo servidor; ignora RLS). */
export function getServiceClient(): SupabaseClient {
  assertSupabaseConfigured();
  if (!serviceClient) {
    serviceClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      // No usamos Realtime, pero supabase-js inicializa su cliente en el
      // constructor y necesita WebSocket (ausente en Node < 22).
      realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
    });
  }
  return serviceClient;
}
