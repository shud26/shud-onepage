'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

// 수수료 상수
const UPBIT_FEE = 0.05; // %
const HL_FEE = 0.035; // % (taker)

// 하이퍼리퀴드 k접두사 매핑
const HL_PREFIX_MAP: Record<string, string> = {
  kPEPE: 'PEPE', kSHIB: 'SHIB', kBONK: 'BONK', kFLOKI: 'FLOKI',
  kDOGS: 'DOGS', kNEIRO: 'NEIRO', kLUNC: 'LUNC',
};

interface KimpCoin {
  symbol: string;
  hlPrice: number;
  upbitPriceKrw: number;
  upbitPriceUsd: number;
  kimp: number;
  netKimp: number;
  pureKimp: number; // 테더 김프 빼고 순수 코인 프리미엄
  volume24hKrw: number;
  change24h: number;
  signal: 'go' | 'wait' | 'stop';
}

// 김프 색상
function getKimpColor(kimp: number): string {
  if (kimp >= 5) return '#EF4444';
  if (kimp >= 2) return '#FF5C00';
  if (kimp >= 0) return '#22C55E';
  if (kimp >= -2) return '#3B82F6';
  return '#8B5CF6';
}

function getKimpLabel(kimp: number): string {
  if (kimp >= 5) return '과열';
  if (kimp >= 2) return '프리미엄';
  if (kimp >= 0) return '정상';
  if (kimp >= -2) return '역김프';
  return '강한 역김프';
}

function getGaugeValue(kimp: number): number {
  return Math.max(0, Math.min(100, ((kimp + 5) / 15) * 100));
}

function getGaugeColor(val: number): string {
  if (val > 70) return '#EF4444';
  if (val > 40) return '#FF5C00';
  return '#22C55E';
}

