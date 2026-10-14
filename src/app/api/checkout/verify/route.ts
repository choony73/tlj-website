import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import {getOrder, markOrderPaid} from '@/lib/orders';

// 결제 완료 후 확인 페이지에서 호출: Stripe에 PaymentIntent 상태를 확인하고
// succeeded면 주문을 paid로 변경
export async function POST(request: NextRequest) {
  const {orderId, paymentIntentId} = (await request.json().catch(
    () => ({})
  )) as {orderId?: string; paymentIntentId?: string};

  if (!orderId || !paymentIntentId) {
    return NextResponse.json({error: '잘못된 요청입니다.'}, {status: 400});
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      {error: 'Stripe가 설정되지 않았습니다.'},
      {status: 503}
    );
  }

  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json(
      {error: '주문을 찾을 수 없습니다.'},
      {status: 404}
    );
  }

  const stripe = new Stripe(key);
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (pi.status === 'succeeded') {
    await markOrderPaid(orderId, paymentIntentId);
    const updated = await getOrder(orderId);
    return NextResponse.json({ok: true, order: updated});
  }

  return NextResponse.json(
    {ok: false, status: pi.status},
    {status: 402}
  );
}
