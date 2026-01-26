import { NextRequest, NextResponse } from 'next/server';
import { checkWhaleMovements } from '@/lib/whale-checker';

// GET: Cron trigger (Vercel Cron)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await checkWhaleMovements();
  return NextResponse.json(result);
}

// POST: Manual trigger from UI (PIN auth)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.pin !== '1507') {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    const result = await checkWhaleMovements();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
