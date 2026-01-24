'use client';

import { useState, useEffect, useCallback } from 'react';

// Types
interface Airdrop {
  id: string;
  name: string;
  chain: string;
  tasks: { id: string; name: string; done: boolean; cost: number }[];
  deadline: string;
  expectedValue: string;
  status: 'active' | 'completed' | 'missed';
  totalCost: number;
}

interface Todo {
  id: string;
  text: string;
  done: boolean;
  date: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'airdrop' | 'snapshot' | 'tge' | 'other';
  memo: string;
}

interface Research {
  id: string;
  coin: string;
  notes: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  date: string;
}

interface PriceData {
  coin: string;
  binance: number;
  upbit: number;
  hyperliquid: number;
  kimchiPremium: number;
  gap: number;
}

// Admin PIN
const ADMIN_PIN = '1507';

// Demo data
const initialAirdrops: Airdrop[] = [
  {
    id: '1',
    name: 'LayerZero',
    chain: 'Multi-chain',
    tasks: [
      { id: '1-1', name: 'Bridge ETH to Arbitrum', done: true, cost: 5 },
      { id: '1-2', name: 'Bridge to Optimism', done: true, cost: 3 },
      { id: '1-3', name: 'Use Stargate', done: false, cost: 2 },
    ],
    deadline: '2026-03-01',
    expectedValue: '$500~2000',
    status: 'active',
    totalCost: 10,
  },
  {
    id: '2',
    name: 'zkSync',
    chain: 'zkSync Era',
    tasks: [
      { id: '2-1', name: 'Bridge to zkSync Era', done: true, cost: 10 },
      { id: '2-2', name: 'Swap on SyncSwap', done: true, cost: 2 },
      { id: '2-3', name: 'Mint NFT', done: true, cost: 5 },
      { id: '2-4', name: 'Add liquidity', done: false, cost: 20 },
    ],
    deadline: '2026-02-15',
    expectedValue: '$300~1500',
    status: 'active',
    totalCost: 37,
  },
];

const initialTodos: Todo[] = [
  { id: '1', text: 'zkSync 일일 트랜잭션', done: false, date: '2026-01-24' },
  { id: '2', text: 'Hyperliquid 펀딩비 체크', done: true, date: '2026-01-24' },
];

const initialEvents: CalendarEvent[] = [
  { id: '1', title: 'LayerZero Snapshot', date: '2026-02-01', type: 'snapshot', memo: '스냅샷 전 브릿지 완료하기' },
  { id: '2', title: 'zkSync TGE', date: '2026-02-15', type: 'tge', memo: '토큰 상장 예정, 클레임 준비' },
];

const initialResearch: Research[] = [
  { id: '1', coin: 'ETH', notes: '2.0 업그레이드 후 디플레이션, 장기 홀딩', sentiment: 'bullish', date: '2026-01-23' },
  { id: '2', coin: 'SOL', notes: '속도 빠름, 에어드랍 많음', sentiment: 'bullish', date: '2026-01-22' },
];

