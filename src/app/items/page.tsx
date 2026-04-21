'use client';
import { useState, useEffect } from "react";
import Image from "next/image";

interface BaseItem { id: string; name: string; imageUrl: string; }
interface ComboItem { id: string; name: string; composition: string[]; imageUrl: string; }

// 기본 아이템별 색상 (순서 고정)
const BASE_COLORS: Record<string, string> = {
  TFT_Item_BFSword:             '#E85454',
  TFT_Item_RecurveBow:          '#22a050',
  TFT_Item_ChainVest:           '#909090',
  TFT_Item_NeedlesslyLargeRod:  '#60A8F0',
  TFT_Item_TearOfTheGoddess:    '#4A9EE8',
  TFT_Item_GiantsBelt:          '#E8A454',
  TFT_Item_Spatula:             '#C89B3C',
  TFT_Item_SparringGloves:      '#C060F0',
  TFT_Item_NegatronCloak:       '#8B5CF6',
};

function ItemIcon({ item, size = 56, selected = false, onClick }: {
  item: BaseItem; size?: number; selected?: boolean; onClick?: () => void;
}) {
  const color = BASE_COLORS[item.id] || '#aaa';
  return (
    <button
      onClick={onClick}
      title={item.name}
      style={{
        width: size, height: size, borderRadius: 6, overflow: 'hidden',
        border: `2px solid ${selected ? color : 'var(--border)'}`,
        background: selected ? `${color}25` : 'var(--navy-3)',
        cursor: onClick ? 'pointer' : 'default',
        padding: 0, flexShrink: 0,
        transform: selected ? 'scale(1.08)' : 'none',
        transition: 'all 0.15s',
        boxShadow: selected ? `0 0 10px ${color}55` : 'none',
      }}
    >
      {item.imageUrl ? (
        <Image src={item.imageUrl} alt={item.name} width={size} height={size}
          style={{ objectFit: 'cover', display: 'block' }} unoptimized />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Cinzel,serif', fontSize: 12, fontWeight: 700, color }} />
      )}
    </button>
  );
}

