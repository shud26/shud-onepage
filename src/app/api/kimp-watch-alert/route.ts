import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

interface WatchCoin {
  symbol: string;
  kimp: number;
  pureKimp: number;
  netKimp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coins, watchlist, krwRate, usdtKimp } = body as {
      coins: WatchCoin[];
      watchlist: string[];
      krwRate: number;
      usdtKimp: number;
    };

    if (!watchlist || watchlist.length === 0) {
      return NextResponse.json({ error: '워치리스트가 비어있습니다' }, { status: 400 });
    }

    // 워치리스트 코인만 필터
    const watched = coins.filter(c => watchlist.includes(c.symbol));
    if (watched.length === 0) {
      return NextResponse.json({ error: '워치리스트 코인 데이터 없음' }, { status: 400 });
    }

    // 순수김프 높은순 정렬
    watched.sort((a, b) => b.pureKimp - a.pureKimp);

    const lines: string[] = [];
    lines.push('<b>⭐ 워치리스트 김프 현황</b>');
    lines.push('');

    for (const c of watched) {
      const kimpStr = c.kimp > 0 ? `+${c.kimp.toFixed(2)}` : c.kimp.toFixed(2);
      const pureStr = c.pureKimp > 0 ? `+${c.pureKimp.toFixed(2)}` : c.pureKimp.toFixed(2);
      lines.push(`${c.symbol}: <b>${kimpStr}%</b> (순수 ${pureStr}%)`);
    }

    lines.push('');
    lines.push(`💱 환율: ${krwRate.toLocaleString()} KRW | 테더: ${usdtKimp > 0 ? '+' : ''}${usdtKimp.toFixed(2)}%`);
    lines.push(`🔗 <a href="https://tftchess.com/kimp">김프 대시보드</a>`);

    const message = lines.join('\n');
    const sent = await sendTelegramMessage(message);

    return NextResponse.json({ success: sent, count: watched.length });
  } catch (error) {
    console.error('Watch alert error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
