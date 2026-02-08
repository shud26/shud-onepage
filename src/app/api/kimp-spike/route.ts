import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const HL_PREFIX_MAP: Record<string, string> = {
  kPEPE: 'PEPE', kSHIB: 'SHIB', kBONK: 'BONK', kFLOKI: 'FLOKI',
  kDOGS: 'DOGS', kNEIRO: 'NEIRO', kLUNC: 'LUNC',
};

const UPBIT_FEE = 0.05;
const HL_FEE = 0.035;
const SPIKE_THRESHOLD = 5.0;       // 순수김프 5% 이상이면 알림
const REVERSE_SPIKE_THRESHOLD = -5.0; // 역김프 -5% 이하이면 알림

export async function GET(request: NextRequest) {
  // 인증
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 최근 2시간 내 알림 보냈는지 체크 (스팸 방지)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data: recentAlerts } = await supabase
      .from('kimp_spike_alerts')
      .select('id')
      .gte('created_at', twoHoursAgo)
      .limit(1);

    if (recentAlerts && recentAlerts.length > 0) {
      return NextResponse.json({ action: 'skipped', reason: 'alert sent within 2h' });
    }

    // 데이터 수집 (kimp-auto와 동일)
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

    // 김프 계산
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

    // 스파이크 감지
    const spikeHigh = allCoins.filter(c => c.pureKimp >= SPIKE_THRESHOLD).sort((a, b) => b.pureKimp - a.pureKimp);
    const spikeLow = allCoins.filter(c => c.pureKimp <= REVERSE_SPIKE_THRESHOLD).sort((a, b) => a.pureKimp - b.pureKimp);

    if (spikeHigh.length === 0 && spikeLow.length === 0) {
      return NextResponse.json({ action: 'no_spike', totalCoins: allCoins.length });
    }

    // 텔레그램 알림 생성
    const btc = allCoins.find(c => c.symbol === 'BTC');
    const lines: string[] = [];
    lines.push('🚨 <b>김프 스파이크 감지!</b>');
    lines.push('');
    lines.push(`📊 BTC: ${btc ? (btc.kimp > 0 ? '+' : '') + btc.kimp.toFixed(2) : '-'}% | 테더: ${usdtKimp > 0 ? '+' : ''}${usdtKimp.toFixed(2)}%`);
    lines.push('');

    if (spikeHigh.length > 0) {
      lines.push(`🔴 <b>고김프 스파이크 (순수 ${SPIKE_THRESHOLD}%+)</b>`);
      for (const c of spikeHigh.slice(0, 5)) {
        lines.push(`  <b>${c.symbol}</b>: 총 +${c.kimp.toFixed(2)}% | 순수 <b>+${c.pureKimp.toFixed(2)}%</b> | 수수료후 +${c.netKimp.toFixed(2)}%`);
      }
      lines.push('');
      lines.push('💡 업비트에 보유 중이면 매도 찬스!');
      lines.push('');
    }

    if (spikeLow.length > 0) {
      lines.push(`🔵 <b>역김프 스파이크 (순수 ${REVERSE_SPIKE_THRESHOLD}% 이하)</b>`);
      for (const c of spikeLow.slice(0, 5)) {
        lines.push(`  <b>${c.symbol}</b>: 총 ${c.kimp.toFixed(2)}% | 순수 <b>${c.pureKimp.toFixed(2)}%</b>`);
      }
      lines.push('');
      lines.push('💡 업비트에서 싸게 살 기회!');
      lines.push('');
    }

    lines.push(`🔗 <a href="https://tftchess.com/kimp">김프 대시보드</a>`);

    const message = lines.join('\n');
    const sent = await sendTelegramMessage(message);

    // 알림 기록 저장 (스팸 방지용)
    if (sent) {
      try {
        await supabase.from('kimp_spike_alerts').insert({
          coins: spikeHigh.concat(spikeLow).slice(0, 10).map(c => c.symbol),
          high_count: spikeHigh.length,
          low_count: spikeLow.length,
        });
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      success: sent,
      action: 'spike_alert_sent',
      spikeHigh: spikeHigh.length,
      spikeLow: spikeLow.length,
    });
  } catch (error) {
    console.error('Kimp spike check error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
