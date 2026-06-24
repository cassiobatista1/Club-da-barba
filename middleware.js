import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'crm_session';

async function verifyToken(token, secret) {
  try {
    const dot = token.lastIndexOf('.');
    if (dot < 1) return false;
    const dataB64 = token.slice(0, dot);
    const sigB64  = token.slice(dot + 1);

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sig = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));
    const ok  = await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(dataB64));
    if (!ok) return false;

    const payload = JSON.parse(atob(dataB64));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function middleware(request) {
  try {
    const { pathname } = request.nextUrl;

    // Sempre passa: login, rotas de auth, assets Next.js e arquivos estáticos comuns
    if (
      pathname === '/login.html' ||
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/_next/') ||
      pathname === '/favicon.ico' ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.js') && !pathname.startsWith('/api/')
    ) {
      return NextResponse.next();
    }

    // Se as variáveis de auth não estiverem configuradas, passa sem verificar
    const secret   = process.env.CRM_SESSION_SECRET;
    const password = process.env.CRM_PASSWORD;
    if (!secret || !password) return NextResponse.next();

    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const valid = token ? await verifyToken(token, secret) : false;

    if (!valid) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Não autorizado — faça login em /login.html' }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/login.html';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    // Em qualquer erro inesperado no middleware, deixa passar (fail-open)
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
