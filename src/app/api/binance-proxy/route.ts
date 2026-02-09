import { NextRequest, NextResponse } from 'next/server';
import { getBinanceBalance } from '@/lib/binance';

export const dynamic = 'force-dynamic';
// 이 함수는 vercel.json에서 미국 리전(iad1)으로 설정됨

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const balance = await getBinanceBalance();
    return NextResponse.json({ usdt: balance.usdt });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
