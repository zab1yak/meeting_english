import { NextResponse, type NextRequest } from 'next/server';

import { sessionCookieConfig } from './lib/access';

const cookieName = sessionCookieConfig(process.env).name;

/**
 * Оптимистичная проверка: без cookie сессии в закрытые разделы не пускаем.
 * В БД proxy не ходит (он срабатывает на каждый запрос, включая prefetch) —
 * действительность сессии и роль проверяет DAL в каждой странице и Server Action.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(cookieName)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const login = new URL('/login', request.url);
  login.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/teacher/:path*', '/student/:path*', '/change-password'],
};
