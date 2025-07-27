import { NextRequest, NextResponse } from 'next/server';
import { getSplitsDataByUserEmail } from '@/lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const receipts = await getSplitsDataByUserEmail(email);

    return NextResponse.json({ receipts });
  } catch (error) {
    console.error('Error fetching splits data:', error);
    return NextResponse.json({ error: 'Failed to fetch splits data' }, { status: 500 });
  }
} 