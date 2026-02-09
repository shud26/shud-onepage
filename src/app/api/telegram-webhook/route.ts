import { NextRequest, NextResponse } from 'next/server';
import { buyUSDT, sellUSDT, getBalance, getUSDTPrice } from '@/lib/upbit';
import { withdrawUSDT } from '@/lib/binance';
import { sendTelegramMessage, sendTelegramWithButtons, answerCallbackQuery } from '@/lib/telegram';

// Binance는 한국 IP 차단 → 미국 리전 프록시 경유
async function getBinanceBalanceViaProxy(): Promise<number> {
  const secret = process.env.CRON_SECRET;
  const res = await fetch(`https://www.tftchess.com/api/binance-proxy?secret=${secret}`);
  if (!res.ok) return -1;
  const data = await res.json();
  return data.usdt ?? -1;
}

export const dynamic = 'force-dynamic';

// 김프 계산 (업비트 USDT 가격 + 환율)
async function calculateKimp(): Promise<{ kimp: number; usdtKrw: number; krwRate: number }> {
  const [usdtKrw, rateRes] = await Promise.all([
    getUSDTPrice(),
    fetch('https://api.exchangerate-api.com/v4/latest/USD').then(r => r.json()).catch(() => ({ rates: { KRW: 1350 } })),
  ]);

  const krwRate = rateRes.rates.KRW;
  const fairPrice = krwRate; // 1 USDT = 환율 기준 KRW
  const kimp = ((usdtKrw - fairPrice) / fairPrice) * 100;

  return { kimp, usdtKrw, krwRate };
}

// /kimp 명령어 처리
async function handleKimpCommand() {
  const { kimp, usdtKrw, krwRate } = await calculateKimp();

  const emoji = kimp >= 3 ? '🔴' : kimp <= -3 ? '🟢' : '⚪';
  const direction = kimp >= 0 ? '양김프' : '역김프';

  const text =
    `${emoji} <b>김프 현황</b>\n` +
    `\n` +
    `📊 김프: <b>${kimp >= 0 ? '+' : ''}${kimp.toFixed(2)}%</b> (${direction})\n` +
    `💱 업비트 USDT: ${usdtKrw.toLocaleString()}원\n` +
    `🌍 환율: ${krwRate.toFixed(0)}원/USD\n` +
    `\n` +
    `${kimp >= 3 ? '⚠️ 김프 높음 → 매도(KRW→USDT→해외) 유리' : kimp <= -3 ? '💡 역김프 → 매수(해외→USDT→KRW) 유리' : '😐 보합 구간'}`;

  const buttons = kimp >= 2
    ? [
        [
          { text: '매도 5만', callback_data: 'sell_50000' },
          { text: '매도 10만', callback_data: 'sell_100000' },
        ],
        [
          { text: '전송 50', callback_data: 'transfer_50' },
          { text: '전송 100', callback_data: 'transfer_100' },
        ],
        [{ text: '무시', callback_data: 'ignore' }],
      ]
    : [
        [
          { text: '매수 5만', callback_data: 'buy_50000' },
          { text: '매수 10만', callback_data: 'buy_100000' },
        ],
        [
          { text: '매도 5만', callback_data: 'sell_50000' },
          { text: '매도 10만', callback_data: 'sell_100000' },
        ],
        [{ text: '무시', callback_data: 'ignore' }],
      ];

  await sendTelegramWithButtons(text, buttons);
}

// /b 명령어 처리
async function handleBalanceCommand() {
  const [upbit, usdtPrice] = await Promise.all([
    getBalance(),
    getUSDTPrice(),
  ]);

  // Binance는 한국 IP 차단 → 미국 프록시 경유
  const binanceUsdt = await getBinanceBalanceViaProxy();

  const upbitUsdtKrw = upbit.usdt * usdtPrice;
  const binanceLine = binanceUsdt >= 0
    ? `  USDT: ${binanceUsdt.toFixed(2)}개`
    : `  ⚠️ 조회 불가 (한국 IP 차단)`;
  const totalKrw = upbit.krw + upbitUsdtKrw + (binanceUsdt > 0 ? binanceUsdt * usdtPrice : 0);

  const text =
    `💼 <b>잔고 현황</b>\n` +
    `\n` +
    `🇰🇷 <b>업비트</b>\n` +
    `  KRW: ${Math.floor(upbit.krw).toLocaleString()}원\n` +
    `  USDT: ${upbit.usdt.toFixed(2)}개 (≈${Math.floor(upbitUsdtKrw).toLocaleString()}원)\n` +
    `\n` +
    `🌐 <b>Binance</b>\n` +
    `${binanceLine}\n` +
    `\n` +
    `💰 총자산: ≈${Math.floor(totalKrw).toLocaleString()}원\n` +
    `📊 USDT 가격: ${usdtPrice.toLocaleString()}원`;

  const buttons = [
    [
      { text: '전송 50 USDT', callback_data: 'transfer_50' },
      { text: '전송 100 USDT', callback_data: 'transfer_100' },
    ],
    [{ text: '무시', callback_data: 'ignore' }],
  ];

  await sendTelegramWithButtons(text, buttons);
}

