import crypto from 'crypto';

const BINANCE_API = 'https://api.binance.com';
const MAX_WITHDRAW_USDT = 100; // 1회 최대 100 USDT 출금 제한

interface WithdrawResult {
  success: boolean;
  id?: string;
  message: string;
}

// HMAC-SHA256 서명 생성
function signQuery(queryString: string): string {
  const secretKey = process.env.BINANCE_SECRET_KEY;
  if (!secretKey) throw new Error('BINANCE_SECRET_KEY not set');
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

// 공통 파라미터에 timestamp + signature 추가
function buildSignedParams(params: Record<string, string> = {}): string {
  const apiKey = process.env.BINANCE_API_KEY;
  if (!apiKey) throw new Error('BINANCE_API_KEY not set');

  params.timestamp = Date.now().toString();
  params.recvWindow = '5000';

  const queryString = new URLSearchParams(params).toString();
  const signature = signQuery(queryString);

  return `${queryString}&signature=${signature}`;
}

// USDT 잔고 조회
export async function getBinanceBalance(): Promise<{ usdt: number }> {
  const apiKey = process.env.BINANCE_API_KEY;
  if (!apiKey) throw new Error('BINANCE_API_KEY not set');

  const signedQuery = buildSignedParams();

  const res = await fetch(`${BINANCE_API}/api/v3/account?${signedQuery}`, {
    headers: { 'X-MBX-APIKEY': apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Binance account error: ${res.status} ${text}`);
  }

  const data = await res.json();
  let usdt = 0;

  for (const bal of data.balances || []) {
    if (bal.asset === 'USDT') {
      usdt = parseFloat(bal.free);
      break;
    }
  }

  return { usdt };
}

// USDT 출금 (업비트로 전송)
export async function withdrawUSDT(
  address: string,
  amount: number,
  network: string = 'TRX'
): Promise<WithdrawResult> {
  if (amount > MAX_WITHDRAW_USDT) {
    return { success: false, message: `최대 ${MAX_WITHDRAW_USDT} USDT까지 출금 가능합니다` };
  }
  if (amount <= 0) {
    return { success: false, message: '출금 금액은 0보다 커야 합니다' };
  }

  const apiKey = process.env.BINANCE_API_KEY;
  if (!apiKey) throw new Error('BINANCE_API_KEY not set');

  const params: Record<string, string> = {
    coin: 'USDT',
    address,
    amount: amount.toString(),
    network,
  };

  const signedQuery = buildSignedParams(params);

  console.log(`[BINANCE] 출금 요청: ${amount} USDT → ${address} (${network})`);

  const res = await fetch(`${BINANCE_API}/sapi/v1/capital/withdraw/apply?${signedQuery}`, {
    method: 'POST',
    headers: { 'X-MBX-APIKEY': apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[BINANCE] 출금 실패:`, text);
    return { success: false, message: `출금 실패: ${text}` };
  }

  const result = await res.json();
  console.log(`[BINANCE] 출금 성공:`, result.id);

  return {
    success: true,
    id: result.id,
    message: `${amount} USDT 출금 요청 완료 (${network})`,
  };
}

// 입금 주소 조회
export async function getDepositAddress(network: string = 'TRX'): Promise<string> {
  const apiKey = process.env.BINANCE_API_KEY;
  if (!apiKey) throw new Error('BINANCE_API_KEY not set');

  const params: Record<string, string> = {
    coin: 'USDT',
    network,
  };

  const signedQuery = buildSignedParams(params);

  const res = await fetch(`${BINANCE_API}/sapi/v1/capital/deposit/address?${signedQuery}`, {
    headers: { 'X-MBX-APIKEY': apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Binance deposit address error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.address || '';
}
