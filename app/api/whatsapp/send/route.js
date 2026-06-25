const EVO_URL = process.env.EVOLUTION_API_URL;
const EVO_KEY = process.env.EVOLUTION_API_KEY;
function evoHeaders() {
  return { 'Content-Type': 'application/json', 'apikey': EVO_KEY };
}

function normalizeBrPhone(phone) {
  let n = phone.replace(/\D/g, '').replace(/^0+/, '');
  if (n.length >= 12) return n;
  return '55' + n;
}

export async function POST(req) {
  if (!EVO_URL) return Response.json({ error: 'Evolution API não configurada' }, { status: 503 });
  const { instance, phone, message } = await req.json();
  if (!instance || !phone || !message) {
    return Response.json({ error: 'instance, phone e message são obrigatórios' }, { status: 400 });
  }
  const number = normalizeBrPhone(phone);
  if (number.length < 12) return Response.json({ error: 'Telefone inválido' }, { status: 400 });
  try {
    const res = await fetch(`${EVO_URL}/message/sendText/${instance}`, {
      method: 'POST',
      headers: evoHeaders(),
      body: JSON.stringify({ number, text: message }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Repassa o corpo da resposta junto com o status HTTP original
      return Response.json(
        { ...data, _httpStatus: res.status, _instance: instance, _number: number },
        { status: res.status }
      );
    }
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message, _instance: instance, _number: number }, { status: 500 });
  }
}
