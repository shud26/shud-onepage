import { NextRequest, NextResponse } from 'next/server';
import { buyUSDT, sellUSDT, getBalance, getUSDTPrice } from '@/lib/upbit';
import { sendTelegramMessage, answerCallbackQuery } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

// Telegram webhook - 인라인 버튼 콜백 처리
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // callback_query 처리 (인라인 버튼 클릭)
    if (body.callback_query) {
      const { id: callbackId, data, from } = body.callback_query;

      // 본인 확인 (TELEGRAM_CHAT_ID와 일치하는지)
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (String(from.id) !== chatId) {
        await answerCallbackQuery(callbackId, '권한이 없습니다');
        return NextResponse.json({ ok: true });
      }

      // 콜백 즉시 응답 (로딩 해제)
      await answerCallbackQuery(callbackId, '주문 처리 중...');

      // callback_data 파싱: "buy_50000", "sell_100000", "ignore"
      if (data === 'ignore') {
        await sendTelegramMessage('⏭️ 알림을 무시했습니다.');
        return NextResponse.json({ ok: true });
      }

      const [action, amountStr] = data.split('_');
      const amount = parseInt(amountStr, 10);

      if ((action !== 'buy' && action !== 'sell') || isNaN(amount)) {
        await sendTelegramMessage('❌ 잘못된 명령입니다.');
        return NextResponse.json({ ok: true });
      }

      // 주문 실행
      let result;
      if (action === 'buy') {
        result = await buyUSDT(amount);
      } else {
        result = await sellUSDT(amount);
      }

      // 결과 메시지
      const emoji = result.success ? (action === 'buy' ? '🟢' : '🔴') : '❌';
      const actionText = action === 'buy' ? '매수' : '매도';

      if (result.success) {
        // 잔고 조회
        const [balance, usdtPrice] = await Promise.all([
          getBalance(),
          getUSDTPrice(),
        ]);

        await sendTelegramMessage(
          `${emoji} <b>USDT ${actionText} 완료!</b>\n` +
          `💰 ${amount.toLocaleString()}원\n` +
          `📋 ${result.message}\n` +
          `\n` +
          `💼 잔고:\n` +
          `  KRW: ${Math.floor(balance.krw).toLocaleString()}원\n` +
          `  USDT: ${balance.usdt.toFixed(2)}개\n` +
          `  USDT 가격: ${usdtPrice.toLocaleString()}원`
        );
      } else {
        await sendTelegramMessage(
          `${emoji} <b>USDT ${actionText} 실패</b>\n` +
          `💰 ${amount.toLocaleString()}원\n` +
          `❗ ${result.message}`
        );
      }

      return NextResponse.json({ ok: true });
    }

    // 일반 메시지 (텍스트 명령어) - 필요시 확장
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true }); // Telegram은 항상 200 응답 필요
  }
}
