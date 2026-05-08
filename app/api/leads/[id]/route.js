import { initDb } from '@/lib/db';

export async function PUT(req, { params }) {
  const db = await initDb();
  const id = (await params).id;
  const body = await req.json();
  const { nome, tel, carro, cidade, status, origem, valor, followup, exec, obs } = body;

  await db.execute({
    sql: `UPDATE leads SET nome=?, tel=?, carro=?, cidade=?, status=?, origem=?, valor=?, followup=?, exec=?, obs=?
          WHERE id=?`,
    args: [nome||'', tel||'', carro||'', cidade||'', status||'Novo', origem||'Outros',
           parseFloat(valor)||0, followup||'', exec||'Cássio', obs||'', id],
  });

  const updated = await db.execute({ sql: 'SELECT * FROM leads WHERE id = ?', args: [id] });
  return Response.json(updated.rows[0]);
}

export async function DELETE(req, { params }) {
  const db = await initDb();
  const id = (await params).id;
  await db.execute({ sql: 'DELETE FROM leads WHERE id = ?', args: [id] });
  return Response.json({ ok: true });
}
