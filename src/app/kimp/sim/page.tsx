'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

// === Types ===
interface ArbitragePosition {
  id: string;
  symbol: string;
  direction: 'upbit_to_hl' | 'hl_to_upbit';
  amount: number;
  entryKimp: number;
  entryPureKimp: number;
  entryTime: number;
  transferCompleteTime: number;
  status: 'transferring' | 'ready_to_close';
  fees: number;
}

interface CompletedTrade {
  id: string;
  symbol: string;
  direction: 'upbit_to_hl' | 'hl_to_upbit';
  amount: number;
  entryKimp: number;
  exitKimp: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  openedAt: number;
  closedAt: number;
}

interface KimpCoin {
  symbol: string;
  hlPrice: number;
  upbitPriceKrw: number;
  upbitPriceUsd: number;
  kimp: number;
  netKimp: number;
  pureKimp: number;
  volume24hKrw: number;
  change24h: number;
  signal: 'go' | 'wait' | 'stop';
}

// === Constants ===
const INITIAL_BALANCE = 10000;
const UPBIT_FEE = 0.05; // %
const HL_FEE = 0.035; // %
const TRANSFER_FEE = 0.1; // %
const TOTAL_FEE_PERCENT = UPBIT_FEE + HL_FEE + TRANSFER_FEE; // ~0.185%

const TRANSFER_TIMES: Record<string, number> = {
  BTC: 10 * 60 * 1000,
  ETH: 5 * 60 * 1000,
  SOL: 1 * 60 * 1000,
  XRP: 1 * 60 * 1000,
  DOGE: 5 * 60 * 1000,
};
const DEFAULT_TRANSFER_TIME = 5 * 60 * 1000;

const HL_PREFIX_MAP: Record<string, string> = {
  kPEPE: 'PEPE', kSHIB: 'SHIB', kBONK: 'BONK', kFLOKI: 'FLOKI',
  kDOGS: 'DOGS', kNEIRO: 'NEIRO', kLUNC: 'LUNC',
};

// === Helpers ===
function getKimpColor(kimp: number): string {
  if (kimp >= 5) return '#EF4444';
  if (kimp >= 2) return '#FF5C00';
  if (kimp >= 0) return '#22C55E';
  if (kimp >= -2) return '#3B82F6';
  return '#8B5CF6';
}

function getTransferTime(symbol: string): number {
  return TRANSFER_TIMES[symbol] ?? DEFAULT_TRANSFER_TIME;
}

