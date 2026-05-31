const EVO_URL = process.env.EVOLUTION_API_URL;
const EVO_KEY = process.env.EVOLUTION_API_KEY;
function evoHeaders() {
  return { 'Content-Type': 'application/json', 'apikey': EVO_KEY };
}

export async function POST(req) {
  if (!EVO_URL) return Response.json({ error: 'Evolution API não configurada' }, { status: 503 });
  const { instance, phone, message } = await req.json();
  if (!instance || !phone || !message) {
    return Response.json({ error: 'instance, phone e message são obrigatórios' }, { status: 400 });
  }
  const number = phone.replace(/\D/g, '');
  if (!number) return Response.json({ error: 'Telefone inválido' }, { status: 400 });
  try {
    const res = await fetch(`${EVO_URL}/message/sendText/${instance}`, {
      method: 'POST',
      headers: evoHeaders(),
      body: JSON.stringify({
        number: `55${number}`,
        text: message,
      }),
    });
    const data = await res.json();
    return Response.json(data, { status: res.ok ? 200 : 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
