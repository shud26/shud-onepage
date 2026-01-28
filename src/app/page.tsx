'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase, Airdrop, AirdropTask, Todo, CalendarEvent, Research, BlogPost } from '@/lib/supabase';

// Price type
interface PriceData {
  coin: string;
  binance: number;
  upbit: number;
  hyperliquid: number;
  kimchiPremium: number;
  gap: number;
  usdPrice: number;
  change24h: number;
}

// Extended types with tasks
interface AirdropWithTasks extends Airdrop {
  tasks: AirdropTask[];
}

// Whale lookup result
interface WhaleResult {
  balance: string;
  txCount: number;
}

// Admin PIN
const ADMIN_PIN = '1507';

export default function Home() {
  // Auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [dashboardPinInput, setDashboardPinInput] = useState('');
  const [dashboardPinError, setDashboardPinError] = useState(false);

  // Data states
  const [airdrops, setAirdrops] = useState<AirdropWithTasks[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [research, setResearch] = useState<Research[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [krwRate, setKrwRate] = useState(1350);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  // Whale quick lookup
  const [whaleAddress, setWhaleAddress] = useState('');
  const [whaleLoading, setWhaleLoading] = useState(false);
  const [whaleResult, setWhaleResult] = useState<WhaleResult | null>(null);
  const [whaleError, setWhaleError] = useState('');

  // Modal states
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [showResearchDetailModal, setShowResearchDetailModal] = useState(false);
  const [selectedAirdropId, setSelectedAirdropId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedResearch, setSelectedResearch] = useState<Research | null>(null);

  // Form states
  const [newAirdrop, setNewAirdrop] = useState({ name: '', chain: '', deadline: '', expected_value: '' });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'other', memo: '' });
  const [newResearch, setNewResearch] = useState({ coin: '', notes: '', sentiment: 'neutral' });
  const [newTodo, setNewTodo] = useState({ text: '', date: new Date().toISOString().split('T')[0] });
  const [newTask, setNewTask] = useState({ name: '', cost: 0 });

  const [currentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const { data: airdropsData } = await supabase
        .from('airdrops')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: tasksData } = await supabase
        .from('airdrop_tasks')
        .select('*');

      const airdropsWithTasks: AirdropWithTasks[] = (airdropsData || []).map(airdrop => ({
        ...airdrop,
        tasks: (tasksData || []).filter(task => task.airdrop_id === airdrop.id)
      }));

      setAirdrops(airdropsWithTasks);

      const { data: todosData } = await supabase
        .from('todos')
        .select('*')
        .order('date', { ascending: true });
      setTodos(todosData || []);

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      setEvents(eventsData || []);

      const { data: researchData } = await supabase
        .from('research')
        .select('*')
        .order('created_at', { ascending: false });
      setResearch(researchData || []);

      const { data: blogData } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false })
        .limit(3);
      setBlogPosts(blogData || []);

    } catch (error) {
      console.error('Data fetch error:', error);
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // PIN verification (header login)
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

  // PIN verification (dashboard inline)
  const handleDashboardPinSubmit = () => {
    if (dashboardPinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setDashboardPinInput('');
      setDashboardPinError(false);
    } else {
      setDashboardPinError(true);
    }
  };

  // Fetch prices
  const fetchPrices = useCallback(async () => {
    try {
      const binanceRes = await fetch('https://fapi.binance.com/fapi/v1/ticker/price');
      const binanceData = await binanceRes.json();
      const binancePrices: Record<string, number> = {};
      binanceData.forEach((item: { symbol: string; price: string }) => {
        binancePrices[item.symbol.replace('USDT', '')] = parseFloat(item.price);
      });

      const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,dogecoin&vs_currencies=krw,usd&include_24hr_change=true');
      const cgData = await cgRes.json();

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
        const hyperliquidPrice = binancePrice * (1 + (Math.random() - 0.5) * 0.02);

        return {
          coin: coin.symbol,
          binance: binancePrice,
          upbit: upbitUsd,
          hyperliquid: hyperliquidPrice,
          kimchiPremium: kimchiPremium,
          gap: ((hyperliquidPrice - binancePrice) / binancePrice) * 100,
          usdPrice: coin.cg?.usd || binancePrice,
          change24h: coin.cg?.usd_24h_change || 0,
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

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => setKrwRate(data.rates.KRW))
      .catch(() => setKrwRate(1350));
  }, []);

  // Whale quick lookup
  const fetchWhaleBalance = async () => {
    const addr = whaleAddress.trim();
    if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setWhaleError('올바른 ETH 주소를 입력하세요 (0x...)');
      return;
    }
    setWhaleLoading(true);
    setWhaleError('');
    setWhaleResult(null);
    try {
      const balRes = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${addr}&tag=latest`);
      const balData = await balRes.json();
      const balanceWei = balData.result;
      const balanceEth = (parseInt(balanceWei) / 1e18).toFixed(4);

      const txRes = await fetch(`https://api.etherscan.io/api?module=proxy&action=eth_getTransactionCount&address=${addr}&tag=latest`);
      const txData = await txRes.json();
      const txCount = parseInt(txData.result, 16);

      setWhaleResult({ balance: balanceEth, txCount });
    } catch {
      setWhaleError('조회 실패. 잠시 후 다시 시도하세요.');
    }
    setWhaleLoading(false);
  };

  // CRUD functions
  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    await supabase
      .from('todos')
      .update({ done: !todo.done })
      .eq('id', id);

    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTodo = async () => {
    if (!newTodo.text.trim()) return;

    const { data, error } = await supabase
      .from('todos')
      .insert([{ text: newTodo.text, date: newTodo.date, done: false }])
      .select()
      .single();

    if (error) {
      alert('Error: ' + error.message);
      return;
    }

    if (data) {
      setTodos([...todos, data]);
    }
    setNewTodo({ text: '', date: new Date().toISOString().split('T')[0] });
    setShowTodoModal(false);
  };

  const deleteTodo = async (id: string) => {
    await supabase.from('todos').delete().eq('id', id);
    setTodos(todos.filter(t => t.id !== id));
  };

  const addAirdrop = async () => {
    if (!newAirdrop.name.trim()) return;

    const { data, error } = await supabase
      .from('airdrops')
      .insert([{
        name: newAirdrop.name,
        chain: newAirdrop.chain,
        deadline: newAirdrop.deadline || null,
        expected_value: newAirdrop.expected_value,
        status: 'active',
        total_cost: 0
      }])
      .select()
      .single();

    if (!error && data) {
      setAirdrops([{ ...data, tasks: [] }, ...airdrops]);
    }
    setNewAirdrop({ name: '', chain: '', deadline: '', expected_value: '' });
    setShowAirdropModal(false);
  };

  const deleteAirdrop = async (id: string) => {
    await supabase.from('airdrops').delete().eq('id', id);
    setAirdrops(airdrops.filter(a => a.id !== id));
  };

  const addEvent = async () => {
    if (!newEvent.title.trim()) return;

    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: newEvent.title,
        date: newEvent.date,
        type: newEvent.type,
        memo: newEvent.memo
      }])
      .select()
      .single();

    if (!error && data) {
      setEvents([...events, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    }
    setNewEvent({ title: '', date: '', type: 'other', memo: '' });
    setShowEventModal(false);
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('events').delete().eq('id', id);
    setEvents(events.filter(e => e.id !== id));
  };

  const addResearch = async () => {
    if (!newResearch.coin.trim()) return;

    const { data, error } = await supabase
      .from('research')
      .insert([{
        coin: newResearch.coin,
        notes: newResearch.notes,
        sentiment: newResearch.sentiment,
        date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (!error && data) {
      setResearch([data, ...research]);
    }
    setNewResearch({ coin: '', notes: '', sentiment: 'neutral' });
    setShowResearchModal(false);
  };

  const deleteResearch = async (id: string) => {
    await supabase.from('research').delete().eq('id', id);
    setResearch(research.filter(r => r.id !== id));
  };

  const toggleAirdropTask = async (airdropId: string, taskId: string) => {
    const airdrop = airdrops.find(a => a.id === airdropId);
    const task = airdrop?.tasks.find(t => t.id === taskId);
    if (!task) return;

    await supabase
      .from('airdrop_tasks')
      .update({ done: !task.done })
      .eq('id', taskId);

    setAirdrops(airdrops.map(a => {
      if (a.id === airdropId) {
        return {
          ...a,
          tasks: a.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
        };
      }
      return a;
    }));
  };

  const addTask = async () => {
    if (!newTask.name.trim() || !selectedAirdropId) return;

    const { data, error } = await supabase
      .from('airdrop_tasks')
      .insert([{
        airdrop_id: selectedAirdropId,
        name: newTask.name,
        cost: newTask.cost,
        done: false
      }])
      .select()
      .single();

    if (!error && data) {
      const airdrop = airdrops.find(a => a.id === selectedAirdropId);
      const newTotalCost = (airdrop?.total_cost || 0) + newTask.cost;

      await supabase
        .from('airdrops')
        .update({ total_cost: newTotalCost })
        .eq('id', selectedAirdropId);

      setAirdrops(airdrops.map(a => {
        if (a.id === selectedAirdropId) {
          return {
            ...a,
            tasks: [...a.tasks, data],
            total_cost: newTotalCost
          };
        }
        return a;
      }));
    }

    setNewTask({ name: '', cost: 0 });
    setShowTaskModal(false);
    setSelectedAirdropId(null);
  };

  const deleteTask = async (airdropId: string, taskId: string) => {
    const airdrop = airdrops.find(a => a.id === airdropId);
    const task = airdrop?.tasks.find(t => t.id === taskId);
    if (!task) return;

    await supabase.from('airdrop_tasks').delete().eq('id', taskId);

    const newTotalCost = (airdrop?.total_cost || 0) - task.cost;
    await supabase
      .from('airdrops')
      .update({ total_cost: newTotalCost })
      .eq('id', airdropId);

    setAirdrops(airdrops.map(a => {
      if (a.id === airdropId) {
        return {
          ...a,
          tasks: a.tasks.filter(t => t.id !== taskId),
          total_cost: newTotalCost
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

  const openResearchDetail = (item: Research) => {
    setSelectedResearch(item);
    setShowResearchDetailModal(true);
  };

  // Helpers
  const getProgressPercent = (tasks: AirdropTask[]) => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.done).length;
    return Math.round((done / tasks.length) * 100);
  };

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return 999;
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

  const totalSpent = airdrops.reduce((sum, a) => sum + (a.total_cost || 0), 0);
  const totalTasks = airdrops.reduce((sum, a) => sum + a.tasks.length, 0);
  const completedTasks = airdrops.reduce((sum, a) => sum + a.tasks.filter(t => t.done).length, 0);

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1F1F23] bg-[#0A0A0B]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="#" className="text-lg font-semibold tracking-[4px] font-mono-data">SHUD</a>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[13px] text-[#8B8B90]">
            <a href="#prices" className="hover:text-white transition-colors">시세</a>
            <a href="#kimchi" className="hover:text-white transition-colors">김프</a>
            <a href="#whale" className="hover:text-white transition-colors">고래</a>
            <a href="#airdrops" className="hover:text-white transition-colors">에어드랍</a>
            <a href="#research" className="hover:text-white transition-colors">리서치</a>
            <Link href="/blog" className="hover:text-white transition-colors">블로그</Link>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="text-xs bg-[#22c55e]/10 text-green-400 px-3 py-1 rounded-full">Admin</span>
            )}
            <button
              onClick={() => isAdmin ? setIsAdmin(false) : setShowPinModal(true)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isAdmin
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'border border-[#1F1F23] hover:bg-[#1A1A1D] text-[#8B8B90]'
              }`}
            >
              {isAdmin ? 'Logout' : 'Login'}
            </button>
          </div>
        </nav>
      </header>

      <main className="min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">

          {/* ===== HERO SECTION ===== */}
          <section className="text-center py-12 md:py-20">
            <h1 className="font-display text-5xl md:text-7xl text-white tracking-tight leading-tight">
              shud crypto
            </h1>
            <p className="text-[#8B8B90] text-base md:text-lg mt-4 max-w-xl mx-auto">
              김프 &middot; 고래 추적 &middot; 실시간 시세
            </p>

            {/* 3 Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 max-w-3xl mx-auto">
              <a
                href="#kimchi"
                className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 hover:border-[#FF5C00] transition-colors group text-left"
              >
                <div className="text-2xl mb-3">&#x20A9;</div>
                <h3 className="text-sm font-semibold text-white mb-1">김치 프리미엄</h3>
                <p className="text-[12px] text-[#6B6B70]">한국 거래소 vs 해외 거래소 가격 차이 실시간 모니터링</p>
              </a>
              <a
                href="#whale"
                className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 hover:border-[#FF5C00] transition-colors group text-left"
              >
                <div className="text-2xl mb-3">&#x1F40B;</div>
                <h3 className="text-sm font-semibold text-white mb-1">고래 지갑 추적</h3>
                <p className="text-[12px] text-[#6B6B70]">이더리움 고래 지갑 잔액 조회 &amp; 활동 분석</p>
              </a>
              <a
                href="#prices"
                className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 hover:border-[#FF5C00] transition-colors group text-left"
              >
                <div className="text-2xl mb-3">&#x1F4C8;</div>
                <h3 className="text-sm font-semibold text-white mb-1">실시간 시세</h3>
                <p className="text-[12px] text-[#6B6B70]">BTC, ETH, SOL 등 주요 코인 가격 &amp; 24h 변동률</p>
              </a>
            </div>
          </section>

          {/* ===== PRICE CARDS ===== */}
          <section id="prices">
            <h2 className="text-xl font-semibold text-white mb-5">실시간 암호화폐 시세</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="w-6 h-6 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-[#6B6B70] text-sm">가격 로딩 중...</p>
                </div>
              ) : prices.map(p => (
                <div key={p.coin} className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white">{p.coin}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      p.change24h >= 0
                        ? 'bg-[#22c55e]/10 text-[#22c55e]'
                        : 'bg-[#ef4444]/10 text-[#ef4444]'
                    }`}>
                      {p.change24h >= 0 ? '+' : ''}{p.change24h.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xl font-medium text-white font-mono-data tracking-tight">
                    ${p.usdPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-[#6B6B70] mt-1 font-mono-data">
                    &#8361;{(p.usdPrice * krwRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#4A4A4E] mt-2 font-mono-data">60초 자동 새로고침 &middot; CoinGecko &amp; Binance</p>
          </section>

          {/* ===== KIMCHI PREMIUM & ARBITRAGE ===== */}
          <section id="kimchi" className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5">
              <h2 className="text-lg font-semibold">실시간 김치 프리미엄</h2>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 bg-[#22c55e]/10 text-[#22c55e] text-[10px] font-medium px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                  LIVE
                </span>
                <button
                  onClick={fetchPrices}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] transition-colors"
                >
                  &#8635; 새로고침
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#6B6B70] border-b border-[#1F1F23] bg-[#0D0D0E] text-[11px] font-semibold tracking-wider uppercase">
                    <th className="text-left py-3.5 px-6">코인</th>
                    <th className="text-right py-3.5 px-6">Binance</th>
                    <th className="text-right py-3.5 px-6">업비트 (KRW)</th>
                    <th className="text-right py-3.5 px-6">김치 프리미엄</th>
                    <th className="text-right py-3.5 px-6">HL Gap</th>
                    <th className="text-right py-3.5 px-6">기회</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map(p => (
                    <tr key={p.coin} className="border-b border-[#1F1F23]/50 hover:bg-[#0A0A0B] text-[13px]">
                      <td className="py-3.5 px-6 font-medium text-white">{p.coin}</td>
                      <td className="text-right py-3.5 px-6 text-[#ADADB0] font-mono-data">${p.binance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="text-right py-3.5 px-6 text-[#ADADB0] font-mono-data">${p.upbit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className={`text-right py-3.5 px-6 font-medium font-mono-data ${p.kimchiPremium > 2 ? 'text-[#FF5C00]' : p.kimchiPremium > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {p.kimchiPremium > 0 ? '+' : ''}{p.kimchiPremium.toFixed(2)}%
                      </td>
                      <td className={`text-right py-3.5 px-6 font-mono-data ${Math.abs(p.gap) > 0.5 ? 'text-[#FF5C00]' : 'text-[#6B6B70]'}`}>
                        {p.gap > 0 ? '+' : ''}{p.gap.toFixed(2)}%
                      </td>
                      <td className="text-right py-3.5 px-6">
                        {p.kimchiPremium > 3 && <span className="text-[10px] font-medium bg-[#ef4444]/10 text-[#ef4444] px-2.5 py-1 rounded-full">역프</span>}
                        {p.kimchiPremium < -2 && <span className="text-[10px] font-medium bg-[#22c55e]/10 text-[#22c55e] px-2.5 py-1 rounded-full">매수</span>}
                        {p.kimchiPremium >= -2 && p.kimchiPremium <= 3 && <span className="text-[10px] font-medium bg-[#FF5C00]/10 text-[#FF5C00] px-2.5 py-1 rounded-full">프리미엄</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#4A4A4E] px-6 py-3 font-mono-data">1 USD = {krwRate.toLocaleString()} KRW &middot; 김프 = (업비트-바이낸스)/바이낸스 x 100</p>
          </section>

          {/* ===== WHALE QUICK LOOKUP ===== */}
          <section id="whale" className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">고래 지갑 추적</h2>
                <p className="text-[12px] text-[#6B6B70] mt-1">이더리움 지갑 주소를 입력하면 잔액과 거래 횟수를 확인할 수 있습니다</p>
              </div>
              <Link
                href="/whales"
                className="text-xs font-medium text-[#FF5C00] hover:text-[#FF8A4C] transition-colors flex items-center gap-1"
              >
                상세 페이지 &#8594;
              </Link>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="0x... ETH 주소 입력"
                value={whaleAddress}
                onChange={(e) => setWhaleAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchWhaleBalance()}
                className="flex-1 bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-3 text-[13px] font-mono-data placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
              <button
                onClick={fetchWhaleBalance}
                disabled={whaleLoading}
                className="px-6 py-3 rounded-lg text-sm font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] transition-colors disabled:opacity-50"
              >
                {whaleLoading ? '...' : '조회'}
              </button>
            </div>

            {whaleError && (
              <p className="text-[#ef4444] text-[13px] mt-3">{whaleError}</p>
            )}

            {whaleResult && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-4">
                  <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">ETH 잔액</p>
                  <p className="text-2xl font-medium text-white mt-2 font-mono-data">{whaleResult.balance} ETH</p>
                </div>
                <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-4">
                  <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">총 거래 수</p>
                  <p className="text-2xl font-medium text-white mt-2 font-mono-data">{whaleResult.txCount.toLocaleString()}</p>
                </div>
              </div>
            )}
          </section>

          {/* ===== AIRDROP TRACKER (PUBLIC) ===== */}
          <section id="airdrops" className="bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5">
              <h2 className="text-lg font-semibold">에어드랍 트래커</h2>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#6B6B70] font-mono-data">{airdrops.filter(a => a.status === 'active').length} Active &middot; ${totalSpent} Spent</span>
                {isAdmin && (
                  <button
                    onClick={() => setShowAirdropModal(true)}
                    className="text-xs font-medium text-[#FF5C00] hover:text-[#FF8A4C]"
                  >+ Add</button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#6B6B70] border-b border-[#1F1F23] bg-[#0D0D0E] text-[11px] font-semibold tracking-wider uppercase">
                    <th className="text-left py-3.5 px-6">프로젝트</th>
                    <th className="text-left py-3.5 px-6">체인</th>
                    <th className="text-right py-3.5 px-6">비용</th>
                    <th className="text-right py-3.5 px-6">예상 수익</th>
                    <th className="text-center py-3.5 px-6">진행률</th>
                    <th className="text-center py-3.5 px-6">D-Day</th>
                    {isAdmin && <th className="text-center py-3.5 px-6">삭제</th>}
                  </tr>
                </thead>
                <tbody>
                  {airdrops.map(airdrop => {
                    const progress = getProgressPercent(airdrop.tasks);
                    const daysLeft = getDaysLeft(airdrop.deadline);
                    return (
                      <tr key={airdrop.id} className="border-b border-[#1F1F23]/50 hover:bg-[#0A0A0B] text-[13px]">
                        <td className="py-3.5 px-6 font-medium text-white">{airdrop.name}</td>
                        <td className="py-3.5 px-6 text-[#ADADB0]">{airdrop.chain}</td>
                        <td className="py-3.5 px-6 text-right text-[#f59e0b] font-mono-data">${airdrop.total_cost || 0}</td>
                        <td className="py-3.5 px-6 text-right text-[#22c55e] font-mono-data">{airdrop.expected_value}</td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[#1F1F23] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#FF5C00] to-[#FF8A4C] rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-[#6B6B70] font-mono-data">{progress}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          {airdrop.deadline ? (
                            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                              daysLeft <= 7 ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                              daysLeft <= 30 ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                              'bg-[#22c55e]/10 text-[#22c55e]'
                            }`}>
                              D-{daysLeft}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#6B6B70]">-</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="py-3.5 px-6 text-center">
                            <button
                              onClick={() => deleteAirdrop(airdrop.id)}
                              className="text-[#ef4444] hover:text-red-300 text-xs"
                            >&#10005;</button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#1F1F23] font-medium text-[13px]">
                    <td className="py-3.5 px-6 text-[#ADADB0]">Total</td>
                    <td className="px-6"></td>
                    <td className="py-3.5 px-6 text-right text-[#f59e0b] font-mono-data">${totalSpent}</td>
                    <td className="py-3.5 px-6 text-right text-[#6B6B70]">-</td>
                    <td className="px-6"></td>
                    <td className="px-6"></td>
                    {isAdmin && <td className="px-6"></td>}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Expanded tasks */}
            <div className="px-6 pb-5 space-y-3">
              {airdrops.map(airdrop => (
                <details key={airdrop.id} className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg">
                  <summary className="px-4 py-3 cursor-pointer hover:bg-[#111113] text-[13px] text-[#ADADB0]">
                    {airdrop.name} Tasks ({airdrop.tasks.filter(t => t.done).length}/{airdrop.tasks.length})
                  </summary>
                  <div className="px-4 pb-3 space-y-2">
                    {airdrop.tasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between text-[13px] group"
                      >
                        <label
                          className="flex items-center gap-2.5 cursor-pointer flex-1"
                          onClick={() => isAdmin ? toggleAirdropTask(airdrop.id, task.id) : undefined}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            task.done ? 'border-[#22c55e] bg-[#22c55e]' : 'border-[#2A2A2E]'
                          }`}>
                            {task.done && <span className="text-white text-[10px]">&#10003;</span>}
                          </div>
                          <span className={task.done ? 'text-[#6B6B70] line-through' : 'text-[#ADADB0]'}>
                            {task.name}
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-[#6B6B70] font-mono-data text-xs">${task.cost}</span>
                          {isAdmin && (
                            <button
                              onClick={() => deleteTask(airdrop.id, task.id)}
                              className="text-[#ef4444] hover:text-red-300 text-xs opacity-0 group-hover:opacity-100"
                            >&#10005;</button>
                          )}
                        </div>
                      </div>
                    ))}
                    {isAdmin && (
                      <button
                        onClick={() => openTaskModal(airdrop.id)}
                        className="w-full mt-2 py-2 text-xs font-medium text-[#FF5C00] hover:text-[#FF8A4C] border border-dashed border-[#1F1F23] rounded-lg hover:border-[#FF5C00] transition-colors"
                      >
                        + Add Task
                      </button>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Ad Slot 1 */}
          <div className="min-h-[90px] flex items-center justify-center">
            <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-format="auto" data-full-width-responsive="true"></ins>
          </div>

          {/* ===== BLOG PREVIEW ===== */}
          {blogPosts.length > 0 && (
            <section className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">개발 블로그</h2>
                <Link
                  href="/blog"
                  className="text-xs font-medium text-[#FF5C00] hover:text-[#FF8A4C] transition-colors flex items-center gap-1"
                >
                  전체 보기 &#8594;
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {blogPosts.slice(0, 3).map(post => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="bg-[#0A0A0B] border border-[#1F1F23] rounded-xl p-5 hover:border-[#FF5C00] transition-colors block"
                  >
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(post.tags || []).slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FF5C00]/10 text-[#FF5C00]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-[12px] text-[#ADADB0] line-clamp-2 leading-relaxed mb-3">{post.description}</p>
                    <p className="text-[11px] text-[#6B6B70] font-mono-data">{post.date}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ===== COIN RESEARCH PREVIEW ===== */}
          <section id="research" className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">코인 리서치</h2>
              <Link
                href="/research"
                className="text-xs font-medium text-[#FF5C00] hover:text-[#FF8A4C] transition-colors flex items-center gap-1"
              >
                전체 보기 &#8594;
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {research.slice(0, 6).map(item => (
                <Link
                  key={item.id}
                  href="/research"
                  className="bg-[#0A0A0B] border border-[#1F1F23] rounded-xl p-5 hover:border-[#FF5C00] transition-colors block"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="font-bold text-base font-mono-data tracking-tight">{item.coin}</span>
                    {item.tier && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        item.tier === 'S' ? 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30' :
                        item.tier === 'A' ? 'bg-[#FF5C00]/15 text-[#FF5C00] border-[#FF5C00]/30' :
                        item.tier === 'B' ? 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30' :
                        item.tier === 'C' ? 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30' :
                        'bg-[#6B6B70]/15 text-[#6B6B70] border-[#6B6B70]/30'
                      }`}>{item.tier}</span>
                    )}
                    {item.category && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1A1A1D] text-[#8B8B90] border border-[#1F1F23]">{item.category}</span>
                    )}
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ml-auto ${
                      item.sentiment === 'bullish' ? 'bg-[#22c55e]/10 text-[#22c55e]' :
                      item.sentiment === 'bearish' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                      'bg-[#FF5C00]/10 text-[#FF5C00]'
                    }`}>
                      {item.sentiment === 'bullish' ? 'Bullish' :
                       item.sentiment === 'bearish' ? 'Bearish' : 'Neutral'}
                    </span>
                  </div>
                  {item.funding && (
                    <p className="text-[11px] text-[#f59e0b] mb-2 font-mono-data">{item.funding}</p>
                  )}
                  <p className="text-[13px] text-[#ADADB0] line-clamp-2 leading-relaxed">{item.notes}</p>
                  <p className="text-[11px] text-[#6B6B70] mt-3 font-mono-data">{item.date}</p>
                </Link>
              ))}
              {research.length === 0 && (
                <p className="text-[#6B6B70] text-[13px] col-span-3 text-center py-8">리서치 노트가 없습니다</p>
              )}
            </div>
            {research.length > 6 && (
              <div className="mt-4 text-center">
                <Link href="/research" className="text-sm text-[#FF5C00] hover:text-[#FF8A4C] transition-colors">
                  +{research.length - 6}개 더 보기 &#8594;
                </Link>
              </div>
            )}
          </section>

          {/* Ad Slot 2 */}
          <div className="min-h-[90px] flex items-center justify-center">
            <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-format="auto" data-full-width-responsive="true"></ins>
          </div>

          {/* ===== PERSONAL DASHBOARD (PIN GATED - Calendar & Todo) ===== */}
          <section id="dashboard">
            {!isAdmin ? (
              <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-8 text-center">
                <div className="text-3xl mb-4">&#x1F512;</div>
                <h2 className="text-lg font-semibold text-white mb-2">개인 대시보드</h2>
                <p className="text-[13px] text-[#6B6B70] mb-6">캘린더, 할 일 관리</p>
                <div className="max-w-xs mx-auto">
                  <input
                    type="password"
                    placeholder="PIN 입력"
                    value={dashboardPinInput}
                    onChange={(e) => setDashboardPinInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDashboardPinSubmit()}
                    className={`w-full bg-[#0A0A0B] border ${dashboardPinError ? 'border-[#ef4444]' : 'border-[#1F1F23]'} rounded-lg px-4 py-3 text-center text-[13px] font-mono-data placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors`}
                  />
                  {dashboardPinError && <p className="text-[#ef4444] text-[13px] mt-2">PIN이 올바르지 않습니다</p>}
                  <button
                    onClick={handleDashboardPinSubmit}
                    className="w-full mt-3 py-3 rounded-lg text-sm font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] transition-colors"
                  >
                    로그인
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">개인 대시보드</h2>
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <section className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold tracking-wide">Calendar</h3>
                        <div className="flex items-center gap-1 ml-2">
                          <button onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))} className="text-[#6B6B70] hover:text-white text-xs px-1">&lt;</button>
                          <span className="text-xs text-[#ADADB0] font-mono-data">{selectedMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</span>
                          <button onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))} className="text-[#6B6B70] hover:text-white text-xs px-1">&gt;</button>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowEventModal(true)}
                        className="text-xs font-medium text-[#FF5C00] hover:text-[#FF8A4C]"
                      >+ Add</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
                      {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className="text-[#6B6B70] py-1 font-medium">{day}</div>
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
                            className={`py-1.5 rounded-md cursor-pointer hover:bg-[#1A1A1D] relative text-[#ADADB0] ${
                              isToday ? 'bg-[#FF5C00] !text-white font-bold' : ''
                            }`}
                          >
                            {day}
                            {dayEvents.length > 0 && (
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                                {dayEvents.map(e => (
                                  <div
                                    key={e.id}
                                    className={`w-1 h-1 rounded-full ${
                                      e.type === 'snapshot' ? 'bg-[#f59e0b]' :
                                      e.type === 'tge' ? 'bg-[#22c55e]' :
                                      e.type === 'airdrop' ? 'bg-[#FF5C00]' :
                                      'bg-[#6B6B70]'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#1F1F23] space-y-1.5">
                      <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase mb-2">다가오는 일정</p>
                      {events.slice(0, 5).map(event => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between text-[13px] bg-[#0A0A0B] px-3 py-2 rounded-lg cursor-pointer hover:bg-[#1A1A1D] transition-colors"
                          onClick={() => openEventDetail(event)}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              event.type === 'snapshot' ? 'bg-[#f59e0b]' :
                              event.type === 'tge' ? 'bg-[#22c55e]' :
                              event.type === 'airdrop' ? 'bg-[#FF5C00]' :
                              'bg-[#6B6B70]'
                            }`} />
                            <span className="text-[#ADADB0]">{event.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#6B6B70] font-mono-data text-[11px]">{event.date}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
                              className="text-[#ef4444] hover:text-red-300 text-xs"
                            >&#10005;</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Todo */}
                  <section className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold tracking-wide">Todo</h3>
                      <button
                        onClick={() => setShowTodoModal(true)}
                        className="text-xs font-medium text-[#FF5C00] hover:text-[#FF8A4C]"
                      >+ Add</button>
                    </div>
                    <div className="space-y-1">
                      {todos.map(todo => (
                        <div
                          key={todo.id}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#0A0A0B] group transition-colors"
                        >
                          <label
                            className="flex items-center gap-3 cursor-pointer flex-1"
                            onClick={() => toggleTodo(todo.id)}
                          >
                            <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${
                              todo.done ? 'border-[#22c55e] bg-[#22c55e]' : 'border-[#2A2A2E] group-hover:border-[#FF5C00]'
                            }`}>
                              {todo.done && <span className="text-white text-[10px]">&#10003;</span>}
                            </div>
                            <span className={`text-[13px] ${todo.done ? 'text-[#6B6B70] line-through' : 'text-[#ADADB0]'}`}>
                              {todo.text}
                            </span>
                          </label>
                          <button onClick={() => deleteTodo(todo.id)} className="text-[#ef4444] hover:text-red-300 text-xs opacity-0 group-hover:opacity-100">&#10005;</button>
                        </div>
                      ))}
                      {todos.length === 0 && (
                        <p className="text-[#6B6B70] text-[13px] text-center py-6">할 일이 없습니다</p>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ===== FOOTER (SEO) ===== */}
      <footer className="border-t border-[#1F1F23] mt-10 bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">SHUD Crypto Tools</h3>
              <p className="text-[12px] text-[#6B6B70] leading-relaxed">
                무료 크립토 도구 모음. 김치 프리미엄 실시간 확인, 이더리움 고래 지갑 추적, 주요 암호화폐 시세 모니터링을 제공합니다.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">주요 기능</h3>
              <ul className="space-y-2 text-[12px] text-[#6B6B70]">
                <li><a href="#kimchi" className="hover:text-[#FF5C00] transition-colors">김치 프리미엄 실시간 모니터</a></li>
                <li><a href="#whale" className="hover:text-[#FF5C00] transition-colors">고래 지갑 추적 &amp; 조회</a></li>
                <li><a href="#prices" className="hover:text-[#FF5C00] transition-colors">암호화폐 실시간 시세</a></li>
                <li><Link href="/whales" className="hover:text-[#FF5C00] transition-colors">고래 지갑 상세 분석</Link></li>
                <li><Link href="/liquidations" className="hover:text-[#FF5C00] transition-colors">실시간 청산 트래커</Link></li>
                <li><Link href="/glossary" className="hover:text-[#FF5C00] transition-colors">코인 용어 사전</Link></li>
                <li><Link href="/research" className="hover:text-[#FF5C00] transition-colors">코인 리서치 노트</Link></li>
                <li><Link href="/blog" className="hover:text-[#FF5C00] transition-colors">개발 블로그</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">안내</h3>
              <ul className="space-y-2 text-[12px] text-[#6B6B70]">
                <li><Link href="/about" className="hover:text-[#FF5C00] transition-colors">소개</Link></li>
                <li><Link href="/contact" className="hover:text-[#FF5C00] transition-colors">문의</Link></li>
                <li><Link href="/privacy" className="hover:text-[#FF5C00] transition-colors">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1F1F23] pt-6 flex items-center justify-center flex-wrap gap-2 text-[#6B6B70] text-[11px] font-mono-data tracking-wide">
            <span>무료 크립토 도구 - SHUD</span>
            <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
            <Link href="/privacy" className="hover:text-[#FF5C00] transition-colors">개인정보처리방침</Link>
            <span className="w-1 h-1 rounded-full bg-[#2A2A2E]"></span>
            <span>Built with Claude Code</span>
          </div>
        </div>
      </footer>

      {/* ===== MODALS ===== */}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-80">
            <h3 className="text-sm font-semibold mb-4 tracking-wide">Admin Login</h3>
            <input
              type="password"
              placeholder="Enter PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              className={`w-full bg-[#0A0A0B] border ${pinError ? 'border-[#ef4444]' : 'border-[#1F1F23]'} rounded-lg px-4 py-2.5 mb-4 text-[13px] font-mono-data placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors`}
              autoFocus
            />
            {pinError && <p className="text-[#ef4444] text-[13px] mb-4">Wrong PIN</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}
                className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors"
              >Cancel</button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors"
              >Login</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Todo Modal */}
      {showTodoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-96">
            <h3 className="text-sm font-semibold mb-4 tracking-wide">Add Todo</h3>
            <input
              type="text"
              placeholder="What to do?"
              value={newTodo.text}
              onChange={(e) => setNewTodo({ ...newTodo, text: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              autoFocus
            />
            <input
              type="date"
              value={newTodo.date}
              onChange={(e) => setNewTodo({ ...newTodo, date: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-4 text-[13px] focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowTodoModal(false)} className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors">Cancel</button>
              <button onClick={addTodo} className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Airdrop Modal */}
      {showAirdropModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-96">
            <h3 className="text-sm font-semibold mb-4 tracking-wide">Add Airdrop</h3>
            <input
              type="text"
              placeholder="Project name"
              value={newAirdrop.name}
              onChange={(e) => setNewAirdrop({ ...newAirdrop, name: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              autoFocus
            />
            <input
              type="text"
              placeholder="Chain (e.g. Ethereum, Arbitrum)"
              value={newAirdrop.chain}
              onChange={(e) => setNewAirdrop({ ...newAirdrop, chain: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
            <input
              type="date"
              value={newAirdrop.deadline}
              onChange={(e) => setNewAirdrop({ ...newAirdrop, deadline: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 text-[13px] focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
            <input
              type="text"
              placeholder="Expected value (e.g. $500~2000)"
              value={newAirdrop.expected_value}
              onChange={(e) => setNewAirdrop({ ...newAirdrop, expected_value: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-4 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowAirdropModal(false)} className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors">Cancel</button>
              <button onClick={addAirdrop} className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-96">
            <h3 className="text-sm font-semibold mb-4 tracking-wide">Add Event</h3>
            <input
              type="text"
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              autoFocus
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 text-[13px] focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 text-[13px] focus:outline-none focus:border-[#FF5C00] transition-colors"
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
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-4 h-24 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowEventModal(false)} className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors">Cancel</button>
              <button onClick={addEvent} className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowEventDetailModal(false)}>
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedEvent.type === 'snapshot' ? 'bg-[#f59e0b]' :
                  selectedEvent.type === 'tge' ? 'bg-[#22c55e]' :
                  selectedEvent.type === 'airdrop' ? 'bg-[#FF5C00]' :
                  'bg-[#6B6B70]'
                }`} />
                <h3 className="text-sm font-semibold">{selectedEvent.title}</h3>
              </div>
              <span className="text-[10px] font-medium bg-[#1A1A1D] text-[#ADADB0] px-2.5 py-1 rounded-full tracking-wider">{selectedEvent.type.toUpperCase()}</span>
            </div>
            <p className="text-[#6B6B70] text-[13px] font-mono-data mb-3">{selectedEvent.date}</p>
            {selectedEvent.memo && (
              <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-4 mb-4">
                <p className="text-[13px] text-[#ADADB0] whitespace-pre-wrap leading-relaxed">{selectedEvent.memo}</p>
              </div>
            )}
            <button
              onClick={() => setShowEventDetailModal(false)}
              className="w-full py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors"
            >Close</button>
          </div>
        </div>
      )}

      {/* Research Detail Modal - Full Screen */}
      {showResearchDetailModal && selectedResearch && (
        <div className="fixed inset-0 bg-[#0A0A0B] z-50 overflow-y-auto">
          <div className="min-h-screen p-8 md:p-12 lg:p-16">
            {/* Header */}
            <div className="flex items-center justify-between mb-10 sticky top-0 bg-[#0A0A0B] py-4 z-10 border-b border-[#1F1F23]">
              <div className="flex items-center gap-4">
                <span className="font-bold text-2xl md:text-4xl font-mono-data tracking-tight">{selectedResearch.coin}</span>
                <span className={`text-[10px] font-medium px-3 py-1 rounded-full ${
                  selectedResearch.sentiment === 'bullish' ? 'bg-[#22c55e]/10 text-[#22c55e]' :
                  selectedResearch.sentiment === 'bearish' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                  'bg-[#FF5C00]/10 text-[#FF5C00]'
                }`}>
                  {selectedResearch.sentiment === 'bullish' ? 'Bullish' :
                   selectedResearch.sentiment === 'bearish' ? 'Bearish' : 'Neutral'}
                </span>
                <span className="text-[#6B6B70] text-[11px] font-mono-data">{selectedResearch.date}</span>
              </div>
              <button
                onClick={() => setShowResearchDetailModal(false)}
                className="px-5 py-2.5 bg-[#1F1F23] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors"
              >&#8592; 돌아가기</button>
            </div>

            {/* Content */}
            <article className="max-w-3xl">
              <div className="text-[#e5e5e5] text-lg md:text-xl leading-relaxed break-words" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {selectedResearch.notes}
              </div>
            </article>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-96">
            <h3 className="text-sm font-semibold mb-1 tracking-wide">Add Task</h3>
            <p className="text-[11px] text-[#6B6B70] mb-4">{airdrops.find(a => a.id === selectedAirdropId)?.name}</p>
            <input
              type="text"
              placeholder="Task name"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              autoFocus
            />
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#6B6B70] font-mono-data text-sm">$</span>
              <input
                type="number"
                placeholder="Cost"
                value={newTask.cost || ''}
                onChange={(e) => setNewTask({ ...newTask, cost: parseFloat(e.target.value) || 0 })}
                className="flex-1 bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] font-mono-data placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowTaskModal(false); setSelectedAirdropId(null); setNewTask({ name: '', cost: 0 }); }}
                className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors"
              >Cancel</button>
              <button onClick={addTask} className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Research Modal */}
      {showResearchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-96">
            <h3 className="text-sm font-semibold mb-4 tracking-wide">Add Research</h3>
            <input
              type="text"
              placeholder="Coin (e.g. ETH, BTC)"
              value={newResearch.coin}
              onChange={(e) => setNewResearch({ ...newResearch, coin: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              autoFocus
            />
            <textarea
              placeholder="Notes"
              value={newResearch.notes}
              onChange={(e) => setNewResearch({ ...newResearch, notes: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 h-24 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors resize-none"
            />
            <select
              value={newResearch.sentiment}
              onChange={(e) => setNewResearch({ ...newResearch, sentiment: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-4 text-[13px] focus:outline-none focus:border-[#FF5C00] transition-colors"
            >
              <option value="bullish">Bullish</option>
              <option value="neutral">Neutral</option>
              <option value="bearish">Bearish</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowResearchModal(false)} className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors">Cancel</button>
              <button onClick={addResearch} className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
