import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import {getMenuItems} from '@/lib/menu';
import {createOrder, generateOrderId, type OrderLine} from '@/lib/orders';
import {isDbConfigured} from '@/lib/db';

const DELIVERY_FEE_CAD = 4.99;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  if (!isDbConfigured) {
    return NextResponse.json(
      {error: 'DB가 연결되지 않았습니다.'},
      {status: 503}
    );
  }
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {error: 'Stripe가 설정되지 않았습니다.'},
      {status: 503}
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({error: '잘못된 요청입니다.'}, {status: 400});
  }

  const {lines, fulfillment, customer} = body as {
    lines: {
      slug: string;
      qty: number;
      options?: {group_fr: string; option_fr: string; price_delta: number}[];
    }[];
    fulfillment: 'pickup' | 'delivery';
    customer: {
      name: string;
      phone: string;
      email?: string;
      address?: string;
      notes?: string;
    };
  };

  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json(
      {error: '장바구니가 비어 있습니다.'},
      {status: 400}
    );
  }
  if (!customer?.name?.trim() || !customer?.phone?.trim()) {
    return NextResponse.json(
      {error: '이름과 전화번호를 입력해 주세요.'},
      {status: 400}
    );
  }
  if (fulfillment === 'delivery' && !customer?.address?.trim()) {
    return NextResponse.json(
      {error: '배달 주소를 입력해 주세요.'},
      {status: 400}
    );
  }

  // 서버에서 가격 검증 (클라이언트 가격을 신뢰하지 않음)
  const menu = await getMenuItems();
  const bySlug = new Map(menu.map((m) => [m.slug, m]));
  const orderLines: OrderLine[] = [];
  for (const l of lines) {
    const item = bySlug.get(l.slug);
    const qty = Math.min(99, Math.max(1, Math.floor(Number(l.qty) || 0)));
    if (!item || !item.available || qty <= 0) {
      return NextResponse.json(
        {error: `주문할 수 없는 메뉴가 있습니다: ${l.slug}`},
        {status: 400}
      );
    }
    // 옵션 검증: 서버의 옵션 정의와 대조해 가격을 다시 계산
    const validOptions: OrderLine['options'] = [];
    const groups = item.option_groups || [];
    for (const sel of l.options || []) {
      const g = groups.find((gg) => gg.name_fr === sel.group_fr);
      const o = g?.options.find((oo) => oo.name_fr === sel.option_fr);
      if (!g || !o) {
        return NextResponse.json(
          {error: `잘못된 옵션입니다: ${l.slug}`},
          {status: 400}
        );
      }
      validOptions.push({
        group_fr: g.name_fr,
        option_fr: o.name_fr,
        price_delta: o.price_delta
      });
    }
    // 필수 옵션 누락 검사
    for (const g of groups) {
      if (
        g.required &&
        !validOptions.some((v) => v.group_fr === g.name_fr)
      ) {
        return NextResponse.json(
          {error: `필수 옵션을 선택해 주세요: ${item.name_fr}`},
          {status: 400}
        );
      }
    }
    const unitPrice =
      item.price_cad +
      validOptions.reduce((s, o) => s + o.price_delta, 0);
    orderLines.push({
      slug: item.slug,
      name_fr: item.name_fr,
      qty,
      unit_price_cad: Math.round(unitPrice * 100) / 100,
      options: validOptions
    });
  }

  const subtotal = orderLines.reduce(
    (n, l) => n + l.qty * l.unit_price_cad,
    0
  );
  const deliveryFee = fulfillment === 'delivery' ? DELIVERY_FEE_CAD : 0;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  const orderId = generateOrderId();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: 'cad',
    metadata: {order_id: orderId},
    description: `Tous Les Jours - ${orderId}`
  });

  await createOrder({
    id: orderId,
    items: orderLines,
    subtotal_cad: subtotal,
    delivery_fee_cad: deliveryFee,
    total_cad: total,
    fulfillment,
    customer_name: customer.name.trim(),
    customer_phone: customer.phone.trim(),
    customer_email: customer.email?.trim() || null,
    delivery_address:
      fulfillment === 'delivery' ? customer.address!.trim() : null,
    notes: customer.notes?.trim() || null,
    stripe_payment_intent: paymentIntent.id
  });

  return NextResponse.json({
    orderId,
    clientSecret: paymentIntent.client_secret
  });
}
