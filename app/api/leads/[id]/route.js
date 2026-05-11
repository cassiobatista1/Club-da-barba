import { initDb } from '@/lib/db';

export async function PUT(req, { params }) {
  const db = await initDb();
  const id = (await params).id;
  const body = await req.json();
  const { nome, tel, carro, cidade, status, origem, valor, followup, exec, obs } = body;

  const { data, error } = await db.from('leads').update({
    nome: nome||'', tel: tel||'', carro: carro||'', cidade: cidade||'',
    status: status||'Novo', origem: origem||'Outros', valor: parseFloat(valor)||0,
    followup: followup||'', exec: exec||'Cássio', obs: obs||''
  }).eq('id', id).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(req, { params }) {
  const db = await initDb();
  const id = (await params).id;
  const { error } = await db.from('leads').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