// /help 명령어 처리
async function handleHelpCommand() {
  const text =
    `📖 <b>김프봇 명령어</b>\n` +
    `\n` +
    `/kimp - 김프 확인 + 매수/매도 버튼\n` +
    `/b - 업비트/Binance 잔고 조회\n` +
    `/help - 명령어 목록\n` +
    `\n` +
    `🔔 자동 알림: 5분마다 김프 체크\n` +
    `  김프 ≥3%: 매도 알림\n` +
    `  김프 ≤-3%: 매수 알림`;

  await sendTelegramMessage(text);
}

// Telegram webhook - 텍스트 명령어 + 인라인 버튼 콜백 처리
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 텍스트 명령어 처리
    if (body.message?.text) {
      const fromId = String(body.message.from?.id);
      if (fromId !== chatId) {
        return NextResponse.json({ ok: true });
      }

      const text = body.message.text.trim().toLowerCase();

      try {
        if (text === '/kimp') {
          await handleKimpCommand();
        } else if (text === '/b') {
          await handleBalanceCommand();
        } else if (text === '/help' || text === '/start') {
          await handleHelpCommand();
        }
      } catch (cmdError) {
        console.error('Command error:', cmdError);
        await sendTelegramMessage(`❌ 명령 실행 실패: ${cmdError instanceof Error ? cmdError.message : 'Unknown error'}`);
      }

      return NextResponse.json({ ok: true });
    }

    // callback_query 처리 (인라인 버튼 클릭)
    if (body.callback_query) {
      const { id: callbackId, data, from } = body.callback_query;

      // 본인 확인 (TELEGRAM_CHAT_ID와 일치하는지)
      if (String(from.id) !== chatId) {
        await answerCallbackQuery(callbackId, '권한이 없습니다');
        return NextResponse.json({ ok: true });
      }

      // 콜백 즉시 응답 (로딩 해제)
      await answerCallbackQuery(callbackId, '주문 처리 중...');

      // callback_data 파싱: "buy_50000", "sell_100000", "transfer_50", "transfer_100", "ignore"
      if (data === 'ignore') {
        await sendTelegramMessage('⏭️ 알림을 무시했습니다.');
        return NextResponse.json({ ok: true });
      }

      // Binance → 업비트 USDT 전송 처리
      if (data.startsWith('transfer_')) {
        const transferAmount = parseInt(data.split('_')[1], 10);
        if (isNaN(transferAmount) || transferAmount <= 0) {
          await sendTelegramMessage('❌ 잘못된 전송 금액입니다.');
          return NextResponse.json({ ok: true });
        }

        const targetAddress = process.env.UPBIT_USDT_DEPOSIT_ADDRESS;
        if (!targetAddress) {
          await sendTelegramMessage('❌ 업비트 USDT 입금 주소가 설정되지 않았습니다.');
          return NextResponse.json({ ok: true });
        }

        const transferResult = await withdrawUSDT(targetAddress, transferAmount, 'TRX');

        if (transferResult.success) {
          const binUsdt = await getBinanceBalanceViaProxy();
          await sendTelegramMessage(
            `📤 <b>Binance → 업비트 전송 완료!</b>\n` +
            `💰 ${transferAmount} USDT (TRC20)\n` +
            `📋 ${transferResult.message}\n` +
            `\n` +
            `💼 Binance 잔고: ${binUsdt >= 0 ? binUsdt.toFixed(2) + ' USDT' : '조회 불가'}\n` +
            `⏱️ 도착 예상: 1~5분`
          );
        } else {
          await sendTelegramMessage(
            `❌ <b>Binance 전송 실패</b>\n` +
            `💰 ${transferAmount} USDT\n` +
            `❗ ${transferResult.message}`
          );
        }

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

    // 알 수 없는 메시지 타입
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true }); // Telegram은 항상 200 응답 필요
  }
}
