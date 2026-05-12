import { initDb } from '@/lib/db';

export async function GET(req, { params }) {
  const db = await initDb();
  const id = (await params).id;
  const { data, error } = await db.from('lead_history')
    .select('*').eq('lead_id', id).order('created_at', { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data || []);
}

export async function POST(req, { params }) {
  const db = await initDb();
  const id = (await params).id;
  const { obs, status } = await req.json();
  const { data, error } = await db.from('lead_history').insert({
    lead_id: parseInt(id), status: status || 'nota', obs: obs || ''
  }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
