import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId, title, message, type } = await request.json();
    
    if (!userId || !title || !message) {
      return NextResponse.json({ error: 'User ID, title, and message are required' }, { status: 400 });
    }

    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get user ID from email
      const userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const userDbId = userResult.rows[0].id;
      
      // Insert notification
      const result = await client.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userDbId, title, message, type || 'split_settlement']
      );
      
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        notificationId: result.rows[0].id 
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }
    
    const result = await query(
      `SELECT n.id, n.title, n.message, n.type, n.is_read, n.created_at
       FROM notifications n
       JOIN users u ON n.user_id = u.id
       WHERE u.email = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [email]
    );
    
    return NextResponse.json({ notifications: result.rows });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
} 