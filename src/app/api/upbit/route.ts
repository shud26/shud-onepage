import { NextRequest, NextResponse } from 'next/server';
import { getBalance, getUSDTPrice, buyUSDT, sellUSDT } from '@/lib/upbit';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const PIN = '1507';

// GET - 잔고 조회
export async function GET(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get('pin');
  if (pin !== PIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [balance, usdtPrice] = await Promise.all([
      getBalance(),
      getUSDTPrice(),
    ]);

    return NextResponse.json({
      krw: balance.krw,
      usdt: balance.usdt,
      usdtPrice,
    });
  } catch (error) {
    console.error('Upbit balance error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get balance' },
      { status: 500 }
    );
  }
}

// POST - 주문 실행
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin, action, amount } = body;

    if (pin !== PIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!action || !amount) {
      return NextResponse.json({ error: 'action and amount required' }, { status: 400 });
    }

    if (action !== 'buy' && action !== 'sell') {
      return NextResponse.json({ error: 'action must be buy or sell' }, { status: 400 });
    }

    const krwAmount = Number(amount);
    if (isNaN(krwAmount) || krwAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    let result;
    if (action === 'buy') {
      result = await buyUSDT(krwAmount);
    } else {
      result = await sellUSDT(krwAmount);
    }

    // 텔레그램 알림
    const emoji = result.success ? (action === 'buy' ? '🟢' : '🔴') : '❌';
    const actionText = action === 'buy' ? '매수' : '매도';
    const telegramMsg = result.success
      ? `${emoji} <b>USDT ${actionText} 완료</b>\n💰 금액: ${krwAmount.toLocaleString()}원\n📋 ${result.message}`
      : `${emoji} <b>USDT ${actionText} 실패</b>\n💰 금액: ${krwAmount.toLocaleString()}원\n❗ ${result.message}`;

    await sendTelegramMessage(telegramMsg);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upbit order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Order failed' },
      { status: 500 }
    );
  }
}
