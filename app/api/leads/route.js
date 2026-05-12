import { initDb } from '@/lib/db';

export async function GET() {
  const db = await initDb();
  const result = await db.execute('SELECT * FROM leads ORDER BY id DESC');
  return Response.json(result.rows);
}

export async function POST(req) {
  const db = await initDb();
  const body = await req.json();
  const { nome, tel, carro, cidade, status, origem, valor, followup, exec, obs } = body;
  if (!nome?.trim()) return Response.json({ error: 'Nome é obrigatório' }, { status: 400 });

  const result = await db.execute({
    sql: `INSERT INTO leads (nome, tel, carro, cidade, status, origem, valor, followup, exec, obs)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [nome.trim(), tel||'', carro||'', cidade||'', status||'Novo', origem||'Outros',
           parseFloat(valor)||0, followup||'', exec||'Cássio', obs||''],
  });

  const newLead = await db.execute({ sql: 'SELECT * FROM leads WHERE id = ?', args: [result.lastInsertRowid] });
  return Response.json(newLead.rows[0], { status: 201 });
}
