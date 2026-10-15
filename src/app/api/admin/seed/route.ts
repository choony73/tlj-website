import {NextResponse} from 'next/server';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {getSession} from '@/lib/auth';
import {sql, isDbConfigured} from '@/lib/db';

// 관리자 전용: DB 테이블 생성 + 메뉴 초기 데이터 입력
// Vercel에서 Neon 연동 후 이 엔드포인트를 한 번 호출하면 DB가 준비됨
export async function POST() {
  if (!(await getSession())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  if (!isDbConfigured || !sql) {
    return NextResponse.json(
      {error: 'DATABASE_URL이 설정되지 않았습니다.'},
      {status: 503}
    );
  }

  const data = JSON.parse(
    readFileSync(join(process.cwd(), 'src/data/menu.json'), 'utf-8')
  );

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY,
      name_fr TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description_fr TEXT,
      description_en TEXT,
      sort_order INT NOT NULL DEFAULT 0
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      slug TEXT PRIMARY KEY,
      category TEXT NOT NULL REFERENCES categories(slug),
      name_fr TEXT NOT NULL,
      name_en TEXT,
      price_cad NUMERIC(10,2) NOT NULL,
      description_fr TEXT,
      description_en TEXT,
      image TEXT,
      is_vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
      is_spicy BOOLEAN NOT NULL DEFAULT FALSE,
      is_gluten_free BOOLEAN NOT NULL DEFAULT FALSE,
      is_popular BOOLEAN NOT NULL DEFAULT FALSE,
      option_groups JSONB NOT NULL DEFAULT '[]',
      available BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      items JSONB NOT NULL,
      subtotal_cad NUMERIC(10,2) NOT NULL,
      delivery_fee_cad NUMERIC(10,2) NOT NULL DEFAULT 0,
      tax_cad NUMERIC(10,2) NOT NULL DEFAULT 0,
      total_cad NUMERIC(10,2) NOT NULL,
      fulfillment TEXT NOT NULL DEFAULT 'pickup',
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      delivery_address TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      stripe_payment_intent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // 이미 테이블이 있는 경우를 위한 방어적 컬럼 추가
  await sql`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS tax_cad NUMERIC(10,2) NOT NULL DEFAULT 0
  `;
  await sql`
    ALTER TABLE menu_items
      ADD COLUMN IF NOT EXISTS image TEXT,
      ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_spicy BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_popular BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS option_groups JSONB NOT NULL DEFAULT '[]'
  `;
  await sql`
    ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS description_fr TEXT,
      ADD COLUMN IF NOT EXISTS description_en TEXT
  `;

  for (const [idx, cat] of data.categories.entries()) {
    await sql`
      INSERT INTO categories (slug, name_fr, name_en, description_fr, description_en, sort_order)
      VALUES (${cat.slug}, ${cat.name_fr}, ${cat.name_en}, ${cat.description_fr}, ${cat.description_en}, ${idx})
      ON CONFLICT (slug) DO UPDATE
      SET name_fr = EXCLUDED.name_fr,
          name_en = EXCLUDED.name_en,
          description_fr = EXCLUDED.description_fr,
          description_en = EXCLUDED.description_en,
          sort_order = EXCLUDED.sort_order
    `;
  }

  let n = 0;
  for (const item of data.items) {
    await sql`
      INSERT INTO menu_items
        (slug, category, name_fr, name_en, price_cad, description_fr, description_en, image,
         is_vegetarian, is_spicy, is_gluten_free, is_popular, option_groups, available, sort_order)
      VALUES
        (${item.slug}, ${item.category}, ${item.name_fr}, ${item.name_en},
         ${item.price_cad}, ${item.description_fr}, ${item.description_en},
         ${item.image}, ${item.is_vegetarian || false}, ${item.is_spicy || false},
         ${item.is_gluten_free || false}, ${item.is_popular || false},
         ${JSON.stringify(item.option_groups || [])}, ${item.available}, ${n})
      ON CONFLICT (slug) DO UPDATE
      SET category = EXCLUDED.category,
          name_fr = EXCLUDED.name_fr,
          name_en = EXCLUDED.name_en,
          price_cad = EXCLUDED.price_cad,
          description_fr = EXCLUDED.description_fr,
          description_en = EXCLUDED.description_en,
          image = EXCLUDED.image,
          is_vegetarian = EXCLUDED.is_vegetarian,
          is_spicy = EXCLUDED.is_spicy,
          is_gluten_free = EXCLUDED.is_gluten_free,
          is_popular = EXCLUDED.is_popular,
          option_groups = EXCLUDED.option_groups,
          available = EXCLUDED.available,
          updated_at = NOW()
    `;
    n++;
  }

  return NextResponse.json({
    ok: true,
    categories: data.categories.length,
    items: n
  });
}
