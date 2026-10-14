import {NextRequest, NextResponse} from 'next/server';
import {getSession} from '@/lib/auth';
import {sql, isDbConfigured} from '@/lib/db';

async function requireAdmin() {
  if (!(await getSession())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  if (!isDbConfigured || !sql) {
    return NextResponse.json(
      {error: 'DB가 연결되지 않았습니다. DATABASE_URL을 설정하세요.'},
      {status: 503}
    );
  }
  return null;
}

export async function PUT(
  request: NextRequest,
  {params}: {params: Promise<{slug: string}>}
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const {slug} = await params;
  const body = await request.json();
  const {
    category,
    name_fr,
    name_en,
    price_cad,
    description_fr,
    description_en,
    available
  } = body;

  // 부분 업데이트 지원: 기존 행을 읽어 전달된 필드만 덮어씀
  const existing = await sql!`
    SELECT category, name_fr, name_en, price_cad, description_fr, description_en, available
    FROM menu_items WHERE slug = ${slug}
  `;
  if (existing.length === 0) {
    return NextResponse.json(
      {error: '메뉴를 찾을 수 없습니다.'},
      {status: 404}
    );
  }
  const cur = existing[0] as Record<string, unknown>;
  const merged = {
    category: category ?? cur.category,
    name_fr: name_fr ?? cur.name_fr,
    name_en: name_en !== undefined ? name_en || null : cur.name_en,
    price_cad: price_cad ?? cur.price_cad,
    description_fr:
      description_fr !== undefined ? description_fr || null : cur.description_fr,
    description_en:
      description_en !== undefined ? description_en || null : cur.description_en,
    available: available === undefined ? cur.available : available !== false
  };

  await sql!`
    UPDATE menu_items SET
      category = ${merged.category as string},
      name_fr = ${merged.name_fr as string},
      name_en = ${merged.name_en as string | null},
      price_cad = ${merged.price_cad as number},
      description_fr = ${merged.description_fr as string | null},
      description_en = ${merged.description_en as string | null},
      available = ${merged.available as boolean},
      updated_at = NOW()
    WHERE slug = ${slug}
  `;
  return NextResponse.json({ok: true});
}

export async function DELETE(
  _request: NextRequest,
  {params}: {params: Promise<{slug: string}>}
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const {slug} = await params;
  await sql!`DELETE FROM menu_items WHERE slug = ${slug}`;
  return NextResponse.json({ok: true});
}
