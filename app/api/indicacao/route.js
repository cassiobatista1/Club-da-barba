import { initDb } from '@/lib/db';

export async function POST(req) {
  try {
    const { nome, placa, uso, tel, ref } = await req.json();

    if (!nome?.trim() || !placa?.trim() || !uso) {
      return Response.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const db = await initDb();

    const { data, error } = await db.from('leads').insert({
      nome: nome.trim(),
      tel: tel?.trim() || '',
      carro: placa.trim().toUpperCase(),
      cidade: '',
      status: 'Novo',
      origem: `QR-${ref || 'direto'}`,
      valor: 0,
      followup: '',
      exec: '',
      obs: `Uso do veículo: ${uso} | Captado via QR Code`,
      status_at: new Date().toISOString(),
    }).select().single();

    if (error) throw error;

    return Response.json({ ok: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error('[indicacao]', err);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}
