import {NextResponse} from 'next/server';
import {getMenuItems} from '@/lib/menu';

// 장바구니 표시용 공개 API (가격은 서버에서만 신뢰)
export async function GET() {
  const items = await getMenuItems();
  return NextResponse.json({
    items: items
      .filter((i) => i.available)
      .map((i) => ({
        slug: i.slug,
        category: i.category,
        name_fr: i.name_fr,
        name_en: i.name_en,
        price_cad: i.price_cad,
        image: i.image
      }))
  });
}
