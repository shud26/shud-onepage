'use client';
import { useState } from "react";
import { BASE_ITEMS, ITEM_COMBOS } from "@/lib/tft-data";

export default function ItemsPage() {
  const [slotA, setSlotA] = useState<string|null>(null);
  const [slotB, setSlotB] = useState<string|null>(null);

  const handleSelect = (id: string) => {
    if (!slotA) { setSlotA(id); return; }
    if (!slotB) { setSlotB(id); return; }
    // 둘 다 있으면 A를 B로 밀고 새 것을 A에 넣기
    setSlotA(slotB);
    setSlotB(id);
  };

  const comboKey = slotA && slotB
    ? [slotA, slotB].sort().join('+')
    : null;
  const result = comboKey ? ITEM_COMBOS[comboKey] : null;

  const itemA = slotA ? BASE_ITEMS.find(i => i.id === slotA) : null;
  const itemB = slotB ? BASE_ITEMS.find(i => i.id === slotB) : null;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:28, fontWeight:700, color:'var(--gold-2)', marginBottom:8 }}>
          아이템 조합기
        </h1>
        <p style={{ color:'var(--muted)', fontFamily:'Rajdhani,sans-serif', fontSize:15, marginBottom:36 }}>
          Season 17 Arcane Depths — 기본 아이템 2개를 조합하면 완성 아이템이 만들어집니다
        </p>

        {/* 조합기 UI */}
        <div style={{
          background:'var(--navy-2)', border:'1px solid var(--border)',
          borderRadius:8, padding:'28px', marginBottom:36,
          display:'flex', flexDirection:'column', alignItems:'center', gap:20,
        }}>
          {/* 슬롯 */}
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            {/* 슬롯 A */}
            <div style={{
              width:80, height:80, borderRadius:6,
              background: itemA ? `${itemA.color}20` : 'var(--navy-4)',
              border: `2px dashed ${itemA ? itemA.color : 'var(--border)'}`,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:4, cursor: itemA ? 'pointer' : 'default',
              transition:'all 0.15s',
            }} onClick={() => setSlotA(null)}>
              {itemA ? (
                <>
                  <span style={{ fontFamily:'Cinzel,serif', fontSize:20, fontWeight:700, color:itemA.color }}>{itemA.abbr}</span>
                  <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:9, color:itemA.color, textAlign:'center', lineHeight:1.2 }}>{itemA.name}</span>
                </>
              ) : (
                <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'var(--muted)', textAlign:'center' }}>슬롯 1</span>
              )}
            </div>

            {/* + */}
            <span style={{ fontFamily:'Cinzel,serif', fontSize:24, fontWeight:700, color:'var(--muted)' }}>+</span>

            {/* 슬롯 B */}
            <div style={{
              width:80, height:80, borderRadius:6,
              background: itemB ? `${itemB.color}20` : 'var(--navy-4)',
              border: `2px dashed ${itemB ? itemB.color : 'var(--border)'}`,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:4, cursor: itemB ? 'pointer' : 'default',
              transition:'all 0.15s',
            }} onClick={() => setSlotB(null)}>
              {itemB ? (
                <>
                  <span style={{ fontFamily:'Cinzel,serif', fontSize:20, fontWeight:700, color:itemB.color }}>{itemB.abbr}</span>
                  <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:9, color:itemB.color, textAlign:'center', lineHeight:1.2 }}>{itemB.name}</span>
                </>
              ) : (
                <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'var(--muted)', textAlign:'center' }}>슬롯 2</span>
              )}
            </div>

            {/* = */}
            <span style={{ fontFamily:'Cinzel,serif', fontSize:24, fontWeight:700, color:'var(--muted)' }}>=</span>

            {/* 결과 */}
            <div style={{
              width:120, minHeight:80, borderRadius:6,
              background: result ? 'var(--gold-3)' : 'var(--navy-4)',
              border: `2px solid ${result ? 'var(--gold)' : 'var(--border)'}`,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:4, padding:8,
              boxShadow: result ? '0 0 16px rgba(200,155,60,0.2)' : 'none',
              transition:'all 0.2s',
            }}>
              {result ? (
                <>
                  <span style={{ fontFamily:'Cinzel,serif', fontSize:13, fontWeight:700, color:'var(--gold)', textAlign:'center', lineHeight:1.3 }}>{result.name}</span>
                  <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--text)', textAlign:'center', lineHeight:1.4 }}>{result.effect}</span>
                  <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:9, color:'var(--muted)', textAlign:'center' }}>추천: {result.champ}</span>
                </>
              ) : (
                <span style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'var(--muted)', textAlign:'center', lineHeight:1.5 }}>
                  {slotA && slotB ? '조합 없음' : '아이템을\n선택하세요'}
                </span>
              )}
            </div>
          </div>

          {(slotA || slotB) && (
            <button onClick={() => { setSlotA(null); setSlotB(null); }} style={{
              background:'none', border:'1px solid var(--border)', borderRadius:3,
              color:'var(--muted)', cursor:'pointer', padding:'4px 14px',
              fontFamily:'Rajdhani,sans-serif', fontSize:12,
            }}>초기화</button>
          )}
        </div>

        {/* 기본 아이템 선택 */}
        <div style={{ marginBottom:36 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <span className="section-label">기본 아이템</span>
            <div className="gold-divider" style={{ flex:1, margin:0 }}/>
          </div>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))',
            gap:8,
          }}>
            {BASE_ITEMS.map(item => {
              const isSelected = slotA === item.id || slotB === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  style={{
                    background: isSelected ? `${item.color}25` : 'var(--navy-2)',
                    border: `1px solid ${isSelected ? item.color : 'var(--border)'}`,
                    borderTop:`2px solid ${item.color}`,
                    borderRadius:6, padding:'12px 8px',
                    cursor:'pointer', textAlign:'center',
                    transition:'all 0.15s',
                    transform: isSelected ? 'scale(1.03)' : 'none',
                  }}
                >
                  <div style={{
                    fontFamily:'Cinzel,serif', fontSize:18, fontWeight:700,
                    color:item.color, marginBottom:6,
                  }}>{item.abbr}</div>
                  <div style={{
                    fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:600,
                    color: isSelected ? item.color : 'var(--muted)',
                    lineHeight:1.3,
                  }}>{item.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 전체 조합표 */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <span className="section-label">전체 조합표</span>
            <div className="gold-divider" style={{ flex:1, margin:0 }}/>
          </div>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))',
            gap:8,
          }}>
            {Object.entries(ITEM_COMBOS).map(([key, combo]) => {
              const [idA, idB] = key.split('+');
              const iA = BASE_ITEMS.find(i => i.id === idA);
              const iB = BASE_ITEMS.find(i => i.id === idB);
              const isActive = comboKey === key;
              return (
                <button
                  key={key}
                  onClick={() => { setSlotA(idA); setSlotB(idB); }}
                  style={{
                    background: isActive ? 'var(--gold-3)' : 'var(--navy-2)',
                    border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius:4, padding:'12px 14px',
                    cursor:'pointer', textAlign:'left',
                    transition:'all 0.15s',
                    boxShadow: isActive ? '0 0 12px rgba(200,155,60,0.15)' : 'none',
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    {iA && <span style={{ fontFamily:'Cinzel,serif', fontSize:11, fontWeight:700, color:iA.color, background:`${iA.color}20`, padding:'1px 6px', borderRadius:2 }}>{iA.abbr}</span>}
                    <span style={{ color:'var(--muted)', fontSize:11 }}>+</span>
                    {iB && <span style={{ fontFamily:'Cinzel,serif', fontSize:11, fontWeight:700, color:iB.color, background:`${iB.color}20`, padding:'1px 6px', borderRadius:2 }}>{iB.abbr}</span>}
                    <span style={{ color:'var(--muted)', fontSize:11 }}>=</span>
                    <span style={{ fontFamily:'Cinzel,serif', fontSize:12, fontWeight:700, color:'var(--gold)', flex:1 }}>{combo.name}</span>
                  </div>
                  <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'var(--muted)', marginBottom:2 }}>{combo.effect}</div>
                  <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:10, color:'var(--muted)', opacity:0.7 }}>추천: {combo.champ}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
