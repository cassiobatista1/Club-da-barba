import { initDb } from '@/lib/db';

export async function DELETE(req, { params }) {
  const db = await initDb();
  const id = (await params).id;
  const { error } = await db.from('vendas').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
