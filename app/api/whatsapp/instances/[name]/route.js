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
    if (action === 'qrcode') url = `${EVO_URL}/instance/connect/${encodeURIComponent(name)}`;
    else if (action === 'disconnect') url = `${EVO_URL}/instance/logout/${encodeURIComponent(name)}`;
    else url = `${EVO_URL}/instance/connectionState/${encodeURIComponent(name)}`;

    const res = await fetch(url, { headers: evoHeaders() });
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
