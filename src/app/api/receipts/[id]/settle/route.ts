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
      
      // Update the participant status to 'pending'
      const result = await client.query(
        `UPDATE split_participants sp
         SET status = 'pending', updated_at = CURRENT_TIMESTAMP
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
      
      // Get receipt details for notification
      const receiptResult = await client.query(
        `SELECT r.merchant_name, r.total_amount, si.payer_email
         FROM receipts r
         JOIN split_info si ON r.id = si.receipt_id
         WHERE r.id = $1`,
        [receiptId]
      );
      
      if (receiptResult.rows.length > 0) {
        const receipt = receiptResult.rows[0];
        
        // Create notification for the payer
        await client.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES ((SELECT id FROM users WHERE email = $1), $2, $3, 'split_settlement')`,
          [
            receipt.payer_email,
            'Payment Received',
            `${participantEmail} has settled their share of ₹${receipt.total_amount} for ${receipt.merchant_name}. Please confirm receipt.`
          ]
        );
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Settlement marked as pending. Waiting for confirmation.' 
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error settling up:', error);
    return NextResponse.json({ error: 'Failed to settle up' }, { status: 500 });
  }
} 