export default function Home() {
  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Data states
  const [airdrops, setAirdrops] = useState<Airdrop[]>(initialAirdrops);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [research, setResearch] = useState<Research[]>(initialResearch);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [krwRate, setKrwRate] = useState(1350);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedAirdropId, setSelectedAirdropId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form states
  const [newAirdrop, setNewAirdrop] = useState({ name: '', chain: '', deadline: '', expectedValue: '' });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'other' as CalendarEvent['type'], memo: '' });
  const [newResearch, setNewResearch] = useState({ coin: '', notes: '', sentiment: 'neutral' as Research['sentiment'] });
  const [newTodo, setNewTodo] = useState({ text: '', date: new Date().toISOString().split('T')[0] });
  const [newTask, setNewTask] = useState({ name: '', cost: 0 });

  const [currentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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

  // Fetch prices
  const fetchPrices = useCallback(async () => {
    try {
      // Binance prices
      const binanceRes = await fetch('https://fapi.binance.com/fapi/v1/ticker/price');
      const binanceData = await binanceRes.json();
      const binancePrices: Record<string, number> = {};
      binanceData.forEach((item: { symbol: string; price: string }) => {
        binancePrices[item.symbol.replace('USDT', '')] = parseFloat(item.price);
      });

      // Upbit prices (via CoinGecko for KRW)
      const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,dogecoin&vs_currencies=krw,usd');
      const cgData = await cgRes.json();

      // Calculate kimchi premium
      const coins = [
        { id: 'bitcoin', symbol: 'BTC', cg: cgData.bitcoin },
        { id: 'ethereum', symbol: 'ETH', cg: cgData.ethereum },
        { id: 'solana', symbol: 'SOL', cg: cgData.solana },
        { id: 'ripple', symbol: 'XRP', cg: cgData.ripple },
        { id: 'dogecoin', symbol: 'DOGE', cg: cgData.dogecoin },
      ];

      const newPrices: PriceData[] = coins.map(coin => {
        const binancePrice = binancePrices[coin.symbol] || coin.cg?.usd || 0;
        const upbitKrw = coin.cg?.krw || 0;
        const upbitUsd = upbitKrw / krwRate;
        const kimchiPremium = binancePrice > 0 ? ((upbitUsd - binancePrice) / binancePrice) * 100 : 0;
        const hyperliquidPrice = binancePrice * (1 + (Math.random() - 0.5) * 0.02); // Simulated

        return {
          coin: coin.symbol,
          binance: binancePrice,
          upbit: upbitUsd,
          hyperliquid: hyperliquidPrice,
          kimchiPremium: kimchiPremium,
          gap: ((hyperliquidPrice - binancePrice) / binancePrice) * 100,
        };
      });

      setPrices(newPrices);
      setLoading(false);
    } catch (error) {
      console.error('Price fetch error:', error);
      setLoading(false);
    }
  }, [krwRate]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Fetch exchange rate
  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => setKrwRate(data.rates.KRW))
      .catch(() => setKrwRate(1350));
  }, []);

  // CRUD functions
  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const addTodo = () => {
    if (!newTodo.text.trim()) return;
    setTodos([...todos, { id: Date.now().toString(), ...newTodo, done: false }]);
    setNewTodo({ text: '', date: new Date().toISOString().split('T')[0] });
    setShowTodoModal(false);
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const addAirdrop = () => {
    if (!newAirdrop.name.trim()) return;
    setAirdrops([...airdrops, {
      id: Date.now().toString(),
      ...newAirdrop,
      tasks: [],
      status: 'active',
      totalCost: 0,
    }]);
    setNewAirdrop({ name: '', chain: '', deadline: '', expectedValue: '' });
    setShowAirdropModal(false);
  };

  const deleteAirdrop = (id: string) => {
    setAirdrops(airdrops.filter(a => a.id !== id));
  };

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    setEvents([...events, { id: Date.now().toString(), ...newEvent }]);
    setNewEvent({ title: '', date: '', type: 'other', memo: '' });
    setShowEventModal(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const addResearch = () => {
    if (!newResearch.coin.trim()) return;
    setResearch([...research, {
      id: Date.now().toString(),
      ...newResearch,
      date: new Date().toISOString().split('T')[0],
    }]);
    setNewResearch({ coin: '', notes: '', sentiment: 'neutral' });
    setShowResearchModal(false);
  };

  const deleteResearch = (id: string) => {
    setResearch(research.filter(r => r.id !== id));
  };

  const toggleAirdropTask = (airdropId: string, taskId: string) => {
    setAirdrops(airdrops.map(a => {
      if (a.id === airdropId) {
        return {
          ...a,
          tasks: a.tasks.map(t =>
            t.id === taskId ? { ...t, done: !t.done } : t
          ),
        };
      }
      return a;
    }));
  };

  const addTask = () => {
    if (!newTask.name.trim() || !selectedAirdropId) return;
    setAirdrops(airdrops.map(a => {
      if (a.id === selectedAirdropId) {
        const newTaskObj = {
          id: `${a.id}-${Date.now()}`,
          name: newTask.name,
          done: false,
          cost: newTask.cost,
        };
        return {
          ...a,
          tasks: [...a.tasks, newTaskObj],
          totalCost: a.totalCost + newTask.cost,
        };
      }
      return a;
    }));
    setNewTask({ name: '', cost: 0 });
    setShowTaskModal(false);
    setSelectedAirdropId(null);
  };

  const deleteTask = (airdropId: string, taskId: string) => {
    setAirdrops(airdrops.map(a => {
      if (a.id === airdropId) {
        const task = a.tasks.find(t => t.id === taskId);
        return {
          ...a,
          tasks: a.tasks.filter(t => t.id !== taskId),
          totalCost: a.totalCost - (task?.cost || 0),
        };
      }
      return a;
    }));
  };

  const openTaskModal = (airdropId: string) => {
    setSelectedAirdropId(airdropId);
    setShowTaskModal(true);
  };

  const openEventDetail = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  // Helpers
  const getProgressPercent = (tasks: Airdrop['tasks']) => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.done).length;
    return Math.round((done / tasks.length) * 100);
  };

  const getDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - currentDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(selectedMonth);

  const getEventsForDay = (day: number) => {
    const dateStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const totalSpent = airdrops.reduce((sum, a) => sum + a.totalCost, 0);
  const totalTasks = airdrops.reduce((sum, a) => sum + a.tasks.length, 0);
  const completedTasks = airdrops.reduce((sum, a) => sum + a.tasks.filter(t => t.done).length, 0);

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-[#0f0f0f]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-[#6366f1]">shud</span> onepage
          </h1>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Admin</span>
            )}
            <button
              onClick={() => isAdmin ? setIsAdmin(false) : setShowPinModal(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAdmin
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-[#6366f1] hover:bg-[#818cf8]'
              }`}
            >
              {isAdmin ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-sm text-gray-400">Active Airdrops</p>
            <p className="text-2xl font-bold text-[#6366f1]">{airdrops.filter(a => a.status === 'active').length}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-sm text-gray-400">Tasks Progress</p>
            <p className="text-2xl font-bold text-[#22c55e]">{completedTasks}/{totalTasks}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-sm text-gray-400">Total Spent</p>
            <p className="text-2xl font-bold text-[#f59e0b]">${totalSpent}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-sm text-gray-400">김프</p>
            <p className={`text-2xl font-bold ${prices[0]?.kimchiPremium > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {prices[0]?.kimchiPremium?.toFixed(2) || '0.00'}%
            </p>
          </div>
        </section>

        {/* Kimchi Premium & Arbitrage */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">💹</span> 김프 & 차익거래 기회
            </h2>
            <button onClick={fetchPrices} className="text-xs text-gray-400 hover:text-white">
              {loading ? 'Loading...' : '새로고침'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-[#2a2a2a]">
                  <th className="text-left py-2">Coin</th>
                  <th className="text-right py-2">Binance</th>
                  <th className="text-right py-2">Upbit (KRW)</th>
                  <th className="text-right py-2">김프</th>
                  <th className="text-right py-2">HL Gap</th>
                  <th className="text-right py-2">기회</th>
                </tr>
              </thead>
              <tbody>
                {prices.map(p => (
                  <tr key={p.coin} className="border-b border-[#2a2a2a]/50 hover:bg-[#0f0f0f]">
                    <td className="py-3 font-medium">{p.coin}</td>
                    <td className="text-right text-gray-300">${p.binance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="text-right text-gray-300">${p.upbit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className={`text-right font-medium ${p.kimchiPremium > 2 ? 'text-red-400' : p.kimchiPremium > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {p.kimchiPremium > 0 ? '+' : ''}{p.kimchiPremium.toFixed(2)}%
                    </td>
                    <td className={`text-right ${Math.abs(p.gap) > 0.5 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {p.gap > 0 ? '+' : ''}{p.gap.toFixed(2)}%
                    </td>
                    <td className="text-right">
                      {p.kimchiPremium > 3 && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">역프 주의</span>}
                      {p.kimchiPremium < -2 && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">매수 기회</span>}
                      {Math.abs(p.gap) > 1 && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded ml-1">차익거래</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">환율: 1 USD = {krwRate.toLocaleString()} KRW | 60초마다 자동 갱신</p>
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Airdrop Tracker - Excel Style */}
          <section className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">🎯</span> Airdrop Tracker
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setShowAirdropModal(true)}
                  className="text-sm text-[#6366f1] hover:text-[#818cf8]"
                >+ Add</button>
              )}
            </div>

            {/* Excel-style table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-[#2a2a2a]">
                    <th className="text-left py-2">프로젝트</th>
                    <th className="text-left py-2">체인</th>
                    <th className="text-right py-2">비용</th>
                    <th className="text-right py-2">예상 수익</th>
                    <th className="text-center py-2">진행률</th>
                    <th className="text-center py-2">D-Day</th>
                    {isAdmin && <th className="text-center py-2">삭제</th>}
                  </tr>
                </thead>
                <tbody>
                  {airdrops.map(airdrop => {
                    const progress = getProgressPercent(airdrop.tasks);
                    const daysLeft = getDaysLeft(airdrop.deadline);
                    return (
                      <tr key={airdrop.id} className="border-b border-[#2a2a2a]/50 hover:bg-[#0f0f0f]">
                        <td className="py-3 font-medium">{airdrop.name}</td>
                        <td className="py-3 text-gray-400">{airdrop.chain}</td>
                        <td className="py-3 text-right text-[#f59e0b]">${airdrop.totalCost}</td>
                        <td className="py-3 text-right text-[#22c55e]">{airdrop.expectedValue}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#6366f1] to-[#818cf8]"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded ${
                            daysLeft <= 7 ? 'bg-red-500/20 text-red-400' :
                            daysLeft <= 30 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            D-{daysLeft}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-3 text-center">
                            <button
                              onClick={() => deleteAirdrop(airdrop.id)}
                              className="text-red-400 hover:text-red-300"
                            >✕</button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#2a2a2a] font-medium">
                    <td className="py-3">Total</td>
                    <td></td>
                    <td className="py-3 text-right text-[#f59e0b]">${totalSpent}</td>
                    <td className="py-3 text-right text-[#22c55e]">-</td>
                    <td></td>
                    <td></td>
                    {isAdmin && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Expanded tasks */}
            <div className="mt-4 space-y-3">
              {airdrops.map(airdrop => (
                <details key={airdrop.id} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg">
                  <summary className="p-3 cursor-pointer hover:bg-[#1a1a1a] flex items-center justify-between">
                    <span>{airdrop.name} Tasks ({airdrop.tasks.filter(t => t.done).length}/{airdrop.tasks.length})</span>
                  </summary>
                  <div className="p-3 pt-0 space-y-2">
                    {airdrop.tasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between text-sm group"
                      >
                        <label
                          className="flex items-center gap-2 cursor-pointer flex-1"
                          onClick={() => isAdmin && toggleAirdropTask(airdrop.id, task.id)}
                        >
                          <input
                            type="checkbox"
                            checked={task.done}
                            readOnly
                            disabled={!isAdmin}
                            className="w-4 h-4 rounded"
                          />
                          <span className={task.done ? 'text-gray-500 line-through' : 'text-gray-300'}>
                            {task.name}
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">${task.cost}</span>
                          {isAdmin && (
                            <button
                              onClick={() => deleteTask(airdrop.id, task.id)}
                              className="text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100"
                            >✕</button>
                          )}
                        </div>
                      </div>
                    ))}
                    {isAdmin && (
                      <button
                        onClick={() => openTaskModal(airdrop.id)}
                        className="w-full mt-2 py-2 text-sm text-[#6366f1] hover:text-[#818cf8] border border-dashed border-[#2a2a2a] rounded-lg hover:border-[#6366f1]"
                      >
                        + Add Task
                      </button>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Calendar */}
            <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <button onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))} className="text-gray-400 hover:text-white">&lt;</button>
                  <span>{selectedMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</span>
                  <button onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))} className="text-gray-400 hover:text-white">&gt;</button>
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="text-sm text-[#6366f1] hover:text-[#818cf8]"
                  >+ Add</button>
                )}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className="text-gray-500 py-1">{day}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === currentDate.getDate() &&
                    selectedMonth.getMonth() === currentDate.getMonth() &&
                    selectedMonth.getFullYear() === currentDate.getFullYear();
                  const dayEvents = getEventsForDay(day);
                  return (
                    <div
                      key={day}
                      className={`py-1 rounded cursor-pointer hover:bg-[#2a2a2a] relative ${
                        isToday ? 'bg-[#6366f1] text-white font-bold' : ''
                      }`}
                    >
                      {day}
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                          {dayEvents.map(e => (
                            <div
                              key={e.id}
                              className={`w-1 h-1 rounded-full ${
                                e.type === 'snapshot' ? 'bg-yellow-400' :
                                e.type === 'tge' ? 'bg-green-400' :
                                e.type === 'airdrop' ? 'bg-purple-400' :
                                'bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Upcoming events */}
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500">Upcoming Events</p>
                {events.slice(0, 5).map(event => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between text-sm bg-[#0f0f0f] p-2 rounded cursor-pointer hover:bg-[#1a1a1a]"
                    onClick={() => openEventDetail(event)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        event.type === 'snapshot' ? 'bg-yellow-400' :
                        event.type === 'tge' ? 'bg-green-400' :
                        event.type === 'airdrop' ? 'bg-purple-400' :
                        'bg-gray-400'
                      }`} />
                      <span>{event.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{event.date}</span>
                      {isAdmin && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Today's Todo */}
            <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">✅</span> Today
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => setShowTodoModal(true)}
                    className="text-sm text-[#6366f1] hover:text-[#818cf8]"
                  >+ Add</button>
                )}
              </div>
              <div className="space-y-2">
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#0f0f0f] group"
                  >
                    <label
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => isAdmin && toggleTodo(todo.id)}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        todo.done ? 'border-[#22c55e] bg-[#22c55e]' : 'border-[#2a2a2a] group-hover:border-[#6366f1]'
                      }`}>
                        {todo.done && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className={todo.done ? 'text-gray-500 line-through' : 'text-gray-300'}>
                        {todo.text}
                      </span>
                    </label>
                    {isAdmin && (
                      <button onClick={() => deleteTodo(todo.id)} className="text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Research Section */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">🔍</span> Coin Research
            </h2>
            {isAdmin && (
              <button
                onClick={() => setShowResearchModal(true)}
                className="text-sm text-[#6366f1] hover:text-[#818cf8]"
              >+ Add</button>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {research.map(item => (
              <div key={item.id} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 relative group">
                {isAdmin && (
                  <button
                    onClick={() => deleteResearch(item.id)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100"
                  >✕</button>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">{item.coin}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
                    item.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.sentiment === 'bullish' ? '🐂 Bullish' :
                     item.sentiment === 'bearish' ? '🐻 Bearish' : '😐 Neutral'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{item.notes}</p>
                <p className="text-xs text-gray-600 mt-2">{item.date}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ad Banner */}
        <section className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#2a2a2a] rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">📢 Ad Space</p>
          <p className="text-xs text-gray-600 mt-1">Google AdSense or Sponsor Banner</p>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] mt-10">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>Built with Claude Code | shud26</p>
        </div>
      </footer>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Admin Login</h3>
            <input
              type="password"
              placeholder="Enter PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              className={`w-full bg-[#0f0f0f] border ${pinError ? 'border-red-500' : 'border-[#2a2a2a]'} rounded-lg px-4 py-2 mb-4`}
              autoFocus
            />
            {pinError && <p className="text-red-400 text-sm mb-4">Wrong PIN</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}
                className="flex-1 py-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a]"
              >Cancel</button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 py-2 bg-[#6366f1] rounded-lg hover:bg-[#818cf8]"
              >Login</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Todo Modal */}
      {showTodoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Todo</h3>
            <input
              type="text"
              placeholder="What to do?"
              value={newTodo.text}
              onChange={(e) => setNewTodo({ ...newTodo, text: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3"
              autoFocus
            />
            <input
              type="date"
              value={newTodo.date}
              onChange={(e) => setNewTodo({ ...newTodo, date: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowTodoModal(false)} className="flex-1 py-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a]">Cancel</button>
              <button onClick={addTodo} className="flex-1 py-2 bg-[#6366f1] rounded-lg hover:bg-[#818cf8]">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Airdrop Modal */}
      {showAirdropModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Airdrop</h3>
            <input
              type="text"
              placeholder="Project name"
              value={newAirdrop.name}
              onChange={(e) => setNewAirdrop({ ...newAirdrop, name: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3"
              autoFocus
            />
            <input
              type="text"
              placeholder="Chain (e.g. Ethereum, Arbitrum)"
              value={newAirdrop.chain}
              onChange={(e) => setNewAirdrop({ ...newAirdrop, chain: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3"
            />
            <input
              type="date"
              value={newAirdrop.deadline}
              onChange={(e) => setNewAirdrop({ ...newAirdrop, deadline: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3"
            />
            <input
              type="text"
              placeholder="Expected value (e.g. $500~2000)"
              value={newAirdrop.expectedValue}
              onChange={(e) => setNewAirdrop({ ...newAirdrop, expectedValue: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowAirdropModal(false)} className="flex-1 py-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a]">Cancel</button>
              <button onClick={addAirdrop} className="flex-1 py-2 bg-[#6366f1] rounded-lg hover:bg-[#818cf8]">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Calendar Event</h3>
            <input
              type="text"
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3"
              autoFocus
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3"
            />
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3"
            >
              <option value="airdrop">Airdrop</option>
              <option value="snapshot">Snapshot</option>
              <option value="tge">TGE</option>
              <option value="other">Other</option>
            </select>
            <textarea
              placeholder="Memo (optional)"
              value={newEvent.memo}
              onChange={(e) => setNewEvent({ ...newEvent, memo: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-4 h-24"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowEventModal(false)} className="flex-1 py-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a]">Cancel</button>
              <button onClick={addEvent} className="flex-1 py-2 bg-[#6366f1] rounded-lg hover:bg-[#818cf8]">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEventDetailModal(false)}>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  selectedEvent.type === 'snapshot' ? 'bg-yellow-400' :
                  selectedEvent.type === 'tge' ? 'bg-green-400' :
                  selectedEvent.type === 'airdrop' ? 'bg-purple-400' :
                  'bg-gray-400'
                }`} />
                <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
              </div>
              <span className="text-xs bg-[#2a2a2a] px-2 py-1 rounded">{selectedEvent.type.toUpperCase()}</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">{selectedEvent.date}</p>
            {selectedEvent.memo && (
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 mb-4">
                <p className="text-sm whitespace-pre-wrap">{selectedEvent.memo}</p>
              </div>
            )}
            <button
              onClick={() => setShowEventDetailModal(false)}
              className="w-full py-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a]"
            >Close</button>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              Add Task to {airdrops.find(a => a.id === selectedAirdropId)?.name}
            </h3>
            <input
              type="text"
              placeholder="Task name"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3"
              autoFocus
            />
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-400">$</span>
              <input
                type="number"
                placeholder="Cost"
                value={newTask.cost || ''}
                onChange={(e) => setNewTask({ ...newTask, cost: parseFloat(e.target.value) || 0 })}
                className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowTaskModal(false); setSelectedAirdropId(null); setNewTask({ name: '', cost: 0 }); }}
                className="flex-1 py-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a]"
              >Cancel</button>
              <button onClick={addTask} className="flex-1 py-2 bg-[#6366f1] rounded-lg hover:bg-[#818cf8]">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Research Modal */}
      {showResearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Research</h3>
            <input
              type="text"
              placeholder="Coin (e.g. ETH, BTC)"
              value={newResearch.coin}
              onChange={(e) => setNewResearch({ ...newResearch, coin: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3"
              autoFocus
            />
            <textarea
              placeholder="Notes"
              value={newResearch.notes}
              onChange={(e) => setNewResearch({ ...newResearch, notes: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-3 h-24"
            />
            <select
              value={newResearch.sentiment}
              onChange={(e) => setNewResearch({ ...newResearch, sentiment: e.target.value as Research['sentiment'] })}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 mb-4"
            >
              <option value="bullish">🐂 Bullish</option>
              <option value="neutral">😐 Neutral</option>
              <option value="bearish">🐻 Bearish</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowResearchModal(false)} className="flex-1 py-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a]">Cancel</button>
              <button onClick={addResearch} className="flex-1 py-2 bg-[#6366f1] rounded-lg hover:bg-[#818cf8]">Add</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
