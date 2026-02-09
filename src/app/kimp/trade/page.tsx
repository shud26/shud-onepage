'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const PIN = '1507';
const ALERT_COOLDOWN = 10 * 60 * 1000; // 10분
const KIMP_ALERT_THRESHOLD = 3; // ±3%

interface TradeRecord {
  id: string;
  action: 'buy' | 'sell';
  amount: number;
  message: string;
  success: boolean;
  timestamp: number;
}

export default function KimpTradePage() {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // Upbit balance
  const [krw, setKrw] = useState(0);
  const [usdt, setUsdt] = useState(0);
  const [usdtPrice, setUsdtPrice] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Kimp data
  const [usdtKimp, setUsdtKimp] = useState(0);
  const [krwRate, setKrwRate] = useState(0);
  const [kimpLoading, setKimpLoading] = useState(true);
  const [lastKimpUpdate, setLastKimpUpdate] = useState<Date | null>(null);

  // Trade
  const [orderLoading, setOrderLoading] = useState(false);
  const [history, setHistory] = useState<TradeRecord[]>([]);

  // Auto alert
  const [autoAlert, setAutoAlert] = useState(true);
  const lastAlertRef = useRef<{ buy: number; sell: number }>({ buy: 0, sell: 0 });

  // === Mount ===
  useEffect(() => {
    setMounted(true);
    try {
      const h = localStorage.getItem('kimp-trade-history');
      if (h) setHistory(JSON.parse(h));
      const la = localStorage.getItem('kimp-trade-last-alert');
      if (la) lastAlertRef.current = JSON.parse(la);
      const aa = localStorage.getItem('kimp-trade-auto-alert');
      if (aa !== null) setAutoAlert(aa === 'true');
    } catch {}
  }, []);

  // === Save history ===
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('kimp-trade-history', JSON.stringify(history));
    }
  }, [history, mounted]);

  // === Save auto alert ===
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('kimp-trade-auto-alert', String(autoAlert));
    }
  }, [autoAlert, mounted]);

  // === PIN login ===
  const handleLogin = () => {
    if (pinInput === PIN) {
      setLoggedIn(true);
      setPinInput('');
    } else {
      alert('PIN이 틀립니다');
      setPinInput('');
    }
  };

  // === Fetch balance ===
  const fetchBalance = useCallback(async () => {
    if (!loggedIn) return;
    setBalanceLoading(true);
    try {
      const res = await fetch(`/api/upbit?pin=${PIN}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setKrw(data.krw);
      setUsdt(data.usdt);
      setUsdtPrice(data.usdtPrice);
    } catch (error) {
      console.error('Balance fetch error:', error);
    }
    setBalanceLoading(false);
  }, [loggedIn]);

  // === Fetch kimp ===
  const fetchKimp = useCallback(async () => {
    try {
      const res = await fetch('/api/kimp');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const { upbitTickers, krwRate: rate } = data;

      const usdtUpbit = upbitTickers['USDT']?.price || 0;
      const currentKimp = usdtUpbit > 0 ? ((usdtUpbit / rate) - 1) * 100 : 0;
      setUsdtKimp(currentKimp);
      setKrwRate(rate);
      setLastKimpUpdate(new Date());
      setKimpLoading(false);

      return currentKimp;
    } catch (error) {
      console.error('Kimp fetch error:', error);
      setKimpLoading(false);
      return null;
    }
  }, []);

  // === Send telegram alert with buttons ===
  const sendKimpAlert = useCallback(async (kimp: number, direction: 'buy' | 'sell') => {
    const now = Date.now();
    const lastTime = lastAlertRef.current[direction];
    if (now - lastTime < ALERT_COOLDOWN) return;

    lastAlertRef.current[direction] = now;
    localStorage.setItem('kimp-trade-last-alert', JSON.stringify(lastAlertRef.current));

    const emoji = direction === 'sell' ? '🔴' : '🟢';
    const actionText = direction === 'sell' ? '매도' : '매수';
    const reason = direction === 'sell'
      ? `김프 ${kimp.toFixed(2)}% (≥${KIMP_ALERT_THRESHOLD}%)`
      : `역김프 ${kimp.toFixed(2)}% (≤-${KIMP_ALERT_THRESHOLD}%)`;

    try {
      await fetch('/api/kimp-trade-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: PIN,
          kimp,
          direction,
          emoji,
          actionText,
          reason,
        }),
      });
    } catch (error) {
      console.error('Alert send error:', error);
    }
  }, []);

  // === Polling: kimp + balance ===
  useEffect(() => {
    fetchKimp();
    if (loggedIn) fetchBalance();

    const interval = setInterval(async () => {
      const kimp = await fetchKimp();
      if (loggedIn) fetchBalance();

      // Auto alert
      if (autoAlert && kimp !== null) {
        if (kimp >= KIMP_ALERT_THRESHOLD) {
          sendKimpAlert(kimp, 'sell');
        } else if (kimp <= -KIMP_ALERT_THRESHOLD) {
          sendKimpAlert(kimp, 'buy');
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchKimp, fetchBalance, loggedIn, autoAlert, sendKimpAlert]);

  // === Execute order ===
  const executeOrder = async (action: 'buy' | 'sell', amount: number) => {
    if (!confirm(`USDT ${action === 'buy' ? '매수' : '매도'} ${amount.toLocaleString()}원 실행하시겠습니까?`)) return;

    setOrderLoading(true);
    try {
      const res = await fetch('/api/upbit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: PIN, action, amount }),
      });

      const result = await res.json();

      const record: TradeRecord = {
        id: Date.now().toString(),
        action,
        amount,
        message: result.message || result.error || 'Unknown',
        success: result.success || false,
        timestamp: Date.now(),
      };

      setHistory(prev => [record, ...prev].slice(0, 50));

      if (result.success) {
        await fetchBalance();
      }
    } catch (error) {
      const record: TradeRecord = {
        id: Date.now().toString(),
        action,
        amount,
        message: error instanceof Error ? error.message : 'Network error',
        success: false,
        timestamp: Date.now(),
      };
      setHistory(prev => [record, ...prev].slice(0, 50));
    }
    setOrderLoading(false);
  };

  // === Kimp color ===
  const getKimpColor = (k: number) => {
    if (k >= 5) return '#EF4444';
    if (k >= 2) return '#FF5C00';
    if (k >= 0) return '#22C55E';
    if (k >= -2) return '#3B82F6';
    return '#8B5CF6';
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (!mounted) return null;

  // === PIN Login Screen ===
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-[#e5e5e5] flex items-center justify-center">
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-8 w-80">
          <h1 className="text-lg font-bold text-center mb-1">USDT Trade</h1>
          <p className="text-xs text-[#6B6B70] text-center mb-6">PIN을 입력하세요</p>
          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#FF5C00] mb-4"
            placeholder="****"
            autoFocus
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-lg text-sm font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] transition-colors"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#e5e5e5]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-[#1F1F23]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              KIMP<span className="text-[#FF5C00]">.</span>BOT
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors">홈</Link>
              <Link href="/kimp" className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors">김프</Link>
              <Link href="/kimp/sim" className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors">시뮬</Link>
              <span className="px-3 py-1.5 rounded-lg bg-[#1A1A1D] text-white">거래</span>
              <Link href="/blog" className="px-3 py-1.5 rounded-lg text-[#8B8B90] hover:text-white hover:bg-[#111113] transition-colors">블로그</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(239,68,68,0.08)] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse"></span>
              <span className="text-[#EF4444] text-[11px] font-medium">REAL</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* === USDT 김프 표시 === */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">USDT 김치 프리미엄</h2>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[10px] text-[#6B6B70]">자동 알림</span>
                <button
                  onClick={() => setAutoAlert(!autoAlert)}
                  className={`relative w-8 h-4 rounded-full transition-colors ${autoAlert ? 'bg-[#FF5C00]' : 'bg-[#333]'}`}
                >
                  <span
                    className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                    style={{ left: autoAlert ? '17px' : '2px' }}
                  />
                </button>
              </label>
              {lastKimpUpdate && (
                <span className="text-[10px] text-[#6B6B70]">
                  {Math.round((Date.now() - lastKimpUpdate.getTime()) / 1000)}초 전
                </span>
              )}
            </div>
          </div>

          {kimpLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-[#6B6B70] text-sm">로딩 중...</span>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] text-[#6B6B70] uppercase mb-1">USDT 김프</p>
                <p
                  className="text-4xl font-bold font-mono"
                  style={{ color: getKimpColor(usdtKimp) }}
                >
                  {usdtKimp > 0 ? '+' : ''}{usdtKimp.toFixed(2)}%
                </p>
              </div>
              <div className="text-xs text-[#6B6B70] space-y-1">
                <p>환율: {krwRate.toFixed(0)}원/$</p>
                <p>알림 조건: ±{KIMP_ALERT_THRESHOLD}%</p>
                {autoAlert && (
                  <p className="text-[#FF5C00]">자동 알림 ON (텔레그램)</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* === 잔고 === */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
            <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider">KRW 잔액</p>
            <p className="text-lg font-bold font-mono mt-1">
              {balanceLoading ? '...' : `${Math.floor(krw).toLocaleString()}원`}
            </p>
          </div>
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
            <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider">USDT 잔액</p>
            <p className="text-lg font-bold font-mono mt-1">
              {balanceLoading ? '...' : `${usdt.toFixed(2)} USDT`}
            </p>
            <p className="text-[10px] text-[#6B6B70] mt-0.5">
              {balanceLoading ? '' : `≈ ${Math.floor(usdt * usdtPrice).toLocaleString()}원`}
            </p>
          </div>
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
            <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider">USDT 현재가</p>
            <p className="text-lg font-bold font-mono mt-1">
              {balanceLoading ? '...' : `${usdtPrice.toLocaleString()}원`}
            </p>
          </div>
        </div>

        {/* === 매매 버튼 === */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">USDT 매매</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* 매수 */}
            <div className="space-y-2">
              <p className="text-xs text-[#22C55E] font-medium">매수 (KRW → USDT)</p>
              <button
                onClick={() => executeOrder('buy', 50000)}
                disabled={orderLoading}
                className="w-full py-3 rounded-lg text-sm font-medium bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors disabled:opacity-30"
              >
                매수 5만원
              </button>
              <button
                onClick={() => executeOrder('buy', 100000)}
                disabled={orderLoading}
                className="w-full py-3 rounded-lg text-sm font-medium bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors disabled:opacity-30"
              >
                매수 10만원
              </button>
            </div>

            {/* 매도 */}
            <div className="space-y-2">
              <p className="text-xs text-[#EF4444] font-medium">매도 (USDT → KRW)</p>
              <button
                onClick={() => executeOrder('sell', 50000)}
                disabled={orderLoading}
                className="w-full py-3 rounded-lg text-sm font-medium bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors disabled:opacity-30"
              >
                매도 5만원
              </button>
              <button
                onClick={() => executeOrder('sell', 100000)}
                disabled={orderLoading}
                className="w-full py-3 rounded-lg text-sm font-medium bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors disabled:opacity-30"
              >
                매도 10만원
              </button>
            </div>
          </div>

          {orderLoading && (
            <div className="flex items-center justify-center mt-4">
              <div className="w-4 h-4 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-sm text-[#6B6B70]">주문 처리 중...</span>
            </div>
          )}

          <div className="mt-4 p-3 bg-[#0A0A0B] border border-[#1F1F23] rounded-lg text-[11px] text-[#6B6B70]">
            <p>⚠️ 1회 최대 10만원 | 시장가 주문 | 모든 거래는 텔레그램 알림</p>
          </div>
        </div>

        {/* === 거래 기록 === */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1F1F23] flex items-center justify-between">
            <h2 className="text-sm font-semibold">거래 기록 ({history.length})</h2>
            {history.length > 0 && (
              <button
                onClick={() => { if (confirm('거래 기록을 삭제하시겠습니까?')) setHistory([]); }}
                className="text-[10px] text-[#6B6B70] hover:text-[#EF4444] transition-colors"
              >
                초기화
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="px-5 py-10 text-center text-[#4A4A4E] text-sm">
              아직 거래 기록이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-[#1F1F23]/50">
              {history.map(t => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${t.success ? (t.action === 'buy' ? '' : '') : ''}`}>
                      {t.success ? (t.action === 'buy' ? '🟢' : '🔴') : '❌'}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        USDT {t.action === 'buy' ? '매수' : '매도'}{' '}
                        <span className="font-mono">{t.amount.toLocaleString()}원</span>
                      </p>
                      <p className="text-[11px] text-[#6B6B70]">{t.message}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#6B6B70]">{formatDate(t.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === 가이드 === */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5 text-xs text-[#6B6B70]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-[#8B8B90] mb-1">김프 매도 전략</p>
              <p>김프 3% 이상일 때 USDT를 업비트에서 비싸게 매도. 해외에서 다시 매수하면 차익 발생.</p>
            </div>
            <div>
              <p className="font-medium text-[#8B8B90] mb-1">역김프 매수 전략</p>
              <p>역김프(-)일 때 업비트에서 USDT를 싸게 매수. 해외로 전송하면 차익 발생.</p>
            </div>
            <div>
              <p className="font-medium text-[#8B8B90] mb-1">텔레그램 원클릭</p>
              <p>김프 ±3% 감지 시 텔레그램 알림 + 인라인 버튼. 원클릭으로 즉시 매매!</p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-md border-t border-[#1F1F23]">
        <div className="flex justify-around py-2 pb-[env(safe-area-inset-bottom)]">
          <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">&#127968;</span><span className="text-[10px]">홈</span></Link>
          <Link href="/kimp" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">&#128200;</span><span className="text-[10px]">김프</span></Link>
          <Link href="/kimp/sim" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">&#127922;</span><span className="text-[10px]">시뮬</span></Link>
          <span className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#FF5C00]"><span className="text-lg">&#128176;</span><span className="text-[10px]">거래</span></span>
          <Link href="/blog" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#6B6B70]"><span className="text-lg">&#128221;</span><span className="text-[10px]">블로그</span></Link>
        </div>
      </nav>
      <div className="h-16 md:hidden"></div>
    </div>
  );
}
