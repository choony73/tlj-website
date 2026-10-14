import {NextRequest, NextResponse} from 'next/server';
import {getOrder} from '@/lib/orders';

// 공개 주문 조회 (추적용): 최소 정보만 반환
export async function GET(
  _request: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  const {id} = await params;
  const order = await getOrder(id.toUpperCase());
  if (!order) {
    return NextResponse.json(
      {error: '주문을 찾을 수 없습니다.'},
      {status: 404}
    );
  }
  return NextResponse.json({
    id: order.id,
    status: order.status,
    items: order.items,
    total_cad: order.total_cad,
    fulfillment: order.fulfillment,
    created_at: order.created_at
  });
}
