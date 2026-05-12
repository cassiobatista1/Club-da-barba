import { initDb } from '@/lib/db';

export async function GET() {
  const db = await initDb();
  const result = await db.execute('SELECT * FROM vendas ORDER BY id DESC');
  return Response.json(result.rows);
}

export async function POST(req) {
  const db = await initDb();
  const body = await req.json();
  const { cliente, data, carro, plano, valor, origem, exec } = body;
  if (!cliente?.trim()) return Response.json({ error: 'Cliente é obrigatório' }, { status: 400 });

  const result = await db.execute({
    sql: `INSERT INTO vendas (cliente, data, carro, plano, valor, origem, exec)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [cliente.trim(), data || new Date().toISOString().split('T')[0],
           carro||'', plano||'Completo', parseFloat(valor)||0, origem||'Outros', exec||'Cássio'],
  });

  const newVenda = await db.execute({ sql: 'SELECT * FROM vendas WHERE id = ?', args: [result.lastInsertRowid] });
  return Response.json(newVenda.rows[0], { status: 201 });
}
