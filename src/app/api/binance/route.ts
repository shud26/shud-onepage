import { NextRequest, NextResponse } from 'next/server';
import { getBinanceBalance, withdrawUSDT, getDepositAddress } from '@/lib/binance';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const PIN = '1507';

// GET - Binance 잔고 + 입금 주소 조회
export async function GET(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get('pin');
  if (pin !== PIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [balance, depositAddress] = await Promise.all([
      getBinanceBalance(),
      getDepositAddress('TRX'),
    ]);

    return NextResponse.json({
      usdt: balance.usdt,
      depositAddress,
    });
  } catch (error) {
    console.error('Binance balance error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get Binance balance' },
      { status: 500 }
    );
  }
}

// POST - USDT 출금 (Binance → 업비트)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin, action, amount, address, network } = body;

    if (pin !== PIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action !== 'withdraw') {
      return NextResponse.json({ error: 'action must be withdraw' }, { status: 400 });
    }

    const withdrawAmount = Number(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 업비트 USDT 입금 주소 (환경변수 또는 요청에서)
    const targetAddress = address || process.env.UPBIT_USDT_DEPOSIT_ADDRESS;
    if (!targetAddress) {
      return NextResponse.json({ error: 'USDT deposit address required' }, { status: 400 });
    }

    const result = await withdrawUSDT(targetAddress, withdrawAmount, network || 'TRX');

    // 텔레그램 알림
    const emoji = result.success ? '📤' : '❌';
    const telegramMsg = result.success
      ? `${emoji} <b>Binance → 업비트 전송 요청</b>\n💰 ${withdrawAmount} USDT\n🌐 네트워크: ${network || 'TRC20'}\n📋 ${result.message}`
      : `${emoji} <b>Binance 전송 실패</b>\n💰 ${withdrawAmount} USDT\n❗ ${result.message}`;

    await sendTelegramMessage(telegramMsg);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Binance withdraw error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Withdraw failed' },
      { status: 500 }
    );
  }
}
