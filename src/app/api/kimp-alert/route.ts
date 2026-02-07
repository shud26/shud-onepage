import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const { coins, krwRate, threshold, reverseThreshold } = await request.json();

    if (!coins || coins.length === 0) {
      return NextResponse.json({ error: 'No coins' }, { status: 400 });
    }

    // 알림 메시지 생성
    const lines: string[] = [];
    lines.push('🇰🇷 <b>김치 프리미엄 알림</b>');
    lines.push('');

    const highKimp = coins.filter((c: { kimp: number }) => c.kimp >= threshold);
    const reverseKimp = coins.filter((c: { kimp: number }) => c.kimp <= reverseThreshold);

    if (highKimp.length > 0) {
      lines.push(`🔴 <b>김프 ${threshold}% 이상 (${highKimp.length}개)</b>`);
      for (const c of highKimp) {
        lines.push(`  ${c.symbol}: <b>${c.kimp > 0 ? '+' : ''}${c.kimp.toFixed(2)}%</b> (순: ${c.netKimp > 0 ? '+' : ''}${c.netKimp.toFixed(2)}%)`);
      }
      lines.push('');
    }

    if (reverseKimp.length > 0) {
      lines.push(`🔵 <b>역김프 ${reverseThreshold}% 이하 (${reverseKimp.length}개)</b>`);
      for (const c of reverseKimp) {
        lines.push(`  ${c.symbol}: <b>${c.kimp.toFixed(2)}%</b> (매수 기회!)`);
      }
      lines.push('');
    }

    // 최적 경로 추천
    const best = [...coins]
      .sort((a: { netKimp: number }, b: { netKimp: number }) => b.netKimp - a.netKimp)
      .slice(0, 3);

    if (best.length > 0) {
      lines.push('⭐ <b>최적 경로 TOP 3</b>');
      best.forEach((c: { symbol: string; netKimp: number; transferTime: string }, i: number) => {
        lines.push(`  ${i + 1}. ${c.symbol} 순김프 ${c.netKimp > 0 ? '+' : ''}${c.netKimp.toFixed(2)}% (${c.transferTime})`);
      });
      lines.push('');
    }

    lines.push(`💱 환율: 1 USD = ${krwRate?.toLocaleString()} KRW`);
    lines.push(`🔗 <a href="https://tftchess.com/kimp">김프 대시보드</a>`);

    const message = lines.join('\n');
    const sent = await sendTelegramMessage(message);

    if (sent) {
      return NextResponse.json({ success: true, coinsAlerted: coins.length });
    } else {
      return NextResponse.json({ error: 'Telegram send failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Kimp alert error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
