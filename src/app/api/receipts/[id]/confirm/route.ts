import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { receiptId, participantEmail } = await request.json();
    
    if (!receiptId || !participantEmail) {
      return NextResponse.json({ error: 'Receipt ID and participant email are required' }, { status: 400 });
    }

    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Update the participant status to 'settled' and set owes to 0
      const result = await client.query(
        `UPDATE split_participants sp
         SET status = 'settled', owes = 0, updated_at = CURRENT_TIMESTAMP
         FROM split_info si
         WHERE sp.split_info_id = si.id 
         AND si.receipt_id = $1 
         AND sp.email = $2
         RETURNING sp.id`,
        [receiptId, participantEmail]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Split participant not found');
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Payment confirmed successfully.' 
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
} 