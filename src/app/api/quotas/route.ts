import { NextRequest, NextResponse } from 'next/server';
import { getUserQuotas, updateUserQuota, createUser, getUserByEmail } from '@/lib/database-service';

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
    
    const quotas = await getUserQuotas(email);
    
    return NextResponse.json({ quotas });
  } catch (error) {
    console.error('Error fetching quotas:', error);
    return NextResponse.json({ error: 'Failed to fetch quotas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, category, amount } = body;
    
    if (!email || !category || amount === undefined) {
      return NextResponse.json({ error: 'Email, category, and amount are required' }, { status: 400 });
    }
    
    // Ensure user exists
    let user = await getUserByEmail(email);
    if (!user) {
      user = await createUser(email);
    }
    
    const updatedAmount = await updateUserQuota(email, category, amount);
    
    return NextResponse.json({ amount: updatedAmount });
  } catch (error) {
    console.error('Error updating quota:', error);
    return NextResponse.json({ error: 'Failed to update quota' }, { status: 500 });
  }
} 