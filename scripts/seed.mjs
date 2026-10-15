// DB 시드 스크립트: 테이블 생성 + src/data/menu.json 내용 입력
// 실행: DATABASE_URL=postgres://... npm run seed
import {neon} from '@neondatabase/serverless';
import {readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL 환경변수가 필요합니다.');
  process.exit(1);
}

const sql = neon(databaseUrl);
const data = JSON.parse(
  readFileSync(join(root, 'src/data/menu.json'), 'utf-8')
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
       ${item.image}, ${item.is_vegetarian}, ${item.is_spicy}, ${item.is_gluten_free},
       ${item.is_popular}, ${JSON.stringify(item.option_groups || [])},
       ${item.available}, ${n})
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

console.log(`시드 완료: 카테고리 ${data.categories.length}개, 메뉴 ${n}개`);
