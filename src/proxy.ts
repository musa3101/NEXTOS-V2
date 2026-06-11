import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('nextos_session')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login';
  const isApiAuth = pathname.startsWith('/api/auth');
  const isApiTelegram = pathname.startsWith('/api/telegram');
  const isApiHealth = pathname.startsWith('/api/health');

  // Skip static assets, background images, and brand logos
  if (
    pathname.includes('.') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/bg/') || 
    pathname === '/favicon.ico' || 
    pathname === '/logo1.png' || 
    pathname === '/logo2.jpg'
  ) {
    return NextResponse.next();
  }

  if (isApiAuth || isApiTelegram || isApiHealth) {
    return NextResponse.next();
  }

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/telegram|api/auth|api/health|_next/static|_next/image|favicon.ico).*)'],
};
