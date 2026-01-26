'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase, Research } from '@/lib/supabase';

const ADMIN_PIN = '1507';

export default function ResearchPage() {
  const [research, setResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Filters
  const [filter, setFilter] = useState<'all' | 'bullish' | 'neutral' | 'bearish'>('all');
  const [search, setSearch] = useState('');

  // Selected item for detail view
  const [selected, setSelected] = useState<Research | null>(null);

  // Add form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResearch, setNewResearch] = useState({ coin: '', notes: '', sentiment: 'neutral' });

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
    setShowAddModal(false);
  };

  const deleteResearch = async (id: string) => {
    await supabase.from('research').delete().eq('id', id);
    setResearch(research.filter(r => r.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  // Filtered results
  const filtered = research.filter(item => {
    if (filter !== 'all' && item.sentiment !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.coin.toLowerCase().includes(q) || item.notes.toLowerCase().includes(q);
    }
    return true;
  });

  const sentimentCounts = {
    all: research.length,
    bullish: research.filter(r => r.sentiment === 'bullish').length,
    neutral: research.filter(r => r.sentiment === 'neutral').length,
    bearish: research.filter(r => r.sentiment === 'bearish').length,
  };

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

          {/* Title */}
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl md:text-5xl font-bold font-mono-data tracking-tight">{selected.coin}</h1>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              selected.sentiment === 'bullish' ? 'bg-[#22c55e]/10 text-[#22c55e]' :
              selected.sentiment === 'bearish' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
              'bg-[#FF5C00]/10 text-[#FF5C00]'
            }`}>
              {selected.sentiment === 'bullish' ? 'Bullish' :
               selected.sentiment === 'bearish' ? 'Bearish' : 'Neutral'}
            </span>
          </div>

          {/* Content */}
          <article className="text-[#e5e5e5] text-base md:text-lg leading-relaxed break-words" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {selected.notes || '내용이 없습니다.'}
          </article>

          {/* Bottom nav */}
          <div className="mt-16 pt-6 border-t border-[#1F1F23] flex items-center justify-between">
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
            <p className="text-[#6B6B70] text-sm mt-3">코인별 분석 노트 &middot; 투자 아이디어 &middot; 시장 인사이트</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
              <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">총 리서치</p>
              <p className="text-2xl font-medium text-white mt-2 font-mono-data">{research.length}</p>
            </div>
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
              <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">Bullish</p>
              <p className="text-2xl font-medium text-[#22c55e] mt-2 font-mono-data">{sentimentCounts.bullish}</p>
            </div>
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
              <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">Neutral</p>
              <p className="text-2xl font-medium text-[#FF5C00] mt-2 font-mono-data">{sentimentCounts.neutral}</p>
            </div>
            <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-4">
              <p className="text-[11px] text-[#6B6B70] font-semibold tracking-wider uppercase">Bearish</p>
              <p className="text-2xl font-medium text-[#ef4444] mt-2 font-mono-data">{sentimentCounts.bearish}</p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="코인 또는 키워드 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-[#111113] border border-[#1F1F23] rounded-lg px-4 py-3 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
            <div className="flex gap-2">
              {(['all', 'bullish', 'neutral', 'bearish'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === f
                      ? f === 'bullish' ? 'bg-[#22c55e]/20 text-[#22c55e]'
                        : f === 'bearish' ? 'bg-[#ef4444]/20 text-[#ef4444]'
                        : f === 'neutral' ? 'bg-[#FF5C00]/20 text-[#FF5C00]'
                        : 'bg-[#1F1F23] text-white'
                      : 'border border-[#1F1F23] text-[#6B6B70] hover:text-white hover:border-[#2A2A2E]'
                  }`}
                >
                  {f === 'all' ? `전체 (${sentimentCounts.all})` :
                   f === 'bullish' ? `Bullish (${sentimentCounts.bullish})` :
                   f === 'neutral' ? `Neutral (${sentimentCounts.neutral})` :
                   `Bearish (${sentimentCounts.bearish})`}
                </button>
              ))}
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

                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl font-bold font-mono-data tracking-tight text-white">{item.coin}</span>
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                      item.sentiment === 'bullish' ? 'bg-[#22c55e]/10 text-[#22c55e]' :
                      item.sentiment === 'bearish' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                      'bg-[#FF5C00]/10 text-[#FF5C00]'
                    }`}>
                      {item.sentiment === 'bullish' ? 'Bullish' :
                       item.sentiment === 'bearish' ? 'Bearish' : 'Neutral'}
                    </span>
                    <span className="text-[11px] text-[#6B6B70] font-mono-data ml-auto">{item.date}</span>
                  </div>

                  <p className="text-[14px] text-[#ADADB0] leading-relaxed line-clamp-3">{item.notes}</p>

                  {item.notes && item.notes.length > 150 && (
                    <p className="text-[12px] text-[#FF5C00] mt-3 font-medium group-hover:underline">전체 읽기 &#8594;</p>
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
          <span>코인 리서치 &middot; 투자 분석 노트</span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111113] border border-[#1F1F23] rounded-xl p-6 w-[500px] max-w-[95vw]">
            <h3 className="text-sm font-semibold mb-4 tracking-wide">새 리서치 추가</h3>
            <input
              type="text"
              placeholder="코인 (예: ETH, BTC, SOL)"
              value={newResearch.coin}
              onChange={(e) => setNewResearch({ ...newResearch, coin: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors"
              autoFocus
            />
            <textarea
              placeholder="분석 내용, 투자 근거, 목표가, 리스크 등..."
              value={newResearch.notes}
              onChange={(e) => setNewResearch({ ...newResearch, notes: e.target.value })}
              className="w-full bg-[#0A0A0B] border border-[#1F1F23] rounded-lg px-4 py-2.5 mb-3 h-48 text-[13px] placeholder:text-[#4A4A4E] focus:outline-none focus:border-[#FF5C00] transition-colors resize-y"
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
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-[#1A1A1D] rounded-lg hover:bg-[#2A2A2E] text-[13px] font-medium text-[#ADADB0] transition-colors">취소</button>
              <button onClick={addResearch} className="flex-1 py-2.5 bg-[#FF5C00] rounded-lg hover:bg-[#FF8A4C] text-[13px] font-medium transition-colors">추가</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
