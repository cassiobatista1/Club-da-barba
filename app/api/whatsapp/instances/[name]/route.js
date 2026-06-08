const EVO_URL = process.env.EVOLUTION_API_URL;
const EVO_KEY = process.env.EVOLUTION_API_KEY;
function evoHeaders() {
  return { 'Content-Type': 'application/json', 'apikey': EVO_KEY };
}

// GET /api/whatsapp/instances/[name]?action=qrcode|status|connect|disconnect[&number=5511...]
// Passing ?number=5511... to action=qrcode triggers Evolution API to return a pairingCode
// instead of (or alongside) the QR code — uses Baileys requestPairingCode internally.
export async function GET(req, { params }) {
  if (!EVO_URL) return Response.json({ error: 'Evolution API não configurada' }, { status: 503 });
  const { name } = await params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'status';
  const number = searchParams.get('number') || '';

  try {
    let url;
    if (action === 'qrcode') {
      url = number
        ? `${EVO_URL}/instance/connect/${encodeURIComponent(name)}?number=${encodeURIComponent(number)}`
        : `${EVO_URL}/instance/connect/${encodeURIComponent(name)}`;
    } else if (action === 'disconnect') {
      url = `${EVO_URL}/instance/logout/${encodeURIComponent(name)}`;
    } else {
      url = `${EVO_URL}/instance/connectionState/${encodeURIComponent(name)}`;
    }

    const res = await fetch(url, { headers: evoHeaders() });
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
