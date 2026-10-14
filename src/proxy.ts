import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // locale 처리가 필요 없는 경로 제외: api, 정적 파일, 관리자
  matcher: '/((?!api|_next|_vercel|admin|.*\\..*).*)'
};
