'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase, Research } from '@/lib/supabase';

const ADMIN_PIN = '1507';

const CATEGORIES = [
  'PerpDEX', 'DEX', 'Lending', 'Prediction', 'Crypto Card',
  'L1', 'L2', 'Bridge', 'NFT/Gaming', 'Social', 'Infra',
  'Wallet', 'AI', 'DePIN', 'Other'
];

const TIERS = ['S', 'A', 'B', 'C', 'D'];

const TIER_COLORS: Record<string, string> = {
  S: 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30',
  A: 'bg-[#FF5C00]/15 text-[#FF5C00] border-[#FF5C00]/30',
  B: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30',
  C: 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30',
  D: 'bg-[#6B6B70]/15 text-[#6B6B70] border-[#6B6B70]/30',
};

const SENTIMENT_COLORS: Record<string, string> = {
  bullish: 'bg-[#22c55e]/10 text-[#22c55e]',
  neutral: 'bg-[#FF5C00]/10 text-[#FF5C00]',
  bearish: 'bg-[#ef4444]/10 text-[#ef4444]',
};

export default function ResearchPage() {
  const [research, setResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Filters
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Selected item for detail view
  const [selected, setSelected] = useState<Research | null>(null);

  // Add form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResearch, setNewResearch] = useState({
    coin: '',
    category: '',
    tier: '',
    funding: '',
    vcs: '',
    airdrop_tasks_text: '',
    notes: '',
    sentiment: 'neutral',
  });

  const fetchResearch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('research')
      .select('*')
      .order('created_at', { ascending: false });
    setResearch(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

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

  const addResearch = async () => {
    if (!newResearch.coin.trim()) return;
    const { data, error } = await supabase
      .from('research')
      .insert([{
        coin: newResearch.coin,
        category: newResearch.category,
        tier: newResearch.tier,
        funding: newResearch.funding,
        vcs: newResearch.vcs,
        airdrop_tasks_text: newResearch.airdrop_tasks_text,
        notes: newResearch.notes,
        sentiment: newResearch.sentiment,
        date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (!error && data) {
      setResearch([data, ...research]);
    }
    setNewResearch({ coin: '', category: '', tier: '', funding: '', vcs: '', airdrop_tasks_text: '', notes: '', sentiment: 'neutral' });
    setShowAddModal(false);
  };

  const deleteResearch = async (id: string) => {
    await supabase.from('research').delete().eq('id', id);
    setResearch(research.filter(r => r.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  // Filtered results
  const filtered = research.filter(item => {
    if (sentimentFilter !== 'all' && item.sentiment !== sentimentFilter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (tierFilter !== 'all' && item.tier !== tierFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.coin.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        (item.vcs || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Counts
  const tierCounts = TIERS.reduce((acc, t) => {
    acc[t] = research.filter(r => r.tier === t).length;
    return acc;
  }, {} as Record<string, number>);

  const categoryCounts = CATEGORIES.reduce((acc, c) => {
    const count = research.filter(r => r.category === c).length;
    if (count > 0) acc[c] = count;
    return acc;
  }, {} as Record<string, number>);

  // Full-screen detail view
  if (selected) {
    return (
      <div className="min-h-screen bg-[#0A0A0B]">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
          {/* Back + Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1F1F23]">
            <button
              onClick={() => setSelected(null)}
              className="text-[#8B8B90] hover:text-white text-sm transition-colors flex items-center gap-2"
            >
              &#8592; 목록으로
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#6B6B70] font-mono-data">{selected.date}</span>
              {isAdmin && (
                <button
                  onClick={() => { deleteResearch(selected.id); }}
                  className="text-xs text-[#ef4444] hover:text-red-300"
                >삭제</button>
              )}
            </div>
          </div>

          {/* Title + Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <h1 className="text-3xl md:text-5xl font-bold font-mono-data tracking-tight">{selected.coin}</h1>
            {selected.tier && (
              <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${TIER_COLORS[selected.tier] || TIER_COLORS.D}`}>
                Tier {selected.tier}
              </span>
            )}
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${SENTIMENT_COLORS[selected.sentiment] || SENTIMENT_COLORS.neutral}`}>
              {selected.sentiment === 'bullish' ? 'Bullish' :
               selected.sentiment === 'bearish' ? 'Bearish' : 'Neutral'}
            </span>
            {selected.category && (
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#1F1F23] text-[#ADADB0]">
                {selected.category}
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {selected.funding && (
              <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
                <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase mb-2">투자 유치</p>
                <p className="text-lg font-medium text-white font-mono-data">{selected.funding}</p>
              </div>
            )}
            {selected.vcs && (
              <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4 md:col-span-2">
                <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase mb-2">VC / 투자자</p>
                <div className="flex flex-wrap gap-2">
                  {selected.vcs.split(',').map((vc, i) => (
                    <span key={i} className="text-xs bg-[#1A1A1D] text-[#ADADB0] px-2.5 py-1 rounded-lg border border-[#1F1F23]">
                      {vc.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Airdrop Tasks */}
          {selected.airdrop_tasks_text && (
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-5 mb-8">
              <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase mb-3">에어드랍 작업</p>
              <div className="text-[14px] text-[#ADADB0] leading-relaxed whitespace-pre-wrap">{selected.airdrop_tasks_text}</div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-16">
            <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase mb-4">리서치 노트</p>
            <article className="text-[#e5e5e5] text-base md:text-lg leading-relaxed break-words" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {selected.notes || '내용이 없습니다.'}
            </article>
          </div>

          {/* Bottom nav */}
          <div className="pt-6 border-t border-[#1F1F23] flex items-center justify-between">
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-[#8B8B90] hover:text-white transition-colors"
            >
              &#8592; 목록으로 돌아가기
            </button>
            <Link href="/" className="text-sm text-[#FF5C00] hover:text-[#FF8A4C] transition-colors">
              메인으로 &#8594;
            </Link>
          </div>
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
            <Link href="/" className="text-lg font-semibold tracking-[4px] font-mono-data hover:text-[#FF5C00] transition-colors">SHUD</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></span>
            <span className="text-sm text-[#6B6B70]">Research</span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <span className="text-xs bg-[#22c55e]/10 text-green-400 px-3 py-1 rounded-full">Admin</span>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#FF5C00] hover:bg-[#FF8A4C] transition-colors"
                >
                  + 새 리서치
                </button>
              </>
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
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

          {/* Page Title */}
          <div>
            <h1 className="font-display text-3xl md:text-5xl text-white tracking-tight">코인 리서치</h1>
            <p className="text-[#6B6B70] text-sm mt-3">프로젝트별 투자 분석 &middot; 티어 &middot; VC &middot; 에어드랍 작업</p>
          </div>

          {/* Stats - Tier Overview */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
              <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">전체</p>
              <p className="text-2xl font-medium text-white mt-2 font-mono-data">{research.length}</p>
            </div>
            {TIERS.map(t => (
              <div key={t} className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
                <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">Tier {t}</p>
                <p className={`text-2xl font-medium mt-2 font-mono-data ${
                  t === 'S' ? 'text-[#ef4444]' :
                  t === 'A' ? 'text-[#FF5C00]' :
                  t === 'B' ? 'text-[#f59e0b]' :
                  t === 'C' ? 'text-[#22c55e]' :
                  'text-[#6B6B70]'
                }`}>{tierCounts[t]}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Search */}
            <input
              type="text"
              placeholder="프로젝트, VC, 키워드 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111113] border border-[#1F1F23] rounded-lg px-4 py-3 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
            />

            {/* Filter Row */}
            <div className="flex flex-wrap gap-4">
              {/* Tier Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">Tier</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTierFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      tierFilter === 'all' ? 'bg-[#1F1F23] text-white' : 'text-[#6B6B70] hover:text-white'
                    }`}
                  >All</button>
                  {TIERS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTierFilter(tierFilter === t ? 'all' : t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        tierFilter === t
                          ? TIER_COLORS[t]
                          : 'text-[#6B6B70] hover:text-white'
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* Sentiment Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">전망</span>
                <div className="flex gap-1">
                  {(['all', 'bullish', 'neutral', 'bearish'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setSentimentFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        sentimentFilter === f
                          ? f === 'bullish' ? 'bg-[#22c55e]/20 text-[#22c55e]'
                            : f === 'bearish' ? 'bg-[#ef4444]/20 text-[#ef4444]'
                            : f === 'neutral' ? 'bg-[#FF5C00]/20 text-[#FF5C00]'
                            : 'bg-[#1F1F23] text-white'
                          : 'text-[#6B6B70] hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'All' : f === 'bullish' ? 'Bull' : f === 'neutral' ? 'Neutral' : 'Bear'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">분류</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#111113] border border-[#1F1F23] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF5C00] transition-colors"
                >
                  <option value="all">전체 ({research.length})</option>
                  {Object.entries(categoryCounts).map(([cat, count]) => (
                    <option key={cat} value={cat}>{cat} ({count})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Research List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#6B6B70] text-[13px]">
                {search ? `"${search}" 검색 결과가 없습니다` : '리서치 노트가 없습니다'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(item => (
                <div
                  key={item.id}
                  className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 cursor-pointer hover:border-[#FF5C00] transition-colors group relative"
                  onClick={() => setSelected(item)}
                >
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteResearch(item.id); }}
                      className="absolute top-4 right-4 text-[#ef4444] hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >&#10005;</button>
                  )}

                  {/* Top Row: Name + Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xl font-bold font-mono-data tracking-tight text-white">{item.coin}</span>
                    {item.tier && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TIER_COLORS[item.tier] || TIER_COLORS.D}`}>
                        {item.tier}
                      </span>
                    )}
                    {item.category && (
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#1A1A1D] text-[#ADADB0] border border-[#1F1F23]">
                        {item.category}
                      </span>
                    )}
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${SENTIMENT_COLORS[item.sentiment] || SENTIMENT_COLORS.neutral}`}>
                      {item.sentiment === 'bullish' ? 'Bullish' :
                       item.sentiment === 'bearish' ? 'Bearish' : 'Neutral'}
                    </span>
                    <span className="text-[11px] text-[#6B6B70] font-mono-data ml-auto">{item.date}</span>
                  </div>

                  {/* Meta Row: Funding + VCs */}
                  {(item.funding || item.vcs) && (
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mb-3 text-[12px]">
                      {item.funding && (
                        <span className="text-[#f59e0b]">
                          <span className="text-[#6B6B70] mr-1">투자:</span>
                          <span className="font-mono-data font-medium">{item.funding}</span>
                        </span>
                      )}
                      {item.vcs && (
                        <span className="text-[#ADADB0]">
                          <span className="text-[#6B6B70] mr-1">VC:</span>
                          {item.vcs}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Airdrop Tasks Preview */}
                  {item.airdrop_tasks_text && (
                    <div className="mb-3 text-[12px] text-[#8B8B90] bg-[#0A0A0B] rounded-lg px-3 py-2 border border-[#1F1F23]">
                      <span className="text-[#6B6B70] font-semibold mr-1.5">작업:</span>
                      <span className="line-clamp-1">{item.airdrop_tasks_text}</span>
                    </div>
                  )}

                  {/* Notes Preview */}
                  <p className="text-[14px] text-[#ADADB0] leading-relaxed line-clamp-2">{item.notes}</p>

                  {((item.notes && item.notes.length > 100) || item.airdrop_tasks_text || item.funding) && (
                    <p className="text-[12px] text-[#FF5C00] mt-3 font-medium group-hover:underline">상세 보기 &#8594;</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F1F23] bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between text-[#6B6B70] text-[11px] font-mono-data">
          <Link href="/" className="hover:text-[#FF5C00] transition-colors">&#8592; shud crypto</Link>
          <span>코인 리서치 &middot; 프로젝트 분석</span>
        </div>
      </footer>

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

      {/* Add Research Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-[600px] max-w-[95vw]">
            <h3 className="text-sm font-semibold mb-5 tracking-wide">새 리서치 추가</h3>

            <div className="space-y-4">
              {/* Row 1: Project Name + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase block mb-1.5">프로젝트 이름 *</label>
                  <input
                    type="text"
                    placeholder="예: Hyperliquid, Polymarket"
                    value={newResearch.coin}
                    onChange={(e) => setNewResearch({ ...newResearch, coin: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase block mb-1.5">분류</label>
                  <select
                    value={newResearch.category}
                    onChange={(e) => setNewResearch({ ...newResearch, category: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#FF5C00] transition-colors"
                  >
                    <option value="">선택</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Tier + Sentiment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase block mb-1.5">내 티어</label>
                  <div className="flex gap-2">
                    {TIERS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewResearch({ ...newResearch, tier: newResearch.tier === t ? '' : t })}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors border ${
                          newResearch.tier === t
                            ? TIER_COLORS[t]
                            : 'border-[#1F1F23] text-[#6B6B70] hover:text-white hover:border-[#2A2A2E]'
                        }`}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase block mb-1.5">전망</label>
                  <div className="flex gap-2">
                    {(['bullish', 'neutral', 'bearish'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewResearch({ ...newResearch, sentiment: s })}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                          newResearch.sentiment === s
                            ? SENTIMENT_COLORS[s]
                            : 'border border-[#1F1F23] text-[#6B6B70] hover:text-white'
                        }`}
                      >
                        {s === 'bullish' ? 'Bull' : s === 'neutral' ? 'Neutral' : 'Bear'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Funding + VC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase block mb-1.5">투자 유치</label>
                  <input
                    type="text"
                    placeholder="예: $10M Series A"
                    value={newResearch.funding}
                    onChange={(e) => setNewResearch({ ...newResearch, funding: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase block mb-1.5">VC / 투자자</label>
                  <input
                    type="text"
                    placeholder="예: a16z, Paradigm, Binance Labs"
                    value={newResearch.vcs}
                    onChange={(e) => setNewResearch({ ...newResearch, vcs: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
                  />
                </div>
              </div>

              {/* Airdrop Tasks */}
              <div>
                <label className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase block mb-1.5">에어드랍 작업</label>
                <textarea
                  placeholder="예:&#10;1. 테스트넷 스왑 3회&#10;2. 디스코드 참여&#10;3. 브릿지 사용&#10;4. NFT 민트"
                  value={newResearch.airdrop_tasks_text}
                  onChange={(e) => setNewResearch({ ...newResearch, airdrop_tasks_text: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 h-28 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors resize-y"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase block mb-1.5">리서치 노트</label>
                <textarea
                  placeholder="프로젝트 분석, 투자 근거, 리스크, 경쟁사 비교 등..."
                  value={newResearch.notes}
                  onChange={(e) => setNewResearch({ ...newResearch, notes: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 h-40 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors resize-y"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { setShowAddModal(false); setNewResearch({ coin: '', category: '', tier: '', funding: '', vcs: '', airdrop_tasks_text: '', notes: '', sentiment: 'neutral' }); }}
                className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors"
              >취소</button>
              <button
                onClick={addResearch}
                className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors"
              >추가</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
