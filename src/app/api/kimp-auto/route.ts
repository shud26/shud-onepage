import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

// HL k접두사 매핑
const HL_PREFIX_MAP: Record<string, string> = {
  kPEPE: 'PEPE', kSHIB: 'SHIB', kBONK: 'BONK', kFLOKI: 'FLOKI',
  kDOGS: 'DOGS', kNEIRO: 'NEIRO', kLUNC: 'LUNC',
};

const UPBIT_FEE = 0.05;
const HL_FEE = 0.035;
const HIGH_KIMP_THRESHOLD = 3.0;    // 김프 3% 이상
const REVERSE_KIMP_THRESHOLD = -2.0; // 역김프 -2% 이하

export async function GET(request: NextRequest) {
  // Vercel Cron 인증
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. 데이터 수집 (서버 사이드 - CORS 문제 없음)
    const [hlMetaRes, hlPriceRes] = await Promise.all([
      fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'meta' }),
      }),
      fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'allMids' }),
      }),
    ]);

    const hlMeta = await hlMetaRes.json();
    const hlMids: Record<string, string> = await hlPriceRes.json();

    // HL 토큰
    const hlTokens: Record<string, number> = {};
    for (const u of hlMeta.universe) {
      const name = u.name as string;
      const mapped = HL_PREFIX_MAP[name] || name;
      const price = parseFloat(hlMids[name] || '0');
      if (price > 0) hlTokens[mapped] = price;
    }

    // 업비트
    const upbitMarketsRes = await fetch('https://api.upbit.com/v1/market/all?is_details=false');
    const upbitMarkets = await upbitMarketsRes.json();
    const krwSymbols = upbitMarkets
      .filter((m: { market: string }) => m.market.startsWith('KRW-'))
      .map((m: { market: string }) => m.market);

    const upbitPrices: Record<string, { price: number; volume: number }> = {};
    for (let i = 0; i < krwSymbols.length; i += 100) {
      const batch = krwSymbols.slice(i, i + 100);
      const tickerRes = await fetch(`https://api.upbit.com/v1/ticker?markets=${batch.join(',')}`);
      const tickers = await tickerRes.json();
      if (Array.isArray(tickers)) {
        for (const t of tickers) {
          const sym = t.market.replace('KRW-', '');
          upbitPrices[sym] = { price: t.trade_price, volume: t.acc_trade_price_24h };
        }
      }
    }

    // 환율
    let krwRate = 1350;
    try {
      const rateRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const rateData = await rateRes.json();
      krwRate = rateData.rates.KRW;
    } catch { /* fallback */ }

    // USDT 김프
    const usdtUpbit = upbitPrices['USDT']?.price || 0;
    const usdtKimp = usdtUpbit > 0 ? ((usdtUpbit / krwRate) - 1) * 100 : 0;

    // 2. 김프 계산
    const overlap = Object.keys(hlTokens).filter(s =>
      s in upbitPrices && s !== 'USDT' && s !== 'USDC'
    );

    const allCoins = overlap.map(symbol => {
      const hlPrice = hlTokens[symbol];
      const upbitKrw = upbitPrices[symbol].price;
      const upbitUsd = upbitKrw / krwRate;
      const kimp = hlPrice > 0 ? ((upbitUsd - hlPrice) / hlPrice) * 100 : 0;
      const netKimp = kimp - UPBIT_FEE - HL_FEE;
      const pureKimp = kimp - usdtKimp;
      return { symbol, kimp, netKimp, pureKimp, volume: upbitPrices[symbol].volume };
    });

    // 3. 알림 조건 필터
    const highKimp = allCoins
      .filter(c => c.kimp >= HIGH_KIMP_THRESHOLD)
      .sort((a, b) => b.kimp - a.kimp)
      .slice(0, 5);

    const reverseKimp = allCoins
      .filter(c => c.kimp <= REVERSE_KIMP_THRESHOLD)
      .sort((a, b) => a.kimp - b.kimp)
      .slice(0, 5);

    // 4. 조건 미달이면 알림 안 보냄 (조용!)
    if (highKimp.length === 0 && reverseKimp.length === 0) {
      return NextResponse.json({
        success: true,
        action: 'skipped',
        reason: `김프 ${HIGH_KIMP_THRESHOLD}% 이상 or 역김프 ${REVERSE_KIMP_THRESHOLD}% 이하 없음`,
        totalCoins: allCoins.length,
      });
    }

    // BTC 김프
    const btc = allCoins.find(c => c.symbol === 'BTC');
    const btcKimp = btc?.kimp ?? 0;

    // 5. 요약 메시지 생성 (하나로!)
    const lines: string[] = [];
    lines.push('🇰🇷 <b>김프 자동 알림</b> (1시간 주기)');
    lines.push('');
    lines.push(`📊 BTC 김프: <b>${btcKimp > 0 ? '+' : ''}${btcKimp.toFixed(2)}%</b> | 테더: ${usdtKimp > 0 ? '+' : ''}${usdtKimp.toFixed(2)}% | 환율: ${krwRate.toLocaleString()}`);
    lines.push('');

    if (highKimp.length > 0) {
      lines.push(`🔴 <b>김프 ${HIGH_KIMP_THRESHOLD}%+ (${highKimp.length}개)</b>`);
      for (const c of highKimp) {
        lines.push(`  ${c.symbol}: <b>+${c.kimp.toFixed(2)}%</b> (순: +${c.netKimp.toFixed(2)}%)`);
      }
      lines.push('');
    }

    if (reverseKimp.length > 0) {
      lines.push(`🔵 <b>역김프 ${REVERSE_KIMP_THRESHOLD}% 이하 (${reverseKimp.length}개)</b>`);
      for (const c of reverseKimp) {
        lines.push(`  ${c.symbol}: <b>${c.kimp.toFixed(2)}%</b> (매수 기회!)`);
      }
      lines.push('');
    }

    lines.push(`🔗 <a href="https://tftchess.com/kimp">김프 대시보드</a>`);

    const message = lines.join('\n');
    const sent = await sendTelegramMessage(message);

    return NextResponse.json({
      success: sent,
      action: 'sent',
      highKimp: highKimp.length,
      reverseKimp: reverseKimp.length,
      totalCoins: allCoins.length,
    });
  } catch (error) {
    console.error('Kimp auto alert error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
