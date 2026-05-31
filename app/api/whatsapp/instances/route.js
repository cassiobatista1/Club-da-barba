const EVO_URL = process.env.EVOLUTION_API_URL;
const EVO_KEY = process.env.EVOLUTION_API_KEY;

function evoHeaders() {
  return { 'Content-Type': 'application/json', 'apikey': EVO_KEY };
}

export async function GET() {
  if (!EVO_URL) return Response.json({ error: 'Evolution API não configurada' }, { status: 503 });
  try {
    const res = await fetch(`${EVO_URL}/instance/fetchInstances`, { headers: evoHeaders() });
    const data = await res.json();
    return Response.json(Array.isArray(data) ? data : []);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!EVO_URL) return Response.json({ error: 'Evolution API não configurada' }, { status: 503 });
  const { name } = await req.json();
  if (!name?.trim()) return Response.json({ error: 'Nome obrigatório' }, { status: 400 });
  try {
    const res = await fetch(`${EVO_URL}/instance/create`, {
      method: 'POST',
      headers: evoHeaders(),
      body: JSON.stringify({
        instanceName: name.trim(),
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    });
    const data = await res.json();
    return Response.json(data, { status: res.ok ? 201 : 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!EVO_URL) return Response.json({ error: 'Evolution API não configurada' }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  if (!name) return Response.json({ error: 'Nome obrigatório' }, { status: 400 });
  try {
    const res = await fetch(`${EVO_URL}/instance/delete/${name}`, {
      method: 'DELETE', headers: evoHeaders(),
    });
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
