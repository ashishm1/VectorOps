import { NextRequest, NextResponse } from 'next/server';
import { createReceipt, getReceiptsByUserEmail, createUser, getUserByEmail } from '@/lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }
    
    // Ensure user exists
    let user = await getUserByEmail(email);
    if (!user) {
      user = await createUser(email);
    }
    
    const receipts = await getReceiptsByUserEmail(email);
    
    return NextResponse.json({ receipts });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Ensure user exists
    let user = await getUserByEmail(body.userId);
    if (!user) {
      user = await createUser(body.userId);
    }
    
    const receipt = await createReceipt(body);
    
    return NextResponse.json({ receipt });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 });
  }
} 