function formatTime(ms: number): string {
  if (ms <= 0) return '0:00';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function KimpSimPage() {
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [positions, setPositions] = useState<ArbitragePosition[]>([]);
  const [history, setHistory] = useState<CompletedTrade[]>([]);

  // Live data
  const [coins, setCoins] = useState<KimpCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [usdtKimp, setUsdtKimp] = useState(0);

  // Form state
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [direction, setDirection] = useState<'upbit_to_hl' | 'hl_to_upbit'>('upbit_to_hl');
  const [amount, setAmount] = useState(500);

  // Timer tick
  const [, setTick] = useState(0);

  // === localStorage Load ===
  useEffect(() => {
    setMounted(true);
    try {
      const b = localStorage.getItem('kimp-sim-balance');
      const p = localStorage.getItem('kimp-sim-positions');
      const h = localStorage.getItem('kimp-sim-history');
      if (b) setBalance(parseFloat(b));
      if (p) setPositions(JSON.parse(p));
      if (h) setHistory(JSON.parse(h));
    } catch {}
  }, []);

  // === localStorage Save ===
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('kimp-sim-balance', balance.toString());
      localStorage.setItem('kimp-sim-positions', JSON.stringify(positions));
      localStorage.setItem('kimp-sim-history', JSON.stringify(history));
    }
  }, [balance, positions, history, mounted]);

  // === Fetch Kimp Data ===
  const fetchKimp = useCallback(async () => {
    try {
      const res = await fetch('/api/kimp');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const { hlMeta, hlMids, upbitTickers, krwRate } = data;

      const hlTokens: Record<string, number> = {};
      for (const u of hlMeta) {
        const name = u.name as string;
        const mapped = HL_PREFIX_MAP[name] || name;
        const price = parseFloat(hlMids[name] || '0');
        if (price > 0) hlTokens[mapped] = price;
      }

      const upbitPrices = upbitTickers as Record<string, { price: number; change: number; volume: number }>;
      const usdtUpbit = upbitPrices['USDT']?.price || 0;
      const currentUsdtKimp = usdtUpbit > 0 ? ((usdtUpbit / krwRate) - 1) * 100 : 0;
      setUsdtKimp(currentUsdtKimp);

      const hlSymbols = Object.keys(hlTokens);
      const upbitSymbols = Object.keys(upbitPrices);
      const overlap = hlSymbols.filter(s => upbitSymbols.includes(s) && s !== 'USDT' && s !== 'USDC');

      const newCoins: KimpCoin[] = overlap.map(symbol => {
        const hlPrice = hlTokens[symbol];
        const upbitKrw = upbitPrices[symbol].price;
        const upbitUsd = upbitKrw / krwRate;
        const kimp = hlPrice > 0 ? ((upbitUsd - hlPrice) / hlPrice) * 100 : 0;
        const netKimp = kimp - UPBIT_FEE - HL_FEE;
        const pureKimp = kimp - currentUsdtKimp;

        let signal: 'go' | 'wait' | 'stop' = 'wait';
        if (pureKimp > 1.5) signal = 'go';
        if (pureKimp < -1.5) signal = 'go';
        if (Math.abs(pureKimp) < 0.3) signal = 'stop';

        return { symbol, hlPrice, upbitPriceKrw: upbitKrw, upbitPriceUsd: upbitUsd, kimp, netKimp, pureKimp, volume24hKrw: upbitPrices[symbol].volume, change24h: upbitPrices[symbol].change, signal };
      });

      setCoins(newCoins);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Kimp fetch error:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKimp();
    const interval = setInterval(fetchKimp, 30000);
    return () => clearInterval(interval);
  }, [fetchKimp]);

  // === Timer for transfer countdown ===
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      // Auto-update status
      setPositions(prev => prev.map(p => {
        if (p.status === 'transferring' && Date.now() >= p.transferCompleteTime) {
          return { ...p, status: 'ready_to_close' };
        }
        return p;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // === Selected coin data ===
  const selectedCoin = useMemo(() => coins.find(c => c.symbol === selectedSymbol), [coins, selectedSymbol]);

  // === Open Position ===
  const openPosition = () => {
    if (!selectedCoin) return;
    if (amount < 100 || amount > 5000) { alert('$100 ~ $5,000 사이로 입력하세요'); return; }
    if (amount > balance) { alert('잔액이 부족합니다'); return; }

    const fees = amount * (TOTAL_FEE_PERCENT / 100);
    const now = Date.now();
    const transferTime = getTransferTime(selectedSymbol);

    const pos: ArbitragePosition = {
      id: now.toString(),
      symbol: selectedSymbol,
      direction,
      amount,
      entryKimp: selectedCoin.kimp,
      entryPureKimp: selectedCoin.pureKimp,
      entryTime: now,
      transferCompleteTime: now + transferTime,
      status: 'transferring',
      fees,
    };

    setPositions(prev => [pos, ...prev]);
    setBalance(prev => prev - amount);
  };

  // === Close Position ===
  const closePosition = (posId: string) => {
    const pos = positions.find(p => p.id === posId);
    if (!pos) return;

    const currentCoin = coins.find(c => c.symbol === pos.symbol);
    if (!currentCoin) { alert('현재 김프 데이터를 불러오는 중입니다'); return; }

    const exitKimp = currentCoin.kimp;
    let kimpDiff: number;

    if (pos.direction === 'upbit_to_hl') {
      // 업비트에서 사서 HL에서 팔기: 김프가 줄어들면 이익
      kimpDiff = pos.entryKimp - exitKimp;
    } else {
      // HL에서 사서 업비트에서 팔기: 김프가 커지면 이익
      kimpDiff = exitKimp - pos.entryKimp;
    }

    const grossPnl = pos.amount * (kimpDiff / 100);
    const pnl = grossPnl - pos.fees;
    const pnlPercent = (pnl / pos.amount) * 100;

    const trade: CompletedTrade = {
      id: pos.id,
      symbol: pos.symbol,
      direction: pos.direction,
      amount: pos.amount,
      entryKimp: pos.entryKimp,
      exitKimp,
      pnl,
      pnlPercent,
      fees: pos.fees,
      openedAt: pos.entryTime,
      closedAt: Date.now(),
    };

    setHistory(prev => [trade, ...prev].slice(0, 50));
    setPositions(prev => prev.filter(p => p.id !== posId));
    setBalance(prev => prev + pos.amount + pnl);
  };

  // === Reset ===
  const resetAll = () => {
    if (!confirm('모든 데이터를 초기화하시겠습니까?')) return;
    setBalance(INITIAL_BALANCE);
    setPositions([]);
    setHistory([]);
  };

  // === Stats ===
  const totalPnl = history.reduce((s, t) => s + t.pnl, 0);
  const winCount = history.filter(t => t.pnl > 0).length;
  const winRate = history.length > 0 ? (winCount / history.length) * 100 : 0;

  // Sort coins by absolute pureKimp for selection
  const sortedCoins = useMemo(() => [...coins].sort((a, b) => Math.abs(b.pureKimp) - Math.abs(a.pureKimp)), [coins]);

  if (!mounted) return null;

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
              <Link href="/kimp" className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors">김프</Link>
              <span className="px-3 py-1.5 rounded-lg bg-[#1A1A1D] text-white">시뮬</span>
              <Link href="/blog" className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors">블로그</Link>
              <Link href="/whales" className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors">고래</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(34,197,94,0.08)] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              <span className="text-[#22C55E] text-[11px] font-medium">LIVE</span>
            </span>
            <button onClick={fetchKimp} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] transition-colors">&#8635;</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* === Stats Bar === */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
            <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider">잔액</p>
            <p className="text-xl font-bold font-mono mt-1">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
            <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider">총 PnL</p>
            <p className={`text-xl font-bold font-mono mt-1 ${totalPnl >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </p>
          </div>
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
            <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider">승률</p>
            <p className="text-xl font-bold font-mono mt-1">
              {history.length > 0 ? `${winRate.toFixed(0)}%` : '-'}
              <span className="text-xs text-[#6B6B70] ml-1">({winCount}/{history.length})</span>
            </p>
          </div>
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
            <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider">활성 포지션</p>
            <p className="text-xl font-bold font-mono mt-1">{positions.length}
              <span className="text-xs text-[#6B6B70] ml-1">/ {positions.filter(p => p.status === 'transferring').length} 전송중</span>
            </p>
          </div>
        </div>

        {/* === New Position Form === */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">새 포지션 열기</h2>
            <span className="text-[10px] text-[#6B6B70]">
              USDT 김프: <span className="text-[#FF5C00] font-mono">{usdtKimp > 0 ? '+' : ''}{usdtKimp.toFixed(2)}%</span>
              {lastUpdate && <span className="ml-2">{Math.round((Date.now() - lastUpdate.getTime()) / 1000)}초 전</span>}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-[#6B6B70]">
              <div className="w-5 h-5 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin mr-2"></div>
              데이터 로딩 중...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Coin Select */}
              <div>
                <label className="text-xs text-[#8B8B90] mb-1.5 block">코인 선택</label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {sortedCoins.slice(0, 16).map(c => (
                    <button key={c.symbol} onClick={() => setSelectedSymbol(c.symbol)}
                      className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${selectedSymbol === c.symbol
                        ? 'bg-[#FF5C00]/10 border-[#FF5C00]/40 text-[#FF5C00]'
                        : 'bg-[#0A0A0B] border-[#1F1F23] text-[#8B8B90] hover:border-[#333]'}`}>
                      <span className="block font-medium">{c.symbol}</span>
                      <span className="block font-mono text-[10px] mt-0.5" style={{ color: getKimpColor(c.pureKimp) }}>
                        {c.pureKimp > 0 ? '+' : ''}{c.pureKimp.toFixed(1)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direction + Amount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Direction */}
                <div>
                  <label className="text-xs text-[#8B8B90] mb-1.5 block">방향</label>
                  <div className="flex gap-2">
                    <button onClick={() => setDirection('upbit_to_hl')}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all ${direction === 'upbit_to_hl'
                        ? 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
                        : 'bg-[#0A0A0B] border-[#1F1F23] text-[#8B8B90] hover:border-[#333]'}`}>
                      <span className="block text-[10px] mb-0.5">김프 매매</span>
                      업비트 → HL
                    </button>
                    <button onClick={() => setDirection('hl_to_upbit')}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all ${direction === 'hl_to_upbit'
                        ? 'bg-[#3B82F6]/10 border-[#3B82F6]/40 text-[#3B82F6]'
                        : 'bg-[#0A0A0B] border-[#1F1F23] text-[#8B8B90] hover:border-[#333]'}`}>
                      <span className="block text-[10px] mb-0.5">역김프 매매</span>
                      HL → 업비트
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-xs text-[#8B8B90] mb-1.5 block">금액 (USD)</label>
                  <input type="number" min={100} max={5000} step={100} value={amount}
                    onChange={e => setAmount(Math.max(100, Math.min(5000, Number(e.target.value))))}
                    className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#FF5C00]" />
                  <div className="flex gap-1.5 mt-1.5">
                    {[100, 500, 1000, 2000].map(v => (
                      <button key={v} onClick={() => setAmount(v)}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${amount === v ? 'border-[#FF5C00]/40 text-[#FF5C00]' : 'border-[#1F1F23] text-[#6B6B70] hover:text-[#8B8B90]'}`}>
                        ${v.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info + Open */}
                <div>
                  <label className="text-xs text-[#8B8B90] mb-1.5 block">요약</label>
                  {selectedCoin && (
                    <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-3 py-2 text-[11px] space-y-1 mb-2">
                      <div className="flex justify-between">
                        <span className="text-[#6B6B70]">현재 김프</span>
                        <span className="font-mono" style={{ color: getKimpColor(selectedCoin.kimp) }}>
                          {selectedCoin.kimp > 0 ? '+' : ''}{selectedCoin.kimp.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6B70]">전송 시간</span>
                        <span className="font-mono text-[#ADADB0]">{formatTime(getTransferTime(selectedSymbol))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6B70]">예상 수수료</span>
                        <span className="font-mono text-[#EF4444]">${(amount * TOTAL_FEE_PERCENT / 100).toFixed(2)} ({TOTAL_FEE_PERCENT.toFixed(3)}%)</span>
                      </div>
                    </div>
                  )}
                  <button onClick={openPosition} disabled={!selectedCoin || amount > balance}
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    포지션 열기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === Active Positions === */}
        {positions.length > 0 && (
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1F1F23] flex items-center justify-between">
              <h2 className="text-sm font-semibold">활성 포지션 ({positions.length})</h2>
            </div>
            <div className="divide-y divide-[#1F1F23]/50">
              {positions.map(pos => {
                const currentCoin = coins.find(c => c.symbol === pos.symbol);
                const currentKimp = currentCoin?.kimp ?? pos.entryKimp;
                const remaining = pos.transferCompleteTime - Date.now();
                const isReady = pos.status === 'ready_to_close';

                // Calculate unrealized PnL
                let kimpDiff: number;
                if (pos.direction === 'upbit_to_hl') {
                  kimpDiff = pos.entryKimp - currentKimp;
                } else {
                  kimpDiff = currentKimp - pos.entryKimp;
                }
                const unrealizedPnl = pos.amount * (kimpDiff / 100) - pos.fees;

                return (
                  <div key={pos.id} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white">{pos.symbol}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${pos.direction === 'upbit_to_hl'
                          ? 'bg-[#EF4444]/10 text-[#EF4444]'
                          : 'bg-[#3B82F6]/10 text-[#3B82F6]'}`}>
                          {pos.direction === 'upbit_to_hl' ? '업비트→HL' : 'HL→업비트'}
                        </span>
                        <span className="text-xs text-[#6B6B70] font-mono">${pos.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`font-mono text-sm ${unrealizedPnl >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toFixed(2)}
                          </span>
                        </div>
                        {isReady ? (
                          <button onClick={() => closePosition(pos.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#22C55E] hover:bg-[#16A34A] text-black transition-colors">
                            닫기
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#F59E0B]/10 text-[#F59E0B]">
                            {formatTime(remaining)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-[#6B6B70]">
                      <span>진입: <span className="font-mono" style={{ color: getKimpColor(pos.entryKimp) }}>{pos.entryKimp > 0 ? '+' : ''}{pos.entryKimp.toFixed(2)}%</span></span>
                      <span>현재: <span className="font-mono" style={{ color: getKimpColor(currentKimp) }}>{currentKimp > 0 ? '+' : ''}{currentKimp.toFixed(2)}%</span></span>
                      <span>수수료: <span className="font-mono text-[#EF4444]">${pos.fees.toFixed(2)}</span></span>
                      {!isReady && (
                        <>
                          <span className="text-[#F59E0B]">전송 중...</span>
                          <div className="flex-1 max-w-[100px] h-1 bg-[#1F1F23] rounded-full overflow-hidden">
                            <div className="h-full bg-[#F59E0B] rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min(100, ((Date.now() - pos.entryTime) / (pos.transferCompleteTime - pos.entryTime)) * 100)}%` }} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === Trade History === */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1F1F23] flex items-center justify-between">
            <h2 className="text-sm font-semibold">거래 기록 ({history.length})</h2>
            <button onClick={resetAll} className="text-[10px] text-[#6B6B70] hover:text-[#EF4444] transition-colors">초기화</button>
          </div>
          {history.length === 0 ? (
            <div className="px-5 py-10 text-center text-[#4A4A4E] text-sm">
              아직 완료된 거래가 없습니다
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#6B6B70] border-b border-[#1F1F23] bg-[#0D0D0E] text-[11px] font-semibold tracking-wider uppercase">
                    <th className="text-left py-2.5 px-4">날짜</th>
                    <th className="text-left py-2.5 px-3">코인</th>
                    <th className="text-left py-2.5 px-3">방향</th>
                    <th className="text-right py-2.5 px-3">금액</th>
                    <th className="text-right py-2.5 px-3">진입김프</th>
                    <th className="text-right py-2.5 px-3">종료김프</th>
                    <th className="text-right py-2.5 px-3">수수료</th>
                    <th className="text-right py-2.5 px-4">PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(t => (
                    <tr key={t.id} className="border-b border-[#1F1F23]/50 hover:bg-[#0A0A0B] transition-colors text-[13px]">
                      <td className="py-2 px-4 text-[11px] text-[#6B6B70]">{formatDate(t.closedAt)}</td>
                      <td className="py-2 px-3 font-medium text-white">{t.symbol}</td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.direction === 'upbit_to_hl'
                          ? 'bg-[#EF4444]/10 text-[#EF4444]'
                          : 'bg-[#3B82F6]/10 text-[#3B82F6]'}`}>
                          {t.direction === 'upbit_to_hl' ? '업→HL' : 'HL→업'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[#ADADB0]">${t.amount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-mono" style={{ color: getKimpColor(t.entryKimp) }}>
                        {t.entryKimp > 0 ? '+' : ''}{t.entryKimp.toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-right font-mono" style={{ color: getKimpColor(t.exitKimp) }}>
                        {t.exitKimp > 0 ? '+' : ''}{t.exitKimp.toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[#6B6B70]">${t.fees.toFixed(2)}</td>
                      <td className="py-2 px-4 text-right">
                        <span className={`font-mono font-medium ${t.pnl >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                          {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                        </span>
                        <span className={`block text-[10px] font-mono ${t.pnl >= 0 ? 'text-[#22C55E]/70' : 'text-[#EF4444]/70'}`}>
                          {t.pnlPercent >= 0 ? '+' : ''}{t.pnlPercent.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* === Guide === */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5 text-xs text-[#6B6B70]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-[#8B8B90] mb-1">김프 매매 (업비트→HL)</p>
              <p>김프가 높을 때 업비트에서 코인을 사서 HL로 전송 후 매도. 김프가 줄어들면 이익!</p>
            </div>
            <div>
              <p className="font-medium text-[#8B8B90] mb-1">역김프 매매 (HL→업비트)</p>
              <p>역김프일 때 HL에서 코인을 사서 업비트로 전송 후 매도. 김프가 커지면 이익!</p>
            </div>
            <div>
              <p className="font-medium text-[#8B8B90] mb-1">수수료 구조</p>
              <p>업비트 {UPBIT_FEE}% + HL {HL_FEE}% + 전송 {TRANSFER_FEE}% = 총 {TOTAL_FEE_PERCENT.toFixed(3)}%. 김프 변동이 이보다 커야 수익!</p>
            </div>
          </div>
        </div>

      </main>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-md border-t border-[#1F1F23]">
        <div className="flex justify-around py-2 pb-[env(safe-area-inset-bottom)]">
          <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">&#127968;</span><span className="text-[10px]">홈</span></Link>
          <Link href="/kimp" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">&#128200;</span><span className="text-[10px]">김프</span></Link>
          <span className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#FF5C00]"><span className="text-lg">&#127922;</span><span className="text-[10px]">시뮬</span></span>
          <Link href="/whales" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">&#128011;</span><span className="text-[10px]">고래</span></Link>
          <Link href="/blog" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">&#128221;</span><span className="text-[10px]">블로그</span></Link>
        </div>
      </nav>
      <div className="h-16 md:hidden"></div>
    </div>
  );
}
