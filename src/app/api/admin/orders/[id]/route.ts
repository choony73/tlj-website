import {NextRequest, NextResponse} from 'next/server';
import {getSession} from '@/lib/auth';
import {setOrderStatus} from '@/lib/orders';
import {isDbConfigured} from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  if (!(await getSession())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  if (!isDbConfigured) {
    return NextResponse.json({error: 'DB not configured'}, {status: 503});
  }
  const {id} = await params;
  const {status} = (await request.json().catch(() => ({}))) as {
    status?: string;
  };
  try {
    await setOrderStatus(id, status || '');
    return NextResponse.json({ok: true});
  } catch {
    return NextResponse.json({error: 'Invalid status'}, {status: 400});
  }
}
