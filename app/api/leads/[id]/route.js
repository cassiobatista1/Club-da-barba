import { initDb } from '@/lib/db';

export async function PUT(req, { params }) {
  const db = await initDb();
  const id = (await params).id;
  const body = await req.json();
  const { nome, tel, carro, cidade, status, origem, valor, followup, exec, obs } = body;

  const { data: current } = await db.from('leads').select('status').eq('id', id).single();
  const statusChanged = current && current.status !== status;

  const updatePayload = {
    nome: nome||'', tel: tel||'', carro: carro||'', cidade: cidade||'',
    status: status||'Novo', origem: origem||'Outros', valor: parseFloat(valor)||0,
    followup: followup||'', exec: exec||'Cássio', obs: obs||''
  };
  if (statusChanged) updatePayload.status_at = new Date().toISOString();

  const { data, error } = await db.from('leads').update(updatePayload).eq('id', id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (statusChanged) {
    await db.from('lead_history').insert({ lead_id: parseInt(id), status, obs: obs||'' });
  }

  return Response.json(data);
}

export async function DELETE(req, { params }) {
  const db = await initDb();
  const id = (await params).id;
  const { error } = await db.from('leads').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
