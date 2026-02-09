import crypto from 'crypto';

const UPBIT_API = 'https://api.upbit.com';
const MAX_ORDER_KRW = 100000; // 1회 최대 10만원

interface OrderResult {
  success: boolean;
  uuid?: string;
  side?: string;
  price?: number;
  volume?: number;
  message?: string;
}

// Base64url encode
function base64url(data: string | Buffer): string {
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// JWT 생성 (HS256, Node.js crypto)
function createUpbitJWT(queryParams?: Record<string, string>): string {
  const accessKey = process.env.UPBIT_ACCESS_KEY;
  const secretKey = process.env.UPBIT_SECRET_KEY;

  if (!accessKey || !secretKey) {
    throw new Error('UPBIT_ACCESS_KEY or UPBIT_SECRET_KEY not set');
  }

  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

  const payload: Record<string, string> = {
    access_key: accessKey,
    nonce: crypto.randomUUID(),
  };

  if (queryParams) {
    const queryString = new URLSearchParams(queryParams).toString();
    const queryHash = crypto.createHash('sha512').update(queryString, 'utf-8').digest('hex');
    payload.query_hash = queryHash;
    payload.query_hash_alg = 'SHA512';
  }

  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', secretKey)
    .update(`${header}.${encodedPayload}`)
    .digest();

  return `${header}.${encodedPayload}.${base64url(signature)}`;
}

// 잔고 조회
export async function getBalance(): Promise<{ krw: number; usdt: number }> {
  const token = createUpbitJWT();

  const res = await fetch(`${UPBIT_API}/v1/accounts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upbit accounts error: ${res.status} ${text}`);
  }

  const accounts = await res.json();
  let krw = 0;
  let usdt = 0;

  for (const acc of accounts) {
    if (acc.currency === 'KRW') {
      krw = parseFloat(acc.balance);
    }
    if (acc.currency === 'USDT') {
      usdt = parseFloat(acc.balance);
    }
  }

  return { krw, usdt };
}

// USDT 현재가 조회
export async function getUSDTPrice(): Promise<number> {
  const res = await fetch(`${UPBIT_API}/v1/ticker?markets=KRW-USDT`);
  if (!res.ok) throw new Error('Failed to get USDT price');
  const data = await res.json();
  return data[0]?.trade_price || 0;
}

// USDT 시장가 매수 (KRW 금액 지정)
export async function buyUSDT(krwAmount: number): Promise<OrderResult> {
  if (krwAmount > MAX_ORDER_KRW) {
    return { success: false, message: `최대 ${MAX_ORDER_KRW.toLocaleString()}원까지 가능합니다` };
  }
  if (krwAmount < 5000) {
    return { success: false, message: '최소 5,000원 이상 주문 가능합니다' };
  }

  const params: Record<string, string> = {
    market: 'KRW-USDT',
    side: 'bid',
    price: String(krwAmount),
    ord_type: 'price', // 시장가 매수 (KRW 금액 지정)
  };

  const token = createUpbitJWT(params);

  console.log(`[UPBIT] 매수 주문: KRW-USDT, ${krwAmount.toLocaleString()}원`);

  const res = await fetch(`${UPBIT_API}/v1/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[UPBIT] 매수 실패:`, text);
    return { success: false, message: `주문 실패: ${text}` };
  }

  const order = await res.json();
  console.log(`[UPBIT] 매수 성공:`, order.uuid);

  return {
    success: true,
    uuid: order.uuid,
    side: 'bid',
    price: krwAmount,
    message: `USDT 매수 완료 (${krwAmount.toLocaleString()}원)`,
  };
}

// USDT 시장가 매도 (KRW 금액에 해당하는 USDT 수량 계산 후 매도)
export async function sellUSDT(krwAmount: number): Promise<OrderResult> {
  if (krwAmount > MAX_ORDER_KRW) {
    return { success: false, message: `최대 ${MAX_ORDER_KRW.toLocaleString()}원까지 가능합니다` };
  }
  if (krwAmount < 5000) {
    return { success: false, message: '최소 5,000원 이상 주문 가능합니다' };
  }

  // 현재가로 USDT 수량 계산
  const usdtPrice = await getUSDTPrice();
  if (usdtPrice <= 0) {
    return { success: false, message: 'USDT 가격 조회 실패' };
  }

  const usdtVolume = krwAmount / usdtPrice;
  // 소수점 이하 8자리로 올림/내림 (업비트 기준)
  const roundedVolume = Math.floor(usdtVolume * 100000000) / 100000000;

  if (roundedVolume <= 0) {
    return { success: false, message: '매도 수량이 너무 적습니다' };
  }

  const params: Record<string, string> = {
    market: 'KRW-USDT',
    side: 'ask',
    volume: String(roundedVolume),
    ord_type: 'market', // 시장가 매도 (수량 지정)
  };

  const token = createUpbitJWT(params);

  console.log(`[UPBIT] 매도 주문: KRW-USDT, ${roundedVolume} USDT (~${krwAmount.toLocaleString()}원)`);

  const res = await fetch(`${UPBIT_API}/v1/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[UPBIT] 매도 실패:`, text);
    return { success: false, message: `주문 실패: ${text}` };
  }

  const order = await res.json();
  console.log(`[UPBIT] 매도 성공:`, order.uuid);

  return {
    success: true,
    uuid: order.uuid,
    side: 'ask',
    volume: roundedVolume,
    price: krwAmount,
    message: `USDT ${roundedVolume.toFixed(2)}개 매도 완료 (~${krwAmount.toLocaleString()}원)`,
  };
}
