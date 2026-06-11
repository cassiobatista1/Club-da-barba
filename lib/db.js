import { createClient } from '@supabase/supabase-js';

let _client = null;

export function getDb() {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas. ' +
      'Adicione-as em Vercel → Settings → Environment Variables.'
    );
  }

  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export async function initDb() { return getDb(); }