export default function ItemsPage() {
  const [baseItems, setBaseItems] = useState<BaseItem[]>([]);
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotA, setSlotA] = useState<string | null>(null);
  const [slotB, setSlotB] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tft-items')
      .then(r => r.json())
      .then(({ baseItems, comboItems }) => {
        setBaseItems(baseItems);
        setComboItems(comboItems);
        setLoading(false);
      });
  }, []);

  const handleSelect = (id: string) => {
    if (!slotA) { setSlotA(id); return; }
    if (!slotB) { setSlotB(id); return; }
    setSlotA(slotB); setSlotB(id);
  };

  const comboKey = slotA && slotB ? [slotA, slotB].sort().join('+') : null;
  const result = comboKey
    ? comboItems.find(c => [...c.composition].sort().join('+') === comboKey)
    : null;
  const itemA = slotA ? baseItems.find(i => i.id === slotA) : null;
  const itemB = slotB ? baseItems.find(i => i.id === slotB) : null;

  const colorA = itemA ? BASE_COLORS[itemA.id] || '#aaa' : 'var(--border)';
  const colorB = itemB ? BASE_COLORS[itemB.id] || '#aaa' : 'var(--border)';

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, fontWeight:700, color:'var(--gold-2)', marginBottom:8 }}>
          아이템 조합기
        </h1>
        <p style={{ color:'var(--muted)', fontFamily:"'Noto Sans KR',sans-serif", fontSize:15, marginBottom:36 }}>
          Season 17 Arcane Depths — 기본 아이템 2개를 클릭해서 조합 아이템을 확인하세요
        </p>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)', fontFamily:"'Noto Sans KR',sans-serif" }}>
            아이템 데이터 로딩 중...
          </div>
        ) : (
          <>
            {/* 조합기 */}
            <div style={{
              background:'var(--navy-2)', border:'1px solid var(--border)',
              borderRadius:8, padding:'28px 24px', marginBottom:36,
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
                {/* 슬롯 A */}
                <div style={{
                  width:88, height:88, borderRadius:8,
                  background: itemA ? `${colorA}18` : 'var(--navy-4)',
                  border: `2px dashed ${itemA ? colorA : 'var(--border)'}`,
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  gap:4, cursor: itemA ? 'pointer' : 'default', overflow:'hidden',
                  transition:'all 0.15s',
                }} onClick={() => setSlotA(null)}>
                  {itemA ? (
                    <Image src={itemA.imageUrl} alt={itemA.name} width={88} height={88}
                      style={{ objectFit:'cover', display:'block' }} unoptimized />
                  ) : (
                    <span style={{ fontFamily:"'Noto Sans KR',sans-serif", fontSize:11, color:'var(--muted)', textAlign:'center' }}>슬롯 1</span>
                  )}
                </div>

                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, fontWeight:700, color:'var(--muted)' }}>+</span>

                {/* 슬롯 B */}
                <div style={{
                  width:88, height:88, borderRadius:8,
                  background: itemB ? `${colorB}18` : 'var(--navy-4)',
                  border: `2px dashed ${itemB ? colorB : 'var(--border)'}`,
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  gap:4, cursor: itemB ? 'pointer' : 'default', overflow:'hidden',
                  transition:'all 0.15s',
                }} onClick={() => setSlotB(null)}>
                  {itemB ? (
                    <Image src={itemB.imageUrl} alt={itemB.name} width={88} height={88}
                      style={{ objectFit:'cover', display:'block' }} unoptimized />
                  ) : (
                    <span style={{ fontFamily:"'Noto Sans KR',sans-serif", fontSize:11, color:'var(--muted)', textAlign:'center' }}>슬롯 2</span>
                  )}
                </div>

                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, fontWeight:700, color:'var(--muted)' }}>=</span>

                {/* 결과 */}
                <div style={{
                  width:140, minHeight:88, borderRadius:8,
                  background: result ? 'var(--gold-3)' : 'var(--navy-4)',
                  border: `2px solid ${result ? 'var(--gold)' : 'var(--border)'}`,
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  gap:6, padding:8, overflow:'hidden',
                  boxShadow: result ? '0 0 20px rgba(200,155,60,0.25)' : 'none',
                  transition:'all 0.2s',
                }}>
                  {result ? (
                    <>
                      <Image src={result.imageUrl} alt={result.name} width={56} height={56}
                        style={{ objectFit:'cover', borderRadius:4 }} unoptimized />
                      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:12, fontWeight:700, color:'var(--gold)', textAlign:'center', lineHeight:1.3 }}>
                        {result.name}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontFamily:"'Noto Sans KR',sans-serif", fontSize:11, color:'var(--muted)', textAlign:'center', lineHeight:1.6 }}>
                      {slotA && slotB ? '조합 없음' : '아이템을 선택하세요'}
                    </span>
                  )}
                </div>
              </div>

              {(slotA || slotB) && (
                <div style={{ textAlign:'center', marginTop:16 }}>
                  <button onClick={() => { setSlotA(null); setSlotB(null); }} style={{
                    background:'none', border:'1px solid var(--border)', borderRadius:3,
                    color:'var(--muted)', cursor:'pointer', padding:'4px 14px',
                    fontFamily:"'Noto Sans KR',sans-serif", fontSize:12,
                  }}>초기화</button>
                </div>
              )}
            </div>

            {/* 기본 아이템 */}
            <div style={{ marginBottom:36 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <span className="section-label">기본 아이템</span>
                <div className="gold-divider" style={{ flex:1, margin:0 }}/>
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {baseItems.map(item => (
                  <div key={item.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                    <ItemIcon item={item} size={60}
                      selected={slotA === item.id || slotB === item.id}
                      onClick={() => handleSelect(item.id)} />
                    <span style={{
                      fontFamily:"'Noto Sans KR',sans-serif", fontSize:10, fontWeight:600,
                      color: (slotA === item.id || slotB === item.id) ? BASE_COLORS[item.id] : 'var(--muted)',
                      textAlign:'center', maxWidth:64, lineHeight:1.2,
                    }}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 전체 조합표 */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <span className="section-label">전체 조합표 ({comboItems.length}개)</span>
                <div className="gold-divider" style={{ flex:1, margin:0 }}/>
              </div>
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',
                gap:8,
              }}>
                {comboItems.map(combo => {
                  const cA = baseItems.find(i => i.id === combo.composition[0]);
                  const cB = baseItems.find(i => i.id === combo.composition[1]);
                  const isActive = comboKey === [...combo.composition].sort().join('+');
                  return (
                    <button
                      key={combo.id}
                      onClick={() => { setSlotA(combo.composition[0]); setSlotB(combo.composition[1]); }}
                      style={{
                        display:'flex', alignItems:'center', gap:10,
                        background: isActive ? 'var(--gold-3)' : 'var(--navy-2)',
                        border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
                        borderRadius:6, padding:'10px 12px',
                        cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                        boxShadow: isActive ? '0 0 12px rgba(200,155,60,0.15)' : 'none',
                      }}
                    >
                      {/* 조합 재료 */}
                      <div style={{ display:'flex', alignItems:'center', gap:3, flexShrink:0 }}>
                        {cA && (
                          <div style={{ width:28, height:28, borderRadius:3, overflow:'hidden', border:`1px solid ${BASE_COLORS[cA.id]}44` }}>
                            <Image src={cA.imageUrl} alt={cA.name} width={28} height={28} style={{ objectFit:'cover', display:'block' }} unoptimized />
                          </div>
                        )}
                        <span style={{ color:'var(--muted)', fontSize:10 }}>+</span>
                        {cB && (
                          <div style={{ width:28, height:28, borderRadius:3, overflow:'hidden', border:`1px solid ${BASE_COLORS[cB.id]}44` }}>
                            <Image src={cB.imageUrl} alt={cB.name} width={28} height={28} style={{ objectFit:'cover', display:'block' }} unoptimized />
                          </div>
                        )}
                      </div>
                      {/* 결과 아이템 */}
                      <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:0 }}>
                        {combo.imageUrl && (
                          <div style={{ width:32, height:32, borderRadius:3, overflow:'hidden', flexShrink:0 }}>
                            <Image src={combo.imageUrl} alt={combo.name} width={32} height={32} style={{ objectFit:'cover', display:'block' }} unoptimized />
                          </div>
                        )}
                        <span style={{
                          fontFamily:"'Bebas Neue',sans-serif", fontSize:12, fontWeight:700,
                          color: isActive ? 'var(--gold)' : 'var(--gold-2)',
                          lineHeight:1.3,
                        }}>{combo.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
