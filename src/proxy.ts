import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { nextAuthAuth } from '@/lib/auth/auth-options';

const LOCALE_COOKIE = 'yb_lang';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return;
  }

  const localeCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const hasLocale = pathname.startsWith('/ar') || pathname.startsWith('/en');

  // Admin route protection
  const isAdminPage = /^\/(ar|en)\/admin/.test(pathname);
  if (isAdminPage) {
    const session = await nextAuthAuth();

    if (!session?.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (!hasLocale) {
    const preferredLocale = localeCookie || 'ar';
    const url = new URL(`/${preferredLocale}${pathname}`, request.url);
    if (request.nextUrl.search) url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  if (!localeCookie) {
    response.cookies.set(LOCALE_COOKIE, pathname.split('/')[1], {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
