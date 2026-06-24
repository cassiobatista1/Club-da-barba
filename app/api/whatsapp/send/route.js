const EVO_URL = process.env.EVOLUTION_API_URL;
const EVO_KEY = process.env.EVOLUTION_API_KEY;
function evoHeaders() {
  return { 'Content-Type': 'application/json', 'apikey': EVO_KEY };
}

// Normalize Brazilian phone to E.164 format (55XXXXXXXXXXX)
// Handles numbers stored with or without the 55 country code
function normalizeBrPhone(phone) {
  let n = phone.replace(/\D/g, '').replace(/^0+/, '');
  // >= 12 digits means country code already present (55 + DDD + number)
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
    const data = await res.json();
    // Falha: HTTP não-ok OU resposta com campos de erro explícitos
    if (!res.ok || data?.status === 'error' || data?.error || data?.response?.error) {
      return Response.json(data, { status: res.ok ? 400 : res.status });
    }
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
