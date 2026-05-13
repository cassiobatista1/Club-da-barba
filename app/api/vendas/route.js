import { initDb } from '@/lib/db';

export async function GET() {
  const db = await initDb();
  const { data, error } = await db.from('vendas').select('*').order('id', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req) {
  const db = await initDb();
  const body = await req.json();
  const { cliente, data: dataVenda, carro, plano, valor, origem, exec } = body;
  if (!cliente?.trim()) return Response.json({ error: 'Cliente é obrigatório' }, { status: 400 });

  const { data, error } = await db.from('vendas').insert({
    cliente: cliente.trim(),
    data: dataVenda || new Date().toISOString().split('T')[0],
    carro: carro||'', plano: plano||'Completo', valor: parseFloat(valor)||0,
    origem: origem||'Outros', exec: exec||'Cássio'
  }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
