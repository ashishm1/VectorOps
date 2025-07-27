import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // A simple query to check if we can connect to PostgreSQL
    const result = await query('SELECT NOW() as current_time');
    return NextResponse.json({ 
      status: 'ok', 
      message: 'PostgreSQL connection is healthy.',
      timestamp: result.rows[0].current_time
    });
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Could not connect to PostgreSQL.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
