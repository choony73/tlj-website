// 관리자 인증: ADMIN_PASSWORD 환경변수 + HMAC 서명 쿠키
import {timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';

const COOKIE_NAME = 'tlj_admin';
const encoder = new TextEncoder();

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || '';
}

export function isPasswordConfigured(): boolean {
  return getSecret().length > 0;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Buffer.from(sig).toString('hex');
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12시간
  const payload = `admin.${exp}`;
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token || !isPasswordConfigured()) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'admin') return false;
  const [_, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = await hmac(`admin.${expStr}`);
  return (
    sig.length === expected.length &&
    timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  );
}

export async function getSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export {COOKIE_NAME};
