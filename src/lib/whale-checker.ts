import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from './telegram';

const supabaseUrl = 'https://ofpbscpcryquxrtojpei.supabase.co';

// Notion API 설정 (환경변수에서 가져옴)
const NOTION_API_KEY = process.env.NOTION_API_KEY || '';
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || '';

// 노션에 Whale Alert 기록
async function recordToNotion(
  walletName: string,
  direction: 'in' | 'out',
  amount: number,
  tokenSymbol: string,
  usdValue: number,
  txHash: string
): Promise<boolean> {
  // 환경변수 없으면 스킵
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return false;
  }

  try {
    const dirEmoji = direction === 'out' ? '📤 OUT' : '📥 IN';
    const title = `${walletName} ${amount.toFixed(2)} ${tokenSymbol} ${dirEmoji}`;
    const etherscanUrl = `https://etherscan.io/tx/${txHash}`;

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          '순서 ': {
            title: [{ text: { content: title } }]
          },
          '지갑': {
            rich_text: [{ text: { content: walletName } }]
          },
          '방향': {
            select: { name: dirEmoji }
          },
          '금액': {
            number: amount
          },
          '토큰': {
            select: { name: tokenSymbol }
          },
          'USD': {
            number: Math.round(usdValue)
          },
          'TX': {
            url: etherscanUrl
          }
        }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Notion recording failed:', error);
    return false;
  }
}
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcGJzY3BjcnlxdXhydG9qcGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTY2MTMsImV4cCI6MjA4NDc5MjYxM30.xqmqiAXsxU9rCk6j9tV_0c3UjrX-t5ee5xsLUccpmE4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Thresholds
const ETH_THRESHOLD = 5; // 5+ ETH
const USD_THRESHOLD = 50000; // $50,000+ for tokens

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface EthTx {
  timestamp: number;
  from: string;
  to: string;
  hash: string;
  value: number;
  success: boolean;
}

interface TokenOp {
  timestamp: number;
  from: string;
  to: string;
  transactionHash: string;
  value: string;
  tokenInfo: {
    symbol: string;
    decimals: string;
    price?: { rate: number };
  };
}

interface AlertResult {
  walletsChecked: number;
  alertsSent: number;
  errors: string[];
}

