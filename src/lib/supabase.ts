import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
