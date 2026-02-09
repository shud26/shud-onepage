import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramWithButtons } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const PIN = '1507';

// POST - 김프 알림 + 인라인 버튼 전송
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin, kimp, direction, emoji, actionText, reason } = body;

    if (pin !== PIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const text =
      `${emoji} <b>USDT ${actionText} 기회!</b>\n` +
      `📊 ${reason}\n` +
      `⏰ ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}\n` +
      `\n` +
      `아래 버튼으로 즉시 매매:`;

    let buttons;
    if (direction === 'sell') {
      buttons = [
        [
          { text: '🔴 매도 5만원', callback_data: 'sell_50000' },
          { text: '🔴 매도 10만원', callback_data: 'sell_100000' },
        ],
        [
          { text: '⏭️ 무시', callback_data: 'ignore' },
        ],
      ];
    } else {
      buttons = [
        [
          { text: '🟢 매수 5만원', callback_data: 'buy_50000' },
          { text: '🟢 매수 10만원', callback_data: 'buy_100000' },
        ],
        [
          { text: '⏭️ 무시', callback_data: 'ignore' },
        ],
      ];
    }

    await sendTelegramWithButtons(text, buttons);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kimp trade alert error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
