import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// HL k접두사 매핑
const HL_PREFIX_MAP: Record<string, string> = {
  kPEPE: 'PEPE', kSHIB: 'SHIB', kBONK: 'BONK', kFLOKI: 'FLOKI',
  kDOGS: 'DOGS', kNEIRO: 'NEIRO', kLUNC: 'LUNC',
};

const UPBIT_FEE = 0.05;
const HL_FEE = 0.035;
const HIGH_KIMP_THRESHOLD = 3.0;
const REVERSE_KIMP_THRESHOLD = -2.0;

export async function GET(request: NextRequest) {
  // Vercel Cron 인증
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. 데이터 수집
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
    const highKimp = allCoins.filter(c => c.kimp >= HIGH_KIMP_THRESHOLD).sort((a, b) => b.kimp - a.kimp).slice(0, 5);
    const reverseKimp = allCoins.filter(c => c.kimp <= REVERSE_KIMP_THRESHOLD).sort((a, b) => a.kimp - b.kimp).slice(0, 5);

    // BTC 김프
    const btc = allCoins.find(c => c.symbol === 'BTC');
    const btcKimp = btc?.kimp ?? 0;
    const avgKimp = allCoins.length > 0 ? allCoins.reduce((s, c) => s + c.kimp, 0) / allCoins.length : 0;

    // TOP 3 순수김프
    const top3High = [...allCoins].sort((a, b) => b.pureKimp - a.pureKimp).slice(0, 3);
    const top3Low = [...allCoins].sort((a, b) => a.pureKimp - b.pureKimp).slice(0, 3);

    // 4. 모닝 브리핑 메시지 (하루 1번이니 항상 전송)
    const lines: string[] = [];
    lines.push('🇰🇷 <b>김프 모닝 브리핑</b>');
    lines.push('');
    lines.push(`📊 BTC: <b>${btcKimp > 0 ? '+' : ''}${btcKimp.toFixed(2)}%</b> | 테더: ${usdtKimp > 0 ? '+' : ''}${usdtKimp.toFixed(2)}% | 평균: ${avgKimp > 0 ? '+' : ''}${avgKimp.toFixed(2)}%`);
    lines.push(`💱 환율: ${krwRate.toLocaleString()} KRW | ${allCoins.length}개 코인`);
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
        lines.push(`  ${c.symbol}: <b>${c.kimp.toFixed(2)}%</b>`);
      }
      lines.push('');
    }

    if (highKimp.length === 0 && reverseKimp.length === 0) {
      lines.push('✅ 특이사항 없음 (김프 정상 범위)');
      lines.push('');
    }

    lines.push('⭐ <b>순수김프 TOP 3</b>');
    top3High.forEach((c, i) => lines.push(`  ${i + 1}. ${c.symbol} ${c.pureKimp > 0 ? '+' : ''}${c.pureKimp.toFixed(2)}%`));
    lines.push('');
    lines.push('🔻 <b>역김프 TOP 3</b>');
    top3Low.forEach((c, i) => lines.push(`  ${i + 1}. ${c.symbol} ${c.pureKimp.toFixed(2)}%`));
    lines.push('');
    lines.push(`🔗 <a href="https://tftchess.com/kimp">김프 대시보드</a>`);

    const message = lines.join('\n');
    const sent = await sendTelegramMessage(message);

    // Supabase에 김프 히스토리 저장
    try {
      await supabase.from('kimp_history').insert({
        btc_kimp: parseFloat(btcKimp.toFixed(4)),
        avg_kimp: parseFloat(avgKimp.toFixed(4)),
        usdt_kimp: parseFloat(usdtKimp.toFixed(4)),
        krw_rate: krwRate,
        total_coins: allCoins.length,
        high_kimp_count: highKimp.length,
        reverse_kimp_count: reverseKimp.length,
        top_coins: {
          high: top3High.map(c => ({ symbol: c.symbol, kimp: parseFloat(c.kimp.toFixed(4)), pureKimp: parseFloat(c.pureKimp.toFixed(4)) })),
          low: top3Low.map(c => ({ symbol: c.symbol, kimp: parseFloat(c.kimp.toFixed(4)), pureKimp: parseFloat(c.pureKimp.toFixed(4)) })),
        },
      });
    } catch (e) {
      console.error('Kimp history save error:', e);
    }

    return NextResponse.json({
      success: sent,
      action: 'sent',
      btcKimp: btcKimp.toFixed(2),
      highKimp: highKimp.length,
      reverseKimp: reverseKimp.length,
      totalCoins: allCoins.length,
    });
  } catch (error) {
    console.error('Kimp auto alert error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
