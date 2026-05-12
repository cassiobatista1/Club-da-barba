import { initDb } from '@/lib/db';

export async function DELETE(req, { params }) {
  const db = await initDb();
  const id = (await params).id;
  await db.execute({ sql: 'DELETE FROM vendas WHERE id = ?', args: [id] });
  return Response.json({ ok: true });
}