export default function KimpPage() {
  const [coins, setCoins] = useState<KimpCoin[]>([]);
  const [krwRate, setKrwRate] = useState(1350);
  const [usdtKimp, setUsdtKimp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<'kimp' | 'netKimp' | 'pureKimp' | 'volume'>('pureKimp');
  const [sortDesc, setSortDesc] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(3.0);
  const [reverseAlertThreshold, setReverseAlertThreshold] = useState(-2.0);
  const [kimpHistory, setKimpHistory] = useState<{ time: string; kimp: number }[]>([]);
  const [alertSending, setAlertSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showOnlyGo, setShowOnlyGo] = useState(false);

  // BTC 김프 (대표값)
  const btcKimp = coins.find(c => c.symbol === 'BTC')?.kimp ?? 0;
  const gaugeValue = getGaugeValue(btcKimp);

  // 환율
  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => setKrwRate(data.rates.KRW))
      .catch(() => setKrwRate(1350));
  }, []);

  // 데이터 가져오기: 하이퍼리퀴드 + 업비트 + 환율
  const fetchKimp = useCallback(async () => {
    try {
      // 1. 하이퍼리퀴드 전체 토큰 메타 + 가격
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

      // HL 토큰 목록 + 가격
      const hlTokens: Record<string, number> = {};
      for (const u of hlMeta.universe) {
        const name = u.name as string;
        const mapped = HL_PREFIX_MAP[name] || name;
        const price = parseFloat(hlMids[name] || '0');
        if (price > 0) hlTokens[mapped] = price;
      }

      // 2. 업비트 KRW 마켓 목록
      const upbitMarketsRes = await fetch('https://api.upbit.com/v1/market/all?is_details=false');
      const upbitMarkets = await upbitMarketsRes.json();
      const krwSymbols = upbitMarkets
        .filter((m: { market: string }) => m.market.startsWith('KRW-'))
        .map((m: { market: string }) => m.market);

      // 3. 업비트 현재가 (한번에 최대 100개씩)
      const upbitPrices: Record<string, { price: number; change: number; volume: number }> = {};
      for (let i = 0; i < krwSymbols.length; i += 100) {
        const batch = krwSymbols.slice(i, i + 100);
        const tickerRes = await fetch(`https://api.upbit.com/v1/ticker?markets=${batch.join(',')}`);
        const tickers = await tickerRes.json();
        if (Array.isArray(tickers)) {
          for (const t of tickers) {
            const sym = t.market.replace('KRW-', '');
            upbitPrices[sym] = {
              price: t.trade_price,
              change: t.signed_change_rate * 100,
              volume: t.acc_trade_price_24h,
            };
          }
        }
      }

      // 4. USDT 김프 계산 (베이스라인)
      const usdtUpbit = upbitPrices['USDT']?.price || 0;
      const currentUsdtKimp = usdtUpbit > 0 ? ((usdtUpbit / krwRate) - 1) * 100 : 0;
      setUsdtKimp(currentUsdtKimp);

      // 5. 겹치는 코인만 김프 계산
      const hlSymbols = Object.keys(hlTokens);
      const upbitSymbols = Object.keys(upbitPrices);
      const overlap = hlSymbols.filter(s => upbitSymbols.includes(s) && s !== 'USDT' && s !== 'USDC');

      const newCoins: KimpCoin[] = overlap.map(symbol => {
        const hlPrice = hlTokens[symbol];
        const upbitKrw = upbitPrices[symbol].price;
        const upbitUsd = upbitKrw / krwRate;
        const kimp = hlPrice > 0 ? ((upbitUsd - hlPrice) / hlPrice) * 100 : 0;
        const netKimp = kimp - UPBIT_FEE - HL_FEE;
        const pureKimp = kimp - currentUsdtKimp; // 테더 김프 빼면 = 코인 고유 프리미엄

        let signal: 'go' | 'wait' | 'stop' = 'wait';
        if (pureKimp > 1.5) signal = 'go'; // 순수 김프 기준으로 시그널
        if (pureKimp < -1.5) signal = 'go';
        if (Math.abs(pureKimp) < 0.3) signal = 'stop';

        return {
          symbol,
          hlPrice,
          upbitPriceKrw: upbitKrw,
          upbitPriceUsd: upbitUsd,
          kimp,
          netKimp,
          pureKimp,
          volume24hKrw: upbitPrices[symbol].volume,
          change24h: upbitPrices[symbol].change,
          signal,
        };
      });

      setCoins(newCoins);
      setLastUpdate(new Date());
      setLoading(false);

      // BTC 김프 히스토리
      const btc = newCoins.find(c => c.symbol === 'BTC');
      if (btc) {
        setKimpHistory(prev => {
          const next = [...prev, { time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), kimp: btc.kimp }];
          return next.slice(-30);
        });
      }
    } catch (error) {
      console.error('Kimp fetch error:', error);
      setLoading(false);
    }
  }, [krwRate]);

  useEffect(() => {
    fetchKimp();
    const interval = setInterval(fetchKimp, 30000);
    return () => clearInterval(interval);
  }, [fetchKimp]);

  // 필터 + 정렬
  const filteredCoins = useMemo(() => {
    let list = [...coins];
    if (search) list = list.filter(c => c.symbol.toLowerCase().includes(search.toLowerCase()));
    if (showOnlyGo) list = list.filter(c => c.signal === 'go');
    list.sort((a, b) => {
      const aVal = sortBy === 'volume' ? a.volume24hKrw : sortBy === 'netKimp' ? a.netKimp : sortBy === 'pureKimp' ? a.pureKimp : a.kimp;
      const bVal = sortBy === 'volume' ? b.volume24hKrw : sortBy === 'netKimp' ? b.netKimp : sortBy === 'pureKimp' ? b.pureKimp : b.kimp;
      return sortDesc ? bVal - aVal : aVal - bVal;
    });
    return list;
  }, [coins, search, showOnlyGo, sortBy, sortDesc]);

  // 통계
  const avgPure = coins.length > 0 ? coins.reduce((s, c) => s + c.pureKimp, 0) / coins.length : 0;
  const maxPureCoin = coins.length > 0 ? coins.reduce((a, b) => a.pureKimp > b.pureKimp ? a : b) : null;
  const minPureCoin = coins.length > 0 ? coins.reduce((a, b) => a.pureKimp < b.pureKimp ? a : b) : null;
  const goCount = coins.filter(c => c.signal === 'go').length;

  // 알림
  const sendAlert = async () => {
    setAlertSending(true);
    try {
      const alerts = coins.filter(c => c.kimp >= alertThreshold || c.kimp <= reverseAlertThreshold);
      if (alerts.length === 0) { alert('조건에 해당하는 코인 없음'); setAlertSending(false); return; }
      const res = await fetch('/api/kimp-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: alerts.slice(0, 10), krwRate, threshold: alertThreshold, reverseThreshold: reverseAlertThreshold }),
      });
      alert(res.ok ? '텔레그램 전송 완료!' : '전송 실패');
    } catch { alert('에러 발생'); }
    setAlertSending(false);
  };

  // 볼륨 포맷
  const fmtVol = (v: number) => {
    if (v >= 1e12) return `${(v / 1e12).toFixed(1)}조`;
    if (v >= 1e8) return `${(v / 1e8).toFixed(1)}억`;
    if (v >= 1e4) return `${(v / 1e4).toFixed(0)}만`;
    return v.toLocaleString();
  };

  // 가격 포맷
  const fmtPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (p >= 1) return p.toFixed(2);
    if (p >= 0.01) return p.toFixed(4);
    return p.toFixed(6);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#e5e5e5]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-[#1F1F23]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              KIMP<span className="text-[#FF5C00]">.</span>BOT
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors">홈</Link>
              <span className="px-3 py-1.5 rounded-lg bg-[#1A1A1D] text-white">김프</span>
              <Link href="/blog" className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors">블로그</Link>
              <Link href="/whales" className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors">고래</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#6B6B70] hidden md:inline">{coins.length}개 코인</span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(34,197,94,0.08)] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              <span className="text-[#22C55E] text-[11px] font-medium">LIVE</span>
            </span>
            <button onClick={fetchKimp} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] transition-colors">&#8635;</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* === Hero: 김프 게이지 + 시그널 === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 김프 게이지 */}
          <div className="md:col-span-2 bg-[#111113] border border-[#1F1F23] rounded-xl p-6">
            <div className="text-center mb-4">
              <span className="font-mono text-5xl md:text-6xl font-bold transition-colors duration-500" style={{ color: getKimpColor(btcKimp) }}>
                {btcKimp > 0 ? '+' : ''}{btcKimp.toFixed(2)}%
              </span>
              <p className="text-[#8B8B90] text-sm mt-1">BTC 김치 프리미엄 (Hyperliquid vs 업비트)</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-5">
              <div className="bg-[#0A0A0B] rounded-lg p-3">
                <span className="text-[#6B6B70] text-xs">Hyperliquid</span>
                <p className="font-mono text-[#ADADB0] mt-0.5">${coins.find(c => c.symbol === 'BTC')?.hlPrice?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '-'}</p>
              </div>
              <div className="bg-[#0A0A0B] rounded-lg p-3">
                <span className="text-[#6B6B70] text-xs">업비트</span>
                <p className="font-mono text-[#ADADB0] mt-0.5">₩{coins.find(c => c.symbol === 'BTC')?.upbitPriceKrw?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '-'}</p>
              </div>
              <div className="bg-[#0A0A0B] rounded-lg p-3">
                <span className="text-[#6B6B70] text-xs">환율</span>
                <p className="font-mono text-[#ADADB0] mt-0.5">{krwRate.toLocaleString()} KRW</p>
              </div>
              <div className="bg-[#0A0A0B] rounded-lg p-3 border border-[#FF5C00]/20">
                <span className="text-[#FF5C00] text-xs font-medium">테더 김프 (베이스)</span>
                <p className="font-mono text-[#FF5C00] mt-0.5 font-medium">{usdtKimp > 0 ? '+' : ''}{usdtKimp.toFixed(2)}%</p>
              </div>
              <div className="bg-[#0A0A0B] rounded-lg p-3">
                <span className="text-[#6B6B70] text-xs">상태</span>
                <p className="mt-0.5 font-medium" style={{ color: getKimpColor(btcKimp) }}>{getKimpLabel(btcKimp)}</p>
              </div>
            </div>

            {/* 과열 게이지 */}
            <div>
              <div className="h-3 bg-[#1A1A1D] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${gaugeValue}%`, background: getGaugeColor(gaugeValue) }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#4A4A4E] mt-1.5">
                <span>역김프 -5%</span><span>정상 0%</span><span>과열 +10%</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-4 text-[10px] text-[#4A4A4E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
              {lastUpdate ? `${Math.round((Date.now() - lastUpdate.getTime()) / 1000)}초 전 · 30초 자동 갱신 · Hyperliquid ${coins.length}개 + 업비트 KRW 마켓` : '로딩 중...'}
            </div>
          </div>

          {/* 시그널 + 통계 */}
          <div className="space-y-4">
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5" style={{ borderColor: goCount > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.15)' }}>
              <p className="text-xs text-[#6B6B70] mb-2">매매 시그널</p>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-3 h-3 rounded-full ${goCount > 0 ? 'bg-[#22C55E] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-[#F59E0B]'}`}></span>
                <span className={`text-2xl font-bold ${goCount > 0 ? 'text-[#22C55E]' : 'text-[#F59E0B]'}`}>{goCount > 0 ? 'GO' : 'WAIT'}</span>
                {goCount > 0 && <span className="text-xs text-[#22C55E] bg-[rgba(34,197,94,0.1)] px-2 py-0.5 rounded-full">{goCount}개</span>}
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-[#8B8B90]">테더 김프</span><span className="font-mono text-[#FF5C00]">{usdtKimp > 0 ? '+' : ''}{usdtKimp.toFixed(2)}%</span></div>
                {maxPureCoin && <div className="flex justify-between"><span className="text-[#8B8B90]">최고 순수</span><span className="font-mono" style={{ color: getKimpColor(maxPureCoin.pureKimp) }}>{maxPureCoin.symbol} {maxPureCoin.pureKimp > 0 ? '+' : ''}{maxPureCoin.pureKimp.toFixed(2)}%</span></div>}
                {minPureCoin && <div className="flex justify-between"><span className="text-[#8B8B90]">최저 순수</span><span className="font-mono" style={{ color: getKimpColor(minPureCoin.pureKimp) }}>{minPureCoin.symbol} {minPureCoin.pureKimp.toFixed(2)}%</span></div>}
                <div className="flex justify-between"><span className="text-[#8B8B90]">평균 순수</span><span className="font-mono" style={{ color: getKimpColor(avgPure) }}>{avgPure > 0 ? '+' : ''}{avgPure.toFixed(2)}%</span></div>
              </div>
            </div>

            {/* 알림 */}
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium">알림</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#6B6B70]">&gt;</span>
                  <input type="number" step="0.5" value={alertThreshold} onChange={e => setAlertThreshold(parseFloat(e.target.value) || 3)}
                    className="w-12 text-center bg-[#0A0A0B] border border-[#1F1F23] rounded px-1 py-0.5 text-[11px] font-mono focus:outline-none focus:border-[#FF5C00]" />
                  <span className="text-[10px] text-[#6B6B70]">% &lt;</span>
                  <input type="number" step="0.5" value={reverseAlertThreshold} onChange={e => setReverseAlertThreshold(parseFloat(e.target.value) || -2)}
                    className="w-12 text-center bg-[#0A0A0B] border border-[#1F1F23] rounded px-1 py-0.5 text-[11px] font-mono focus:outline-none focus:border-[#FF5C00]" />
                  <span className="text-[10px] text-[#6B6B70]">%</span>
                </div>
              </div>
              <button onClick={sendAlert} disabled={alertSending}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] transition-colors disabled:opacity-50">
                {alertSending ? '전송 중...' : '📢 텔레그램 알림'}
              </button>
            </div>
          </div>
        </div>

        {/* === 김프 추이 차트 === */}
        {kimpHistory.length > 1 && (
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">BTC 김프 추이</h3>
              <span className="text-[10px] text-[#6B6B70]">최근 {kimpHistory.length}회</span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {kimpHistory.map((h, i) => {
                const min = Math.min(...kimpHistory.map(x => x.kimp));
                const max = Math.max(...kimpHistory.map(x => x.kimp));
                const range = max - min || 1;
                const height = ((h.kimp - min) / range) * 100;
                return (
                  <div key={i} className="flex-1" title={`${h.time}: ${h.kimp.toFixed(2)}%`}>
                    <div className="w-full rounded-sm transition-all duration-300"
                      style={{ height: `${Math.max(4, height)}%`, background: getKimpColor(h.kimp), opacity: i === kimpHistory.length - 1 ? 1 : 0.4 }} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-[#4A4A4E] mt-1">
              <span>{kimpHistory[0]?.time}</span><span>{kimpHistory[kimpHistory.length - 1]?.time}</span>
            </div>
          </div>
        )}

        {/* === 검색 + 필터 === */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text" placeholder="코인 검색..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-[#111113] border border-[#1F1F23] rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:border-[#FF5C00] placeholder:text-[#4A4A4E]"
          />
          <select value={`${sortBy}-${sortDesc}`}
            onChange={e => { const [k, d] = e.target.value.split('-'); setSortBy(k as 'kimp' | 'netKimp' | 'pureKimp' | 'volume'); setSortDesc(d === 'true'); }}
            className="bg-[#111113] border border-[#1F1F23] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#FF5C00]">
            <option value="pureKimp-true">순수김프 높은순</option>
            <option value="pureKimp-false">순수김프 낮은순</option>
            <option value="kimp-true">총김프 높은순</option>
            <option value="netKimp-true">수수료후 높은순</option>
            <option value="volume-true">거래량순</option>
          </select>
          <button onClick={() => setShowOnlyGo(!showOnlyGo)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${showOnlyGo ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' : 'bg-[#111113] border-[#1F1F23] text-[#8B8B90]'}`}>
            GO만 보기
          </button>
          <span className="text-xs text-[#6B6B70]">{filteredCoins.length}개 표시</span>
        </div>

        {/* === 코인별 김프 테이블 === */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#6B6B70]">
              <div className="w-6 h-6 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin mr-3"></div>
              Hyperliquid + 업비트 데이터 불러오는 중...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#6B6B70] border-b border-[#1F1F23] bg-[#0D0D0E] text-[11px] font-semibold tracking-wider uppercase">
                    <th className="text-left py-3 px-4">#</th>
                    <th className="text-left py-3 px-3">코인</th>
                    <th className="text-right py-3 px-3">HL 가격</th>
                    <th className="text-right py-3 px-3">업비트(KRW)</th>
                    <th className="text-right py-3 px-3">총김프</th>
                    <th className="text-right py-3 px-3">순수김프</th>
                    <th className="text-right py-3 px-3 hidden md:table-cell">수수료후</th>
                    <th className="text-right py-3 px-3 hidden lg:table-cell">24h 거래량</th>
                    <th className="text-right py-3 px-3">시그널</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoins.map((c, i) => (
                    <tr key={c.symbol} className="border-b border-[#1F1F23]/50 hover:bg-[#0A0A0B] transition-colors text-[13px]">
                      <td className="py-2.5 px-4 text-[#4A4A4E] text-xs">{i + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-white">{c.symbol}</span>
                        <span className={`ml-1.5 text-[10px] ${c.change24h >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{c.change24h >= 0 ? '+' : ''}{c.change24h.toFixed(1)}%</span>
                      </td>
                      <td className="text-right py-2.5 px-3 text-[#ADADB0] font-mono text-xs">${fmtPrice(c.hlPrice)}</td>
                      <td className="text-right py-2.5 px-3 text-[#ADADB0] font-mono text-xs">₩{c.upbitPriceKrw.toLocaleString(undefined, { maximumFractionDigits: c.upbitPriceKrw >= 100 ? 0 : 2 })}</td>
                      <td className="text-right py-2.5 px-3">
                        <span className="font-mono text-xs text-[#8B8B90]">{c.kimp > 0 ? '+' : ''}{c.kimp.toFixed(2)}%</span>
                      </td>
                      <td className="text-right py-2.5 px-3">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-mono font-medium" style={{ color: getKimpColor(c.pureKimp) }}>{c.pureKimp > 0 ? '+' : ''}{c.pureKimp.toFixed(2)}%</span>
                          <div className="w-10 h-1 bg-[#1F1F23] rounded-full">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(Math.abs(c.pureKimp) * 15, 100)}%`, background: getKimpColor(c.pureKimp) }} />
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-2.5 px-3 hidden md:table-cell">
                        <span className="font-mono text-xs" style={{ color: c.netKimp > 0 ? '#22C55E' : '#EF4444' }}>{c.netKimp > 0 ? '+' : ''}{c.netKimp.toFixed(2)}%</span>
                      </td>
                      <td className="text-right py-2.5 px-3 hidden lg:table-cell text-[11px] text-[#8B8B90] font-mono">₩{fmtVol(c.volume24hKrw)}</td>
                      <td className="text-right py-2.5 px-3">
                        {c.signal === 'go' && <span className="text-[10px] font-medium bg-[rgba(34,197,94,0.1)] text-[#22C55E] px-2 py-0.5 rounded-full">GO</span>}
                        {c.signal === 'wait' && <span className="text-[10px] font-medium bg-[rgba(245,158,11,0.1)] text-[#F59E0B] px-2 py-0.5 rounded-full">WAIT</span>}
                        {c.signal === 'stop' && <span className="text-[10px] font-medium bg-[rgba(107,107,112,0.1)] text-[#6B6B70] px-2 py-0.5 rounded-full">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-4 py-3 border-t border-[#1F1F23] text-[11px] text-[#4A4A4E] font-mono">
            순수김프 = 총김프 - 테더김프({usdtKimp > 0 ? '+' : ''}{usdtKimp.toFixed(2)}%) · 수수료후 = 총김프 - 업비트({UPBIT_FEE}%) - HL({HL_FEE}%) · 1 USD = {krwRate.toLocaleString()} KRW
          </div>
        </div>

        {/* === 김프 가이드 === */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5 text-xs text-[#6B6B70]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-[#8B8B90] mb-1">💰 USDT 김프 매매</p>
              <p>업비트에서 USDT 사고팔아 김프 차이로 수익. 전송 없이 가능!</p>
            </div>
            <div>
              <p className="font-medium text-[#8B8B90] mb-1">🔄 Hyperliquid ↔ 업비트</p>
              <p>HL에서 사서 업비트로 전송 후 매도. 순김프 +2% 이상이면 GO!</p>
            </div>
            <div>
              <p className="font-medium text-[#8B8B90] mb-1">📊 {coins.length}개 동시 모니터링</p>
              <p>HL 전체 토큰 × 업비트 KRW 마켓 겹치는 코인 실시간 추적</p>
            </div>
          </div>
        </div>
      </main>

      {/* 모바일 하단 탭바 */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-md border-t border-[#1F1F23]">
        <div className="flex justify-around py-2 pb-[env(safe-area-inset-bottom)]">
          <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">🏠</span><span className="text-[10px]">홈</span></Link>
          <span className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#FF5C00]"><span className="text-lg">📊</span><span className="text-[10px]">김프</span></span>
          <Link href="/whales" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">🐋</span><span className="text-[10px]">고래</span></Link>
          <Link href="/blog" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">📝</span><span className="text-[10px]">블로그</span></Link>
        </div>
      </nav>
      <div className="h-16 md:hidden"></div>
    </div>
  );
}
