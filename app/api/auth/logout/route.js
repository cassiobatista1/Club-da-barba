export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.set('Set-Cookie', 'crm_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  return res;
}
