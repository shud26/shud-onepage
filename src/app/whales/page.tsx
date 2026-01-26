'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase, WhaleWallet, WhaleAlert } from '@/lib/supabase';

interface WhaleWithBalance extends WhaleWallet {
  balance?: string;
  balanceUSD?: number;
  loading?: boolean;
  recentActivity?: string;
}

interface ActivityItem {
  timestamp: number;
  type: 'eth_send' | 'eth_receive' | 'token_send' | 'token_receive';
  label: string;
  value: string;
  detail: string;
}

interface ActivitySummary {
  totalTxCount: number;
  lastActive: string;
  ethSent: number;
  ethReceived: number;
  topTokens: { symbol: string; count: number }[];
  timeline: ActivityItem[];
  error?: string;
}

// Admin PIN
const ADMIN_PIN = '1507';

export default function WhalesPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [whales, setWhales] = useState<WhaleWithBalance[]>([]);
  const [ethPrice, setEthPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedWhale, setSelectedWhale] = useState<WhaleWithBalance | null>(null);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [newWhale, setNewWhale] = useState({ name: '', address: '', notes: '' });
  const [searchAddress, setSearchAddress] = useState('');
  const [filter, setFilter] = useState<'all' | 'korean' | 'global' | 'exchange'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'balance'>('balance');
  const [recentAlerts, setRecentAlerts] = useState<WhaleAlert[]>([]);
  const [alertCheckLoading, setAlertCheckLoading] = useState(false);
  const [alertResult, setAlertResult] = useState<string | null>(null);

  // Fetch whale wallets
  const fetchWhales = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('whale_wallets')
      .select('*')
      .order('created_at', { ascending: true });

    if (data) {
      setWhales(data.map(w => ({ ...w, loading: true })));
      fetchBalances(data);
    }
  }, []);

  // Fetch ETH balances
  const fetchBalances = async (walletList: WhaleWallet[]) => {
    try {
      // Get ETH price
      const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const priceData = await priceRes.json();
      const ethPriceUSD = priceData.ethereum?.usd || 0;
      setEthPrice(ethPriceUSD);

      // Fetch balances (with rate limiting)
      const updatedWhales: WhaleWithBalance[] = [];

      for (const wallet of walletList) {
        try {
          const balanceRes = await fetch(
            `https://api.etherscan.io/api?module=account&action=balance&address=${wallet.address}&tag=latest`
          );
          const balanceData = await balanceRes.json();

          if (balanceData.status === '1') {
            const balanceWei = BigInt(balanceData.result);
            const balanceEth = Number(balanceWei) / 1e18;
            const balanceUSD = balanceEth * ethPriceUSD;

            updatedWhales.push({
              ...wallet,
              balance: balanceEth.toFixed(4),
              balanceUSD: balanceUSD,
              loading: false
            });
          } else {
            updatedWhales.push({ ...wallet, balance: '0', balanceUSD: 0, loading: false });
          }

          // Rate limit
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch {
          updatedWhales.push({ ...wallet, balance: 'Error', loading: false });
        }

        // Update state progressively
        setWhales([...updatedWhales, ...walletList.slice(updatedWhales.length).map(w => ({ ...w, loading: true }))]);
      }

      setWhales(updatedWhales);
    } catch (error) {
      console.error('Balance fetch error:', error);
    }
    setLoading(false);
  };

  // Fetch recent alerts
  const fetchAlerts = useCallback(async () => {
    const { data } = await supabase
      .from('whale_alerts')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(20);

    if (data) setRecentAlerts(data);
  }, []);

  // Manual alert check
  const triggerAlertCheck = async () => {
    setAlertCheckLoading(true);
    setAlertResult(null);
    try {
      const res = await fetch('/api/whale-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: ADMIN_PIN }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlertResult(`${data.walletsChecked}개 지갑 체크, ${data.alertsSent}개 알림 전송`);
        fetchAlerts();
      } else {
        setAlertResult(`에러: ${data.error}`);
      }
    } catch (error) {
      setAlertResult(`에러: ${String(error)}`);
    }
    setAlertCheckLoading(false);
  };

  useEffect(() => {
    fetchWhales();
    fetchAlerts();
  }, [fetchWhales, fetchAlerts]);

  // PIN verification
  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Add whale
  const addWhale = async () => {
    if (!newWhale.name.trim() || !newWhale.address.trim()) return;

    if (!/^0x[a-fA-F0-9]{40}$/.test(newWhale.address)) {
      alert('올바른 이더리움 주소를 입력하세요');
      return;
    }

    await supabase.from('whale_wallets').insert({
      name: newWhale.name,
      address: newWhale.address,
      chain: 'ethereum',
      notes: newWhale.notes
    });

    setNewWhale({ name: '', address: '', notes: '' });
    setShowAddModal(false);
    fetchWhales();
  };

  // Delete whale
  const deleteWhale = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await supabase.from('whale_wallets').delete().eq('id', id);
    fetchWhales();
  };

  // Format date
  const fmtDate = (ts: number) => {
    const d = new Date(ts * 1000);
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Lookup any address
  const lookupAddress = () => {
    const addr = searchAddress.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      alert('올바른 이더리움 주소를 입력하세요 (0x...)');
      return;
    }
    // Check if it's a known whale
    const known = whales.find(w => w.address.toLowerCase() === addr.toLowerCase());
    if (known) {
      fetchActivity(known);
    } else {
      fetchActivity({
        id: 'lookup',
        name: '조회 주소',
        address: addr,
        chain: 'ethereum',
        notes: '직접 조회',
        created_at: '',
        loading: false,
      });
    }
  };

  // Fetch recent activity using Ethplorer API (free, no key needed)
  const fetchActivity = async (whale: WhaleWithBalance) => {
    setSelectedWhale(whale);
    setShowActivityModal(true);
    setActivityLoading(true);
    setActivitySummary(null);

    const addr = whale.address.toLowerCase();

    try {
      // 1) ETH transactions from Ethplorer
      const ethRes = await fetch(
        `https://api.ethplorer.io/getAddressTransactions/${whale.address}?apiKey=freekey&limit=25`
      );
      const ethTxs = await ethRes.json();

      // Small delay to respect rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2) Token transfer history from Ethplorer
      const histRes = await fetch(
        `https://api.ethplorer.io/getAddressHistory/${whale.address}?apiKey=freekey&limit=25&type=transfer`
      );
      const histData = await histRes.json();

      const timeline: ActivityItem[] = [];
      let ethSent = 0;
      let ethReceived = 0;
      const tokenCounts: Record<string, number> = {};

      // Process ETH transactions
      // Ethplorer format: [{timestamp, from, to, hash, value (in ETH), success}]
      if (Array.isArray(ethTxs)) {
        for (const tx of ethTxs) {
          if (tx.success === false) continue;
          const value = typeof tx.value === 'number' ? tx.value : parseFloat(tx.value || '0');
          const isOut = (tx.from || '').toLowerCase() === addr;

          if (isOut) {
            ethSent += value;
            timeline.push({
              timestamp: tx.timestamp,
              type: 'eth_send',
              label: 'ETH 전송',
              value: `${value.toFixed(4)} ETH`,
              detail: `→ ${(tx.to || '').slice(0, 10)}...`,
            });
          } else {
            ethReceived += value;
            timeline.push({
              timestamp: tx.timestamp,
              type: 'eth_receive',
              label: 'ETH 수신',
              value: `${value.toFixed(4)} ETH`,
              detail: `← ${(tx.from || '').slice(0, 10)}...`,
            });
          }
        }
      }

      // Process token transfers
      // Ethplorer format: {operations: [{timestamp, tokenInfo:{symbol,decimals}, type, value, from, to}]}
      const ops = histData?.operations;
      if (Array.isArray(ops)) {
        for (const op of ops) {
          const symbol = op.tokenInfo?.symbol || '???';
          const decimals = parseInt(op.tokenInfo?.decimals || '18');
          const rawValue = parseFloat(op.value || '0') / Math.pow(10, decimals);
          const isOut = (op.from || '').toLowerCase() === addr;
          tokenCounts[symbol] = (tokenCounts[symbol] || 0) + 1;

          const fmtVal = rawValue > 1000000
            ? `${(rawValue / 1000000).toFixed(2)}M`
            : rawValue > 1000
            ? `${(rawValue / 1000).toFixed(1)}K`
            : rawValue.toFixed(2);

          timeline.push({
            timestamp: op.timestamp,
            type: isOut ? 'token_send' : 'token_receive',
            label: `${symbol} ${isOut ? '전송' : '수신'}`,
            value: `${fmtVal} ${symbol}`,
            detail: isOut ? `→ ${(op.to || '').slice(0, 10)}...` : `← ${(op.from || '').slice(0, 10)}...`,
          });
        }
      }

      // Sort by timestamp desc
      timeline.sort((a, b) => b.timestamp - a.timestamp);

      // Token summary
      const topTokens = Object.entries(tokenCounts)
        .map(([symbol, count]) => ({ symbol, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Last active
      const latestTs = timeline[0]?.timestamp;
      const lastActive = latestTs
        ? new Date(latestTs * 1000).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        : '알 수 없음';

      const ethTxCount = Array.isArray(ethTxs) ? ethTxs.length : 0;
      const tokenOpCount = Array.isArray(ops) ? ops.length : 0;

      setActivitySummary({
        totalTxCount: ethTxCount + tokenOpCount,
        lastActive,
        ethSent,
        ethReceived,
        topTokens,
        timeline: timeline.slice(0, 20),
        error: timeline.length === 0 ? `ETH 응답: ${JSON.stringify(ethTxs).slice(0, 100)} | 토큰 응답: ${JSON.stringify(histData).slice(0, 100)}` : undefined,
      });
    } catch (error) {
      console.error('Activity fetch error:', error);
      setActivitySummary({
        totalTxCount: 0,
        lastActive: '에러 발생',
        ethSent: 0,
        ethReceived: 0,
        topTokens: [],
        timeline: [],
        error: String(error),
      });
    }

    setActivityLoading(false);
  };

  // Filter whales
  const getFilteredWhales = () => {
    let filtered = whales;

    if (filter === 'korean') {
      filtered = whales.filter(w => w.notes?.includes('한국'));
    } else if (filter === 'global') {
      filtered = whales.filter(w => !w.notes?.includes('한국') && !w.notes?.includes('거래소') && !w.notes?.includes('바이낸스') && !w.notes?.includes('업비트'));
    } else if (filter === 'exchange') {
      filtered = whales.filter(w =>
        w.notes?.includes('거래소') || w.notes?.includes('바이낸스') ||
        w.notes?.includes('업비트') || w.notes?.includes('핫월렛') ||
        w.notes?.includes('콜드월렛') || w.name.includes('Binance') ||
        w.name.includes('Upbit') || w.name.includes('Coinbase')
      );
    }

    // Sort
    if (sortBy === 'balance') {
      filtered = [...filtered].sort((a, b) => (b.balanceUSD || 0) - (a.balanceUSD || 0));
    } else {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  };

  const filteredWhales = getFilteredWhales();
  const totalValue = whales.reduce((sum, w) => sum + (w.balanceUSD || 0), 0);

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#6B6B70] hover:text-white text-sm transition-colors">
              &#8592;
            </Link>
            <h1 className="text-lg font-semibold tracking-[4px] font-mono-data">
              SHUD
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
            <span className="text-sm text-[#6B6B70]">Whale Watch</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#6B6B70] font-mono-data">
              ETH ${ethPrice.toLocaleString()}
            </span>
            {isAdmin ? (
              <div className="flex gap-2">
                <button
                  onClick={triggerAlertCheck}
                  disabled={alertCheckLoading}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20 disabled:opacity-50 transition-colors"
                >
                  {alertCheckLoading ? '체크 중...' : 'Alert Check'}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 bg-[#FF5C00] rounded-lg text-sm font-medium hover:bg-[#FF8A4C] transition-colors"
                >
                  + 지갑 추가
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium border border-[#1F1F23] hover:bg-[#1A1A1D] text-[#8B8B90] transition-colors"
              >
                관리자
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-7">
        {/* Page Title */}
        <div>
          <h2 className="font-display text-4xl text-white tracking-tight">Whale Watch</h2>
          <p className="text-sm text-[#6B6B70] mt-2">고래 지갑 추적 & 활동 분석</p>
        </div>

        {/* Address Lookup */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
          <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase mb-3">지갑 주소 조회</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="0x... 이더리움 주소 입력"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookupAddress()}
              className="flex-1 bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 font-mono-data text-[13px] placeholder:text-[#4A4A4E] focus:border-[#FF5C00] focus:outline-none transition-colors"
            />
            <button
              onClick={lookupAddress}
              className="px-6 py-2.5 bg-[#FF5C00] rounded-lg text-[13px] font-medium hover:bg-[#FF8A4C] whitespace-nowrap transition-colors"
            >
              분석
            </button>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
            <p className="text-xs font-semibold text-[#6B6B70] tracking-wider uppercase">추적 지갑</p>
            <p className="text-3xl font-medium text-white mt-3 font-mono-data tracking-tight">{whales.length}</p>
          </div>
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
            <p className="text-xs font-semibold text-[#6B6B70] tracking-wider uppercase">총 ETH 가치</p>
            <p className="text-3xl font-medium text-[#22c55e] mt-3 font-mono-data tracking-tight">
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
            <p className="text-xs font-semibold text-[#6B6B70] tracking-wider uppercase">한국 고래</p>
            <p className="text-3xl font-medium text-[#FF5C00] mt-3 font-mono-data tracking-tight">
              {whales.filter(w => w.notes?.includes('한국')).length}
            </p>
          </div>
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
            <p className="text-xs font-semibold text-[#6B6B70] tracking-wider uppercase">거래소</p>
            <p className="text-3xl font-medium text-[#f59e0b] mt-3 font-mono-data tracking-tight">
              {whales.filter(w => w.notes?.includes('거래소') || w.notes?.includes('바이낸스')).length}
            </p>
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-1.5">
            {(['all', 'korean', 'global', 'exchange'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  filter === f
                    ? 'bg-[#FF5C00] text-white'
                    : 'bg-[#111113] border border-[#1F1F23] text-[#8B8B90] hover:text-white'
                }`}
              >
                {f === 'all' ? '전체' : f === 'korean' ? '한국 고래' : f === 'global' ? '글로벌' : '거래소'}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 ml-auto">
            <button
              onClick={() => setSortBy('balance')}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                sortBy === 'balance' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#111113] border border-[#1F1F23] text-[#8B8B90]'
              }`}
            >
              잔액순
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                sortBy === 'name' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#111113] border border-[#1F1F23] text-[#8B8B90]'
              }`}
            >
              이름순
            </button>
            <button
              onClick={fetchWhales}
              disabled={loading}
              className="px-4 py-2 bg-[#111113] border border-[#1F1F23] rounded-lg text-[13px] font-medium text-[#8B8B90] hover:text-white transition-colors disabled:opacity-50"
            >
              {loading ? '로딩...' : '새로고침'}
            </button>
          </div>
        </div>

        {/* Whale Table */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D0D0E] text-[#6B6B70] border-b border-[#1F1F23] text-[11px] font-semibold tracking-wider uppercase">
                  <th className="text-left py-3.5 px-5">#</th>
                  <th className="text-left py-3.5 px-5">이름</th>
                  <th className="text-left py-3.5 px-5">주소</th>
                  <th className="text-right py-3.5 px-5">잔액 (ETH)</th>
                  <th className="text-right py-3.5 px-5">가치 (USD)</th>
                  <th className="text-left py-3.5 px-5">메모</th>
                  <th className="text-center py-3.5 px-5">활동</th>
                  <th className="text-center py-3.5 px-5">링크</th>
                  {isAdmin && <th className="text-center py-3.5 px-5">삭제</th>}
                </tr>
              </thead>
              <tbody>
                {filteredWhales.map((whale, idx) => (
                  <tr
                    key={whale.id}
                    className="border-b border-[#1F1F23]/50 hover:bg-[#0A0A0B] text-[13px] transition-colors"
                  >
                    <td className="py-3.5 px-5 text-[#6B6B70] font-mono-data">{idx + 1}</td>
                    <td className="py-3.5 px-5 font-medium text-white">{whale.name}</td>
                    <td className="py-3.5 px-5">
                      <code className="text-[#FF5C00] text-xs font-mono-data">
                        {whale.address.slice(0, 8)}...{whale.address.slice(-6)}
                      </code>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {whale.loading ? (
                        <span className="text-[#6B6B70] animate-pulse">...</span>
                      ) : (
                        <span className="text-[#22c55e] font-mono-data">{whale.balance}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {whale.loading ? (
                        <span className="text-[#6B6B70] animate-pulse">...</span>
                      ) : whale.balanceUSD ? (
                        <span className="font-medium font-mono-data">
                          ${whale.balanceUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      ) : (
                        <span className="text-[#6B6B70]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-[#ADADB0] text-xs max-w-[150px] truncate">
                      {whale.notes || '-'}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => fetchActivity(whale)}
                        className="text-[10px] font-medium bg-[#FF5C00]/10 text-[#FF5C00] px-2.5 py-1 rounded-full hover:bg-[#FF5C00]/20 transition-colors"
                      >
                        활동 분석
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex gap-2 justify-center">
                        <a
                          href={`https://etherscan.io/address/${whale.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-medium text-[#ADADB0] hover:text-[#FF5C00] transition-colors"
                        >
                          Etherscan
                        </a>
                        <a
                          href={`https://debank.com/profile/${whale.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-medium text-[#ADADB0] hover:text-[#f59e0b] transition-colors"
                        >
                          DeBank
                        </a>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => deleteWhale(whale.id)}
                          className="text-[#ef4444] hover:text-red-300 text-xs transition-colors"
                        >
                          삭제
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Result */}
        {alertResult && (
          <div className="bg-[#111113] border border-[#f59e0b]/20 rounded-xl p-4">
            <p className="text-[13px] text-[#f59e0b]">{alertResult}</p>
          </div>
        )}

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <section className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
            <div className="px-6 py-5">
              <h2 className="text-sm font-semibold tracking-wide">최근 알림 히스토리</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0D0D0E] text-[#6B6B70] border-b border-[#1F1F23] text-[11px] font-semibold tracking-wider uppercase">
                    <th className="text-left py-3.5 px-5">시간</th>
                    <th className="text-left py-3.5 px-5">방향</th>
                    <th className="text-left py-3.5 px-5">지갑</th>
                    <th className="text-right py-3.5 px-5">수량</th>
                    <th className="text-right py-3.5 px-5">USD</th>
                    <th className="text-center py-3.5 px-5">Tx</th>
                  </tr>
                </thead>
                  <tbody>
                    {recentAlerts.map((alert) => {
                      const knownWallet = whales.find(
                        w => w.address.toLowerCase() === alert.wallet_address.toLowerCase()
                      );
                      return (
                        <tr key={alert.id} className="border-b border-[#1F1F23]/50 hover:bg-[#0A0A0B] text-[13px] transition-colors">
                          <td className="py-3.5 px-5 text-[11px] text-[#6B6B70] font-mono-data">
                            {new Date(alert.sent_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                              alert.direction === 'out'
                                ? 'bg-[#ef4444]/10 text-[#ef4444]'
                                : 'bg-[#22c55e]/10 text-[#22c55e]'
                            }`}>
                              {alert.direction === 'out' ? '전송' : '수신'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-[13px]">
                            {knownWallet ? (
                              <span className="text-white font-medium">{knownWallet.name}</span>
                            ) : (
                              <code className="text-[#FF5C00] font-mono-data text-xs">
                                {alert.wallet_address.slice(0, 8)}...
                              </code>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right text-xs font-mono-data text-[#ADADB0]">
                            {typeof alert.value === 'number' && alert.value > 1_000_000
                              ? `${(alert.value / 1_000_000).toFixed(2)}M`
                              : typeof alert.value === 'number' && alert.value > 1_000
                              ? `${(alert.value / 1_000).toFixed(1)}K`
                              : Number(alert.value).toFixed(2)
                            } {alert.token_symbol}
                          </td>
                          <td className="py-3.5 px-5 text-right text-xs font-mono-data">
                            {alert.usd_value
                              ? `$${Number(alert.usd_value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                              : '-'
                            }
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <a
                              href={`https://etherscan.io/tx/${alert.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-medium text-[#FF5C00] hover:text-[#FF8A4C] transition-colors"
                            >
                              보기
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          </section>
        )}

        <p className="text-[11px] text-[#4A4A4E] text-center font-mono-data">
          Etherscan API 사용 &middot; 잔액은 ETH만 표시 (토큰 제외)
        </p>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-80">
            <h3 className="text-sm font-semibold mb-4 tracking-wide">관리자 로그인</h3>
            <input
              type="password"
              placeholder="PIN 입력"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              className={`w-full bg-[#0A0A0B] border ${pinError ? 'border-[#ef4444]' : 'border-[#1F1F23]'} rounded-lg px-4 py-2.5 mb-4 text-center text-2xl tracking-widest font-mono-data placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors`}
              autoFocus
            />
            {pinError && <p className="text-[#ef4444] text-[13px] mb-4 text-center">잘못된 PIN</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}
                className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Whale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-96">
            <h3 className="text-sm font-semibold mb-4 tracking-wide">고래 지갑 추가</h3>
            <input
              type="text"
              placeholder="이름 (예: Vitalik)"
              value={newWhale.name}
              onChange={(e) => setNewWhale({ ...newWhale, name: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              autoFocus
            />
            <input
              type="text"
              placeholder="주소 (0x...)"
              value={newWhale.address}
              onChange={(e) => setNewWhale({ ...newWhale, address: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 font-mono-data text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
            <input
              type="text"
              placeholder="메모 (예: 한국 고래, DeFi 고래)"
              value={newWhale.notes}
              onChange={(e) => setNewWhale({ ...newWhale, notes: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-4 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddModal(false); setNewWhale({ name: '', address: '', notes: '' }); }}
                className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors"
              >
                취소
              </button>
              <button
                onClick={addWhale}
                className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && selectedWhale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-sm font-semibold tracking-wide">{selectedWhale.name}</h3>
                <code className="text-xs text-[#FF5C00] font-mono-data mt-1 block">
                  {selectedWhale.address.slice(0, 12)}...{selectedWhale.address.slice(-8)}
                </code>
              </div>
              <button
                onClick={() => { setShowActivityModal(false); setSelectedWhale(null); setActivitySummary(null); }}
                className="text-[#6B6B70] hover:text-white text-lg transition-colors"
              >
                &#10005;
              </button>
            </div>

            {activityLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#FF5C00] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[#ADADB0] text-[13px]">트랜잭션 분석 중...</p>
                <p className="text-[#6B6B70] text-[11px] mt-2">Etherscan API 호출 중</p>
              </div>
            ) : activitySummary ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-3 text-center">
                    <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">마지막 활동</p>
                    <p className="text-[#22c55e] text-[11px] font-medium mt-1.5 font-mono-data">{activitySummary.lastActive}</p>
                  </div>
                  <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-3 text-center">
                    <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">트랜잭션</p>
                    <p className="text-white font-bold text-lg mt-1.5 font-mono-data">{activitySummary.totalTxCount}</p>
                  </div>
                  <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-3 text-center">
                    <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">관련 토큰</p>
                    <p className="text-[#FF5C00] font-bold text-lg mt-1.5 font-mono-data">{activitySummary.topTokens.length}</p>
                  </div>
                </div>

                {/* ETH Flow */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-4">
                    <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase mb-2">ETH 전송</p>
                    <p className="text-[#ef4444] font-bold font-mono-data">
                      -{activitySummary.ethSent.toFixed(4)} ETH
                    </p>
                    <p className="text-[11px] text-[#6B6B70] font-mono-data mt-1">
                      &#8776; ${(activitySummary.ethSent * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-4">
                    <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase mb-2">ETH 수신</p>
                    <p className="text-[#22c55e] font-bold font-mono-data">
                      +{activitySummary.ethReceived.toFixed(4)} ETH
                    </p>
                    <p className="text-[11px] text-[#6B6B70] font-mono-data mt-1">
                      &#8776; ${(activitySummary.ethReceived * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                {/* Token Summary */}
                {activitySummary.topTokens.length > 0 && (
                  <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-4">
                    <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase mb-2">관련 토큰</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activitySummary.topTokens.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#1A1A1D] border border-[#1F1F23] rounded-full text-[11px] font-medium text-[#ADADB0]">
                          {t.symbol} <span className="text-[#FF5C00]">x{t.count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-4">
                  <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase mb-3">최근 활동</p>
                  <div className="space-y-0 max-h-64 overflow-y-auto">
                    {activitySummary.timeline.length > 0 ? (
                      activitySummary.timeline.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[#1F1F23]/30 last:border-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                            item.type === 'eth_send' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                            item.type === 'eth_receive' ? 'bg-[#22c55e]/10 text-[#22c55e]' :
                            item.type === 'token_send' ? 'bg-[#FF5C00]/10 text-[#FF5C00]' :
                            'bg-[#FF5C00]/10 text-[#FF8A4C]'
                          }`}>
                            {item.type.includes('send') ? '&#8593;' : '&#8595;'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="text-[13px] font-medium text-white">{item.label}</span>
                              {item.value && (
                                <span className={`text-xs font-mono-data ${
                                  item.type.includes('send') ? 'text-[#ef4444]' : 'text-[#22c55e]'
                                }`}>
                                  {item.type.includes('send') ? '-' : '+'}{item.value}
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-0.5">
                              <span className="text-[10px] text-[#6B6B70] font-mono-data">{item.detail}</span>
                              <span className="text-[10px] text-[#6B6B70]">{fmtDate(item.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-[13px] text-[#6B6B70]">최근 활동을 찾지 못했습니다</p>
                        {activitySummary.error && (
                          <p className="text-[10px] text-[#4A4A4E] mt-2 break-all">{activitySummary.error}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Links */}
                <div className="flex gap-2 pt-2">
                  <a
                    href={`https://etherscan.io/address/${selectedWhale.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg text-center text-[13px] font-medium hover:bg-[#FF8A4C] transition-colors"
                  >
                    Etherscan
                  </a>
                  <a
                    href={`https://debank.com/profile/${selectedWhale.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-[#f59e0b]/10 text-[#f59e0b] rounded-lg text-center text-[13px] font-medium hover:bg-[#f59e0b]/20 transition-colors"
                  >
                    DeBank
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </main>
  );
}
