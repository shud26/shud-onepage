import { createClient } from '@supabase/supabase-js';

// Hardcoded for now (anon key is safe to expose)
const supabaseUrl = 'https://ofpbscpcryquxrtojpei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcGJzY3BjcnlxdXhydG9qcGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTY2MTMsImV4cCI6MjA4NDc5MjYxM30.xqmqiAXsxU9rCk6j9tV_0c3UjrX-t5ee5xsLUccpmE4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Airdrop {
  id: string;
  name: string;
  chain: string;
  deadline: string;
  expected_value: string;
  status: string;
  total_cost: number;
  created_at: string;
}

export interface AirdropTask {
  id: string;
  airdrop_id: string;
  name: string;
  done: boolean;
  cost: number;
  created_at: string;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  date: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  memo: string;
  created_at: string;
}

export interface Research {
  id: string;
  coin: string;
  notes: string;
  sentiment: string;
  date: string;
  created_at: string;
}

export interface WhaleWallet {
  id: string;
  name: string;
  address: string;
  chain: string;
  notes: string;
  created_at: string;
}

export interface WhaleAlert {
  id: string;
  wallet_address: string;
  tx_hash: string;
  alert_type: string;
  direction: string;
  value: number;
  token_symbol: string;
  usd_value: number | null;
  sent_at: string;
}
