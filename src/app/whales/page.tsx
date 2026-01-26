'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase, WhaleWallet } from '@/lib/supabase';

interface WhaleWithBalance extends WhaleWallet {
  balance?: string;
  balanceUSD?: number;
  loading?: boolean;
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
  const [newWhale, setNewWhale] = useState({ name: '', address: '', notes: '' });
  const [filter, setFilter] = useState<'all' | 'korean' | 'global' | 'exchange'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'balance'>('balance');

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

  useEffect(() => {
    fetchWhales();
  }, [fetchWhales]);

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
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white text-sm">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🐋</span> Whale Watch
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              ETH: ${ethPrice.toLocaleString()}
            </span>
            {isAdmin ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#6366f1] rounded-lg text-sm hover:bg-[#818cf8]"
              >
                + 지갑 추가
              </button>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="px-4 py-2 bg-[#2a2a2a] rounded-lg text-sm hover:bg-[#3a3a3a]"
              >
                관리자
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-sm text-gray-400">추적 지갑</p>
            <p className="text-2xl font-bold">{whales.length}개</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-sm text-gray-400">총 ETH 가치</p>
            <p className="text-2xl font-bold text-[#22c55e]">
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-sm text-gray-400">한국 고래</p>
            <p className="text-2xl font-bold text-[#6366f1]">
              {whales.filter(w => w.notes?.includes('한국')).length}명
            </p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-sm text-gray-400">거래소</p>
            <p className="text-2xl font-bold text-[#f59e0b]">
              {whales.filter(w => w.notes?.includes('거래소') || w.notes?.includes('바이낸스')).length}개
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            {(['all', 'korean', 'global', 'exchange'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  filter === f
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'
                }`}
              >
                {f === 'all' ? '전체' : f === 'korean' ? '한국 고래' : f === 'global' ? '글로벌' : '거래소'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setSortBy('balance')}
              className={`px-4 py-2 rounded-lg text-sm ${
                sortBy === 'balance' ? 'bg-[#22c55e] text-white' : 'bg-[#2a2a2a] text-gray-400'
              }`}
            >
              잔액순
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg text-sm ${
                sortBy === 'name' ? 'bg-[#22c55e] text-white' : 'bg-[#2a2a2a] text-gray-400'
              }`}
            >
              이름순
            </button>
            <button
              onClick={fetchWhales}
              disabled={loading}
              className="px-4 py-2 bg-[#2a2a2a] rounded-lg text-sm hover:bg-[#3a3a3a] disabled:opacity-50"
            >
              {loading ? '로딩...' : '새로고침'}
            </button>
          </div>
        </div>

        {/* Whale Table */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f0f0f] text-gray-400 border-b border-[#2a2a2a]">
                  <th className="text-left py-4 px-4">#</th>
                  <th className="text-left py-4 px-4">이름</th>
                  <th className="text-left py-4 px-4">주소</th>
                  <th className="text-right py-4 px-4">잔액 (ETH)</th>
                  <th className="text-right py-4 px-4">가치 (USD)</th>
                  <th className="text-left py-4 px-4">메모</th>
                  <th className="text-center py-4 px-4">링크</th>
                  {isAdmin && <th className="text-center py-4 px-4">삭제</th>}
                </tr>
              </thead>
              <tbody>
                {filteredWhales.map((whale, idx) => (
                  <tr
                    key={whale.id}
                    className="border-b border-[#2a2a2a]/50 hover:bg-[#0f0f0f] transition"
                  >
                    <td className="py-4 px-4 text-gray-500">{idx + 1}</td>
                    <td className="py-4 px-4 font-medium">{whale.name}</td>
                    <td className="py-4 px-4">
                      <code className="text-[#6366f1] text-xs">
                        {whale.address.slice(0, 8)}...{whale.address.slice(-6)}
                      </code>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {whale.loading ? (
                        <span className="text-gray-500 animate-pulse">...</span>
                      ) : (
                        <span className="text-[#22c55e]">{whale.balance}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {whale.loading ? (
                        <span className="text-gray-500 animate-pulse">...</span>
                      ) : whale.balanceUSD ? (
                        <span className="font-medium">
                          ${whale.balanceUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-xs max-w-[150px] truncate">
                      {whale.notes || '-'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <a
                          href={`https://etherscan.io/address/${whale.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#6366f1] hover:text-[#818cf8]"
                        >
                          Etherscan
                        </a>
                        <a
                          href={`https://debank.com/profile/${whale.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#f59e0b] hover:text-[#fbbf24]"
                        >
                          DeBank
                        </a>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => deleteWhale(whale.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
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

        <p className="text-xs text-gray-500 mt-4 text-center">
          Etherscan API 사용 | 잔액은 ETH만 표시 (토큰 제외)
        </p>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">관리자 로그인</h3>
            <input
              type="password"
              placeholder="PIN 입력"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              className={`w-full bg-[#0f0f0f] border ${pinError ? 'border-red-500' : 'border-[#2a2a2a]'} rounded-lg px-4 py-3 mb-4 text-center text-2xl tracking-widest`}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}
                className="flex-1 py-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a]"
              >
                취소
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 py-2 bg-[#6366f1] rounded-lg hover:bg-[#818cf8]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Whale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">🐋 고래 지갑 추가</h3>
            <input
              type="text"
              placeholder="이름 (예: Vitalik)"
              value={newWhale.name}
              onChange={(e) => setNewWhale({ ...newWhale, name: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3"
              autoFocus
            />
            <input
              type="text"
              placeholder="주소 (0x...)"
              value={newWhale.address}
              onChange={(e) => setNewWhale({ ...newWhale, address: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3 font-mono text-sm"
            />
            <input
              type="text"
              placeholder="메모 (예: 한국 고래, DeFi 고래)"
              value={newWhale.notes}
              onChange={(e) => setNewWhale({ ...newWhale, notes: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddModal(false); setNewWhale({ name: '', address: '', notes: '' }); }}
                className="flex-1 py-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a]"
              >
                취소
              </button>
              <button
                onClick={addWhale}
                className="flex-1 py-2 bg-[#6366f1] rounded-lg hover:bg-[#818cf8]"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
