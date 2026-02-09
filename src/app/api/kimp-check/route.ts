import { NextRequest, NextResponse } from 'next/server';
import { getUSDTPrice } from '@/lib/upbit';
import { sendTelegramWithButtons } from '@/lib/telegram';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const KIMP_SELL_THRESHOLD = 3;   // 3% 이상 → 매도 알림
const KIMP_BUY_THRESHOLD = -3;   // -3% 이하 → 매수 알림
const COOLDOWN_MS = 10 * 60 * 1000; // 10분 쿨다운

async function getBotState(key: string): Promise<string | null> {
  const { data } = await supabase
    .from('bot_state')
    .select('value')
    .eq('key', key)
    .single();
  return data?.value ?? null;
}

async function setBotState(key: string, value: string): Promise<void> {
  await supabase
    .from('bot_state')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 김프 계산
    const [usdtKrw, rateRes] = await Promise.all([
      getUSDTPrice(),
      fetch('https://api.exchangerate-api.com/v4/latest/USD').then(r => r.json()).catch(() => ({ rates: { KRW: 1350 } })),
    ]);

    const krwRate = rateRes.rates.KRW;
    const kimp = ((usdtKrw - krwRate) / krwRate) * 100;

    const now = Date.now();

    // 김프 >= 3%: 매도 알림
    if (kimp >= KIMP_SELL_THRESHOLD) {
      const lastSell = await getBotState('last_sell_alert');
      const lastSellTime = lastSell ? parseInt(lastSell, 10) : 0;

      if (now - lastSellTime > COOLDOWN_MS) {
        await setBotState('last_sell_alert', String(now));

        const text =
          `🔴 <b>김프 ${kimp.toFixed(2)}% 감지!</b>\n` +
          `\n` +
          `💱 업비트 USDT: ${usdtKrw.toLocaleString()}원\n` +
          `🌍 환율: ${krwRate.toFixed(0)}원/USD\n` +
          `📈 김프 높음 → USDT 매도 유리\n` +
          `\n` +
          `⚡ 매도 후 해외 전송 추천`;

        const buttons = [
          [
            { text: '매도 5만', callback_data: 'sell_50000' },
            { text: '매도 10만', callback_data: 'sell_100000' },
          ],
          [
            { text: '전송 50', callback_data: 'transfer_50' },
            { text: '전송 100', callback_data: 'transfer_100' },
          ],
          [{ text: '무시', callback_data: 'ignore' }],
        ];

        await sendTelegramWithButtons(text, buttons);

        return NextResponse.json({ checked: true, kimp: kimp.toFixed(2), alerted: true, direction: 'sell' });
      }
    }

    // 김프 <= -3%: 매수 알림
    if (kimp <= KIMP_BUY_THRESHOLD) {
      const lastBuy = await getBotState('last_buy_alert');
      const lastBuyTime = lastBuy ? parseInt(lastBuy, 10) : 0;

      if (now - lastBuyTime > COOLDOWN_MS) {
        await setBotState('last_buy_alert', String(now));

        const text =
          `🟢 <b>역김프 ${kimp.toFixed(2)}% 감지!</b>\n` +
          `\n` +
          `💱 업비트 USDT: ${usdtKrw.toLocaleString()}원\n` +
          `🌍 환율: ${krwRate.toFixed(0)}원/USD\n` +
          `📉 역김프 → USDT 매수 유리\n` +
          `\n` +
          `⚡ 해외에서 전송 후 매수 추천`;

        const buttons = [
          [
            { text: '매수 5만', callback_data: 'buy_50000' },
            { text: '매수 10만', callback_data: 'buy_100000' },
          ],
          [{ text: '무시', callback_data: 'ignore' }],
        ];

        await sendTelegramWithButtons(text, buttons);

        return NextResponse.json({ checked: true, kimp: kimp.toFixed(2), alerted: true, direction: 'buy' });
      }
    }

    // 정상 범위 - 알림 없음
    return NextResponse.json({ checked: true, kimp: kimp.toFixed(2), alerted: false });
  } catch (error) {
    console.error('Kimp check error:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
