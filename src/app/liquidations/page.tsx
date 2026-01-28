'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Liquidation {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL'; // BUY = short liquidated, SELL = long liquidated
  price: number;
  quantity: number;
  usdValue: number;
  timestamp: number;
}

interface Stats {
  total24h: number;
  longLiquidated: number;
  shortLiquidated: number;
  largestSingle: Liquidation | null;
  count: number;
}

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
}

const LEVERAGE_LEVELS = [5, 10, 25, 50, 100];

// Calculate liquidation price
function calcLiquidationPrice(
  entryPrice: number,
  leverage: number,
  isLong: boolean
): number {
  // Simplified formula (actual varies by exchange/maintenance margin)
  // Long: liquidation when price drops by ~(1/leverage)
  // Short: liquidation when price rises by ~(1/leverage)
  const movePercent = 1 / leverage;
  if (isLong) {
    return entryPrice * (1 - movePercent * 0.95); // 0.95 for maintenance margin buffer
  } else {
    return entryPrice * (1 + movePercent * 0.95);
  }
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (price >= 1) return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return price.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

export default function LiquidationsPage() {
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [stats, setStats] = useState<Stats>({
    total24h: 0,
    longLiquidated: 0,
    shortLiquidated: 0,
    largestSingle: null,
    count: 0,
  });
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [selectedCoin, setSelectedCoin] = useState<'BTC' | 'ETH' | 'SOL'>('BTC');
  const [isConnected, setIsConnected] = useState(false);
  const [minValueFilter, setMinValueFilter] = useState(10000); // $10K minimum
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current prices
  const fetchPrices = useCallback(async () => {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
      const responses = await Promise.all(
        symbols.map(s =>
          fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${s}`)
            .then(r => r.json())
        )
      );

      const newPrices: Record<string, PriceData> = {};
      responses.forEach((data) => {
        const coin = data.symbol.replace('USDT', '');
        newPrices[coin] = {
          symbol: coin,
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChangePercent),
        };
      });
      setPrices(newPrices);
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    }
  }, []);

  // Connect to Binance liquidation WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket('wss://fstream.binance.com/ws/!forceOrder@arr');

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const order = data.o;

        const usdValue = parseFloat(order.p) * parseFloat(order.q);

        // Only track significant liquidations
        if (usdValue < minValueFilter) return;

        const liq: Liquidation = {
          id: `${order.s}-${order.T}-${Math.random()}`,
          symbol: order.s.replace('USDT', ''),
          side: order.S,
          price: parseFloat(order.p),
          quantity: parseFloat(order.q),
          usdValue,
          timestamp: order.T,
        };

        setLiquidations(prev => [liq, ...prev].slice(0, 100));

        // Update stats
        setStats(prev => {
          const isLong = order.S === 'SELL';
          const newStats = {
            ...prev,
            total24h: prev.total24h + usdValue,
            longLiquidated: isLong ? prev.longLiquidated + usdValue : prev.longLiquidated,
            shortLiquidated: !isLong ? prev.shortLiquidated + usdValue : prev.shortLiquidated,
            count: prev.count + 1,
            largestSingle: (!prev.largestSingle || usdValue > prev.largestSingle.usdValue)
              ? liq
              : prev.largestSingle,
          };
          return newStats;
        });
      } catch (err) {
        console.error('Failed to parse liquidation:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      ws.close();
    };

    wsRef.current = ws;
  }, [minValueFilter]);

  useEffect(() => {
    fetchPrices();
    connectWebSocket();

    // Refresh prices every 10 seconds
    const priceInterval = setInterval(fetchPrices, 10000);

    return () => {
      clearInterval(priceInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchPrices, connectWebSocket]);

  const currentPrice = prices[selectedCoin]?.price || 0;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold tracking-[4px] font-mono-data hover:text-[#FF5C00] transition-colors">SHUD</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
            <span className="text-[13px] text-[#6B6B70]">청산 트래커</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full ${isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {isConnected ? 'LIVE' : 'Connecting...'}
            </span>
          </div>
        </nav>
      </header>

      <main className="min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Title */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight mb-2">
              실시간 청산 트래커
            </h1>
            <p className="text-[#8B8B90] text-sm">
              Binance Futures 청산 실시간 모니터링 + 레버리지별 청산 레벨 계산
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
              <p className="text-[11px] text-[#6B6B70] uppercase tracking-wide mb-1">세션 총 청산</p>
              <p className="text-xl font-semibold text-white font-mono-data">{formatUsd(stats.total24h)}</p>
            </div>
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
              <p className="text-[11px] text-[#6B6B70] uppercase tracking-wide mb-1">롱 청산</p>
              <p className="text-xl font-semibold text-[#ef4444] font-mono-data">{formatUsd(stats.longLiquidated)}</p>
            </div>
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
              <p className="text-[11px] text-[#6B6B70] uppercase tracking-wide mb-1">숏 청산</p>
              <p className="text-xl font-semibold text-[#22c55e] font-mono-data">{formatUsd(stats.shortLiquidated)}</p>
            </div>
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
              <p className="text-[11px] text-[#6B6B70] uppercase tracking-wide mb-1">청산 건수</p>
              <p className="text-xl font-semibold text-white font-mono-data">{stats.count}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Liquidation Level Calculator */}
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold text-white">청산 레벨 계산기</h2>
                <div className="flex gap-2">
                  {(['BTC', 'ETH', 'SOL'] as const).map(coin => (
                    <button
                      key={coin}
                      onClick={() => setSelectedCoin(coin)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedCoin === coin
                          ? 'bg-[#FF5C00] text-white'
                          : 'bg-[#1A1A1D] text-[#8B8B90] hover:text-white'
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>
              </div>

              {currentPrice > 0 ? (
                <>
                  {/* Current Price */}
                  <div className="text-center mb-6 py-4 bg-[#0A0A0B] rounded-lg">
                    <p className="text-[11px] text-[#6B6B70] mb-1">현재가</p>
                    <p className="text-2xl font-bold text-white font-mono-data">
                      ${formatPrice(currentPrice)}
                    </p>
                    {prices[selectedCoin] && (
                      <p className={`text-xs font-mono-data ${prices[selectedCoin].change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {prices[selectedCoin].change24h >= 0 ? '+' : ''}{prices[selectedCoin].change24h.toFixed(2)}%
                      </p>
                    )}
                  </div>

                  {/* Long Liquidation Levels */}
                  <div className="mb-6">
                    <p className="text-xs text-[#ef4444] font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                      롱 청산 레벨 (가격 하락시)
                    </p>
                    <div className="space-y-2">
                      {LEVERAGE_LEVELS.map(lev => {
                        const liqPrice = calcLiquidationPrice(currentPrice, lev, true);
                        const dropPercent = ((currentPrice - liqPrice) / currentPrice) * 100;
                        return (
                          <div key={`long-${lev}`} className="flex items-center justify-between text-sm">
                            <span className="text-[#8B8B90]">{lev}x 롱</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[#ef4444] font-mono-data">${formatPrice(liqPrice)}</span>
                              <span className="text-[10px] text-[#6B6B70] w-16 text-right">-{dropPercent.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Short Liquidation Levels */}
                  <div>
                    <p className="text-xs text-[#22c55e] font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                      숏 청산 레벨 (가격 상승시)
                    </p>
                    <div className="space-y-2">
                      {LEVERAGE_LEVELS.map(lev => {
                        const liqPrice = calcLiquidationPrice(currentPrice, lev, false);
                        const risePercent = ((liqPrice - currentPrice) / currentPrice) * 100;
                        return (
                          <div key={`short-${lev}`} className="flex items-center justify-between text-sm">
                            <span className="text-[#8B8B90]">{lev}x 숏</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[#22c55e] font-mono-data">${formatPrice(liqPrice)}</span>
                              <span className="text-[10px] text-[#6B6B70] w-16 text-right">+{risePercent.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-[#6B6B70]">
                  <div className="w-6 h-6 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  가격 로딩 중...
                </div>
              )}
            </div>

            {/* Real-time Liquidation Feed */}
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">실시간 청산 피드</h2>
                <select
                  value={minValueFilter}
                  onChange={(e) => setMinValueFilter(Number(e.target.value))}
                  className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-3 py-1.5 text-xs text-[#8B8B90] focus:outline-none focus:border-[#FF5C00]"
                >
                  <option value={1000}>$1K+</option>
                  <option value={10000}>$10K+</option>
                  <option value={50000}>$50K+</option>
                  <option value={100000}>$100K+</option>
                  <option value={500000}>$500K+</option>
                </select>
              </div>

              <div className="h-[500px] overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                {liquidations.length === 0 ? (
                  <div className="text-center py-12 text-[#6B6B70]">
                    <p className="text-sm mb-2">청산 대기 중...</p>
                    <p className="text-xs">큰 청산이 발생하면 여기에 표시됩니다</p>
                  </div>
                ) : (
                  liquidations.map((liq) => {
                    const isLong = liq.side === 'SELL';
                    const timeStr = new Date(liq.timestamp).toLocaleTimeString('ko-KR');

                    return (
                      <div
                        key={liq.id}
                        className={`p-3 rounded-lg border ${
                          isLong
                            ? 'bg-[#ef4444]/5 border-[#ef4444]/20'
                            : 'bg-[#22c55e]/5 border-[#22c55e]/20'
                        } ${liq.usdValue >= 100000 ? 'animate-pulse' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold ${isLong ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                              {isLong ? 'LONG' : 'SHORT'}
                            </span>
                            <span className="text-white font-semibold text-sm">{liq.symbol}</span>
                          </div>
                          <span className="text-[10px] text-[#6B6B70] font-mono-data">{timeStr}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#8B8B90]">
                            @ ${formatPrice(liq.price)}
                          </span>
                          <span className={`text-sm font-bold font-mono-data ${isLong ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                            {formatUsd(liq.usdValue)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Largest Liquidation */}
          {stats.largestSingle && (
            <div className="mt-6 bg-gradient-to-r from-[#FF5C00]/10 to-transparent border border-[#FF5C00]/30 rounded-xl p-6">
              <p className="text-[11px] text-[#FF5C00] uppercase tracking-wide mb-2">세션 최대 청산</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${stats.largestSingle.side === 'SELL' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                    {stats.largestSingle.side === 'SELL' ? 'LONG' : 'SHORT'}
                  </span>
                  <span className="text-white font-semibold">{stats.largestSingle.symbol}</span>
                  <span className="text-[#8B8B90] text-sm">@ ${formatPrice(stats.largestSingle.price)}</span>
                </div>
                <span className="text-2xl font-bold text-[#FF5C00] font-mono-data">
                  {formatUsd(stats.largestSingle.usdValue)}
                </span>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 p-4 bg-[#111113] border border-[#1F1F23] rounded-xl">
            <p className="text-xs text-[#6B6B70] leading-relaxed">
              <span className="text-[#FF5C00] font-semibold">참고:</span> 청산 레벨은 단순화된 계산식입니다.
              실제 청산가는 거래소, 유지증거금률, 펀딩비 등에 따라 다를 수 있습니다.
              데이터 출처: Binance Futures WebSocket.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F1F23] bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center gap-2 text-[#6B6B70] text-[11px] font-mono-data tracking-wide">
          <Link href="/" className="hover:text-[#FF5C00] transition-colors">홈</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <Link href="/blog" className="hover:text-[#FF5C00] transition-colors">블로그</Link>
          <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
          <span>Built with Claude Code</span>
        </div>
      </footer>
    </>
  );
}
