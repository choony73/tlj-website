import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing';
import {verifySessionToken, COOKIE_NAME} from './lib/auth';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // 관리자 영역: 로그인 페이지 통과, 나머지는 세션 검사 후 통과 (intl 미들웨어 제외)
  if (pathname.startsWith('/admin')) {
    if (pathname !== '/admin/login') {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (!(await verifySessionToken(token))) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // api, 정적 파일 제외. /admin 은 위에서 직접 처리.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)'
};
