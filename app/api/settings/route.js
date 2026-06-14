import { initDb } from '@/lib/db';

export async function GET(req) {
  const db = await initDb();
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key') || 'pipelineCols';
  const { data, error } = await db.from('settings').select('value').eq('key', key).single();
  if (error || !data) return Response.json(null);
  // Handle both TEXT (string) and JSONB (object) column types
  try {
    const value = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    return Response.json(value);
  } catch {
    return Response.json(null);
  }
}

export async function PUT(req) {
  const db = await initDb();
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key') || 'pipelineCols';
  const body = await req.json();
  const { error } = await db.from('settings').upsert(
    { key, value: JSON.stringify(body) },
    { onConflict: 'key' }
  );
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
