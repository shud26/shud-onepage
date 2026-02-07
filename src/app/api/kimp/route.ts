import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Hyperliquid meta + prices
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

    // 2. Upbit KRW markets
    const upbitMarketsRes = await fetch('https://api.upbit.com/v1/market/all?is_details=false');
    const upbitMarkets = await upbitMarketsRes.json();
    const krwSymbols = upbitMarkets
      .filter((m: { market: string }) => m.market.startsWith('KRW-'))
      .map((m: { market: string }) => m.market);

    // 3. Upbit tickers (batched)
    const upbitTickers: Record<string, { price: number; change: number; volume: number }> = {};
    for (let i = 0; i < krwSymbols.length; i += 100) {
      const batch = krwSymbols.slice(i, i + 100);
      const tickerRes = await fetch(`https://api.upbit.com/v1/ticker?markets=${batch.join(',')}`);
      const tickers = await tickerRes.json();
      if (Array.isArray(tickers)) {
        for (const t of tickers) {
          const sym = t.market.replace('KRW-', '');
          upbitTickers[sym] = {
            price: t.trade_price,
            change: t.signed_change_rate * 100,
            volume: t.acc_trade_price_24h,
          };
        }
      }
    }

    // 4. Exchange rate
    let krwRate = 1350;
    try {
      const rateRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const rateData = await rateRes.json();
      krwRate = rateData.rates.KRW;
    } catch { /* fallback */ }

    return NextResponse.json({
      hlMeta: hlMeta.universe,
      hlMids,
      upbitTickers,
      krwRate,
    });
  } catch (error) {
    console.error('Kimp API error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
