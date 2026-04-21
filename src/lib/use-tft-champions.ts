'use client';
import { useState, useEffect } from 'react';
import type { ApiChampion, ApiTrait } from './tft-api';

// 모듈 레벨 캐시 — 여러 컴포넌트가 공유
let _cache: { champions: ApiChampion[]; traits: ApiTrait[] } | null = null;
let _promise: Promise<void> | null = null;
const _listeners: Array<() => void> = [];

function notify() { _listeners.forEach(fn => fn()); }

function loadData() {
  if (_cache || _promise) return;
  _promise = fetch('/api/tft-champions')
    .then(r => r.json())
    .then(data => { _cache = data; notify(); })
    .catch(() => { _promise = null; });
}

export function useTFTChampions() {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (_cache) return;
    const refresh = () => setTick(t => t + 1);
    _listeners.push(refresh);
    loadData();
    return () => { const i = _listeners.indexOf(refresh); if (i >= 0) _listeners.splice(i, 1); };
  }, []);

  return _cache;
}

// apiName → 챔피언 정보 매핑 헬퍼
export function getChampByApi(
  champions: ApiChampion[],
  apiName: string,
): ApiChampion | undefined {
  return champions.find(c => c.id === apiName);
}
