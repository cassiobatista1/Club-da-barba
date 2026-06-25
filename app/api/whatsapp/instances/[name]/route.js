const EVO_URL = process.env.EVOLUTION_API_URL;
const EVO_KEY = process.env.EVOLUTION_API_KEY;
function evoHeaders() {
  return { 'Content-Type': 'application/json', 'apikey': EVO_KEY };
}

// GET /api/whatsapp/instances/[name]?action=qrcode|status|disconnect
export async function GET(req, { params }) {
  if (!EVO_URL) return Response.json({ error: 'Evolution API não configurada' }, { status: 503 });
  const { name } = await params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'status';

  try {
    let url;
    let method = 'GET';
    if (action === 'qrcode') {
      url = `${EVO_URL}/instance/connect/${encodeURIComponent(name)}`;
    } else if (action === 'disconnect') {
      // Evolution API v2 usa DELETE para logout
      url = `${EVO_URL}/instance/logout/${encodeURIComponent(name)}`;
      method = 'DELETE';
    } else {
      url = `${EVO_URL}/instance/connectionState/${encodeURIComponent(name)}`;
    }

    const res = await fetch(url, { method, headers: evoHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // No logout: "Connection Closed" significa que já estava desconectada — tratar como sucesso
      if (action === 'disconnect') {
        const msg = JSON.stringify(data?.response?.message || data?.message || '');
        if (/connection closed|error connection/i.test(msg)) {
          return Response.json({ ok: true, alreadyDisconnected: true });
        }
      }
      return Response.json(data, { status: res.status });
    }
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/whatsapp/instances/[name] — gera código de pareamento (sem câmera)
export async function POST(req, { params }) {
  if (!EVO_URL) return Response.json({ error: 'Evolution API não configurada' }, { status: 503 });
  const { name } = await params;
  const body = await req.json().catch(() => ({}));
  const phone = (body.phone || '').replace(/\D/g, '');
  if (!phone) return Response.json({ error: 'phone obrigatório' }, { status: 400 });
  try {
    const res = await fetch(`${EVO_URL}/instance/pairingCode/${name}`, {
      method: 'POST',
      headers: evoHeaders(),
      body: JSON.stringify({ number: phone }),
    });
    const data = await res.json();
    return Response.json(data, { status: res.ok ? 200 : 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
