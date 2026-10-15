import {NextRequest, NextResponse} from 'next/server';
import {getSession} from '@/lib/auth';
import {sql, isDbConfigured} from '@/lib/db';
import {getMenuItems, getCategories} from '@/lib/menu';

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

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const [items, categories] = await Promise.all([
    getMenuItems(),
    getCategories()
  ]);
  return NextResponse.json({items, categories});
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await request.json();
  const {
    slug,
    category,
    name_fr,
    name_en,
    price_cad,
    description_fr,
    description_en,
    image,
    available
  } = body;

  if (!slug || !category || !name_fr || price_cad == null) {
    return NextResponse.json({error: '필수 항목이 없습니다.'}, {status: 400});
  }

  await sql!`
    INSERT INTO menu_items
      (slug, category, name_fr, name_en, price_cad, description_fr, description_en, image, available)
    VALUES
      (${slug}, ${category}, ${name_fr}, ${name_en || null}, ${price_cad},
       ${description_fr || null}, ${description_en || null}, ${image || null}, ${available !== false})
  `;
  return NextResponse.json({ok: true, slug});
}
