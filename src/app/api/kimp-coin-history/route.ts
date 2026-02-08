import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const days = parseInt(searchParams.get('days') || '30');

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 });
  }

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('kimp_coin_history')
      .select('created_at, kimp, pure_kimp, net_kimp, volume_krw')
      .eq('symbol', symbol.toUpperCase())
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const history = (data || []).map(d => ({
      date: new Date(d.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      kimp: d.kimp,
      pureKimp: d.pure_kimp,
      netKimp: d.net_kimp,
      volume: d.volume_krw,
    }));

    return NextResponse.json({ symbol: symbol.toUpperCase(), history });
  } catch (error) {
    console.error('Coin history error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
