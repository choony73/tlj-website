import {NextRequest, NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {createSessionToken, isPasswordConfigured, COOKIE_NAME} from '@/lib/auth';

export async function POST(request: NextRequest) {
  if (!isPasswordConfigured()) {
    return NextResponse.json(
      {error: 'ADMIN_PASSWORD가 설정되지 않았습니다.'},
      {status: 500}
    );
  }
  const {password} = (await request.json().catch(() => ({}))) as {
    password?: string;
  };
  const expected = process.env.ADMIN_PASSWORD || '';
  const ok =
    typeof password === 'string' &&
    password.length === expected.length &&
    timingSafeEqual(Buffer.from(password), Buffer.from(expected));

  if (!ok) {
    return NextResponse.json({error: '비밀번호가 틀렸습니다.'}, {status: 401});
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ok: true});
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12
  });
  return res;
}
