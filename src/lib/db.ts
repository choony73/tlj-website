import {neon} from '@neondatabase/serverless';

// DATABASE_URL이 없으면 null → 공개 페이지는 menu.json 폴백,
// 관리자 쓰기 기능은 "DB 연결 필요" 안내를 보여줍니다.
const databaseUrl = process.env.DATABASE_URL;

export const sql = databaseUrl ? neon(databaseUrl) : null;
export const isDbConfigured = !!databaseUrl;
