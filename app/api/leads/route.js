import { initDb } from '@/lib/db';

export async function GET() {
  const db = await initDb();
  const { data, error } = await db.from('leads').select('*').order('id', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req) {
  const db = await initDb();
  const body = await req.json();
  const { nome, tel, carro, cidade, status, origem, valor, followup, exec, obs } = body;
  if (!nome?.trim()) return Response.json({ error: 'Nome é obrigatório' }, { status: 400 });

  const { data, error } = await db.from('leads').insert({
    nome: nome.trim(), tel: tel||'', carro: carro||'', cidade: cidade||'',
    status: status||'Novo', origem: origem||'Outros', valor: parseFloat(valor)||0,
    followup: followup||'', exec: exec||'Cássio', obs: obs||''
  }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