export async function checkWhaleMovements(): Promise<AlertResult> {
  const result: AlertResult = { walletsChecked: 0, alertsSent: 0, errors: [] };

  // 1. Fetch all whale wallets
  const { data: wallets, error: walletsError } = await supabase
    .from('whale_wallets')
    .select('*')
    .order('created_at', { ascending: true });

  if (walletsError || !wallets) {
    result.errors.push(`Failed to fetch wallets: ${walletsError?.message}`);
    return result;
  }

  // Get ETH price for USD calculation
  let ethPrice = 0;
  try {
    const priceRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    const priceData = await priceRes.json();
    ethPrice = priceData.ethereum?.usd || 0;
  } catch {
    result.errors.push('Failed to fetch ETH price');
  }

  // 2. Check each wallet
  for (const wallet of wallets) {
    result.walletsChecked++;
    const addr = wallet.address.toLowerCase();

    try {
      // Fetch ETH transactions
      const ethRes = await fetch(
        `https://api.ethplorer.io/getAddressTransactions/${wallet.address}?apiKey=freekey&limit=10`
      );
      const ethTxs: EthTx[] = await ethRes.json();

      await delay(1200); // Rate limit

      // Fetch token transfers
      const histRes = await fetch(
        `https://api.ethplorer.io/getAddressHistory/${wallet.address}?apiKey=freekey&limit=10&type=transfer`
      );
      const histData = await histRes.json();
      const tokenOps: TokenOp[] = histData?.operations || [];

      await delay(1200); // Rate limit

      // 3. Check ETH transactions for large movements
      if (Array.isArray(ethTxs)) {
        for (const tx of ethTxs) {
          if (tx.success === false) continue;
          const value = typeof tx.value === 'number' ? tx.value : parseFloat(String(tx.value || '0'));
          if (value < ETH_THRESHOLD) continue;

          const isOut = (tx.from || '').toLowerCase() === addr;
          const direction = isOut ? 'out' : 'in';
          const usdValue = value * ethPrice;

          // Check duplicate
          const { data: existing } = await supabase
            .from('whale_alerts')
            .select('id')
            .eq('tx_hash', tx.hash)
            .limit(1);

          if (existing && existing.length > 0) continue;

          // Send alert
          const dirEmoji = isOut ? '📤' : '📥';
          const counterparty = isOut ? (tx.to || '').slice(0, 10) : (tx.from || '').slice(0, 10);
          const time = new Date(tx.timestamp * 1000).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

          const message =
            `🐋 <b>Whale Alert</b>\n\n` +
            `${dirEmoji} <b>${wallet.name}</b> → ${value.toFixed(2)} ETH ($${usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })})\n` +
            `${isOut ? 'To' : 'From'}: <code>${counterparty}...</code>\n\n` +
            `🔗 <a href="https://etherscan.io/tx/${tx.hash}">Etherscan</a> | ${time}`;

          const sent = await sendTelegramMessage(message);
          if (sent) result.alertsSent++;

          // Record in DB
          await supabase.from('whale_alerts').insert({
            wallet_address: wallet.address,
            tx_hash: tx.hash,
            alert_type: 'eth_transfer',
            direction,
            value,
            token_symbol: 'ETH',
            usd_value: usdValue,
          });

          // Record to Notion
          await recordToNotion(wallet.name, direction, value, 'ETH', usdValue, tx.hash);
        }
      }

      // 4. Check token transfers for large movements
      for (const op of tokenOps) {
        const symbol = op.tokenInfo?.symbol || '???';
        const decimals = parseInt(op.tokenInfo?.decimals || '18');
        const rawValue = parseFloat(op.value || '0') / Math.pow(10, decimals);
        const tokenPriceUsd = op.tokenInfo?.price?.rate || 0;
        const usdValue = rawValue * tokenPriceUsd;

        if (usdValue < USD_THRESHOLD) continue;

        const isOut = (op.from || '').toLowerCase() === addr;
        const direction = isOut ? 'out' : 'in';
        const txHash = op.transactionHash;

        // Check duplicate
        const { data: existing } = await supabase
          .from('whale_alerts')
          .select('id')
          .eq('tx_hash', txHash)
          .limit(1);

        if (existing && existing.length > 0) continue;

        // Send alert
        const dirEmoji = isOut ? '📤' : '📥';
        const counterparty = isOut ? (op.to || '').slice(0, 10) : (op.from || '').slice(0, 10);
        const time = new Date(op.timestamp * 1000).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

        const fmtVal = rawValue > 1_000_000
          ? `${(rawValue / 1_000_000).toFixed(2)}M`
          : rawValue > 1_000
          ? `${(rawValue / 1_000).toFixed(1)}K`
          : rawValue.toFixed(2);

        const message =
          `🐋 <b>Whale Alert</b>\n\n` +
          `${dirEmoji} <b>${wallet.name}</b> → ${fmtVal} ${symbol} ($${usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })})\n` +
          `${isOut ? 'To' : 'From'}: <code>${counterparty}...</code>\n\n` +
          `🔗 <a href="https://etherscan.io/tx/${txHash}">Etherscan</a> | ${time}`;

        const sent = await sendTelegramMessage(message);
        if (sent) result.alertsSent++;

        // Record in DB
        await supabase.from('whale_alerts').insert({
          wallet_address: wallet.address,
          tx_hash: txHash,
          alert_type: 'token_transfer',
          direction,
          value: rawValue,
          token_symbol: symbol,
          usd_value: usdValue,
        });

        // Record to Notion
        await recordToNotion(wallet.name, direction, rawValue, symbol, usdValue, txHash);
      }
    } catch (error) {
      result.errors.push(`${wallet.name}: ${String(error)}`);
    }
  }

  return result;
}
