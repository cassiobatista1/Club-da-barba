const SESSION_COOKIE = 'crm_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days (seconds)

async function createToken(secret) {
  const payload = { u: 'cassio', exp: Date.now() + SESSION_MAX_AGE * 1000 };
  const dataB64 = btoa(JSON.stringify(payload));

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig    = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dataB64));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));

  return `${dataB64}.${sigB64}`;
}

export async function POST(req) {
  const secret   = process.env.CRM_SESSION_SECRET;
  const expected = process.env.CRM_PASSWORD;

  if (!secret || !expected) {
    return Response.json({ error: 'Autenticação não configurada no servidor' }, { status: 503 });
  }

  const { password } = await req.json();

  if (!password || password !== expected) {
    return Response.json({ error: 'Senha incorreta' }, { status: 401 });
  }

  const token = await createToken(secret);

  const res = Response.json({ ok: true });
  res.headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE}`
  );
  return res;
}
