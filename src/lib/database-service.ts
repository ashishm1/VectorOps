import { query, getClient } from './database';
import type { Receipt, LineItem, WarrantyInfo, SplitInfo, SplitParticipant, ItemSplit } from './types';

// User operations
export async function createUser(email: string) {
  const result = await query(
    'INSERT INTO users (email) VALUES ($1) RETURNING id, email, created_at',
    [email]
  );
  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const result = await query(
    'SELECT id, email, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function getUserById(id: number) {
  const result = await query(
    'SELECT id, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Receipt operations
export async function createReceipt(receipt: Omit<Receipt, 'id'>) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    // Get user ID from email
    const userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [receipt.userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const userId = userResult.rows[0].id;
    
    // Insert receipt
    const receiptResult = await client.query(
      `INSERT INTO receipts (user_id, merchant_name, transaction_date, total_amount, currency, receipt_data_uri)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId, receipt.merchantName, receipt.transactionDate, receipt.totalAmount, receipt.currency, receipt.receiptDataUri]
    );
    
    const receiptId = receiptResult.rows[0].id;
    
    // Insert line items
    for (const item of receipt.lineItems) {
      await client.query(
        `INSERT INTO line_items (receipt_id, description, quantity, price, category)
         VALUES ($1, $2, $3, $4, $5)`,
        [receiptId, item.description, item.quantity, item.price, item.category]
      );
    }
    
    // Insert warranty info if exists
    if (receipt.warrantyInfo) {
      await client.query(
        `INSERT INTO warranty_info (receipt_id, is_warranty_tracked, warranty_end_date, days_remaining)
         VALUES ($1, $2, $3, $4)`,
        [receiptId, receipt.warrantyInfo.isWarrantyTracked, receipt.warrantyInfo.warrantyEndDate, receipt.warrantyInfo.daysRemaining]
      );
    }
    
    // Insert split info if exists
    if (receipt.splitInfo) {
      const splitResult = await client.query(
        `INSERT INTO split_info (receipt_id, is_split, payer_email, split_type)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [receiptId, receipt.splitInfo.isSplit, receipt.splitInfo.payer, receipt.splitInfo.splitType]
      );
      
      const splitInfoId = splitResult.rows[0].id;
      
      // Insert split participants
      for (const participant of receipt.splitInfo.participants) {
        await client.query(
          `INSERT INTO split_participants (split_info_id, email, share, paid, owes, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [splitInfoId, participant.email, participant.share, participant.paid, participant.owes, participant.status || 'unsettled']
        );
      }
      
      // Insert item splits if custom split
      if (receipt.splitInfo.itemSplits && receipt.splitInfo.splitType === 'custom') {
        for (const itemSplit of receipt.splitInfo.itemSplits) {
          await client.query(
            `INSERT INTO item_splits (split_info_id, line_item_id, assigned_to_email)
             VALUES ($1, $2, $3)`,
            [splitInfoId, itemSplit.itemId, itemSplit.assignedTo]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Return the created receipt with full details
    return await getReceiptById(receiptId.toString());
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getReceiptById(id: string) {
  const result = await query(
    `SELECT 
       r.id, r.merchant_name, r.transaction_date, r.total_amount, r.currency, r.receipt_data_uri,
       u.email as user_email,
       li.id as line_item_id, li.description, li.quantity, li.price, li.category,
       wi.is_warranty_tracked, wi.warranty_end_date, wi.days_remaining,
       si.is_split, si.payer_email, si.split_type,
       sp.email as participant_email, sp.share, sp.paid, sp.owes, sp.status,
       its.line_item_id as split_item_id, its.assigned_to_email
     FROM receipts r
     LEFT JOIN users u ON r.user_id = u.id
     LEFT JOIN line_items li ON r.id = li.receipt_id
     LEFT JOIN warranty_info wi ON r.id = wi.receipt_id
     LEFT JOIN split_info si ON r.id = si.receipt_id
     LEFT JOIN split_participants sp ON si.id = sp.split_info_id
     LEFT JOIN item_splits its ON si.id = its.split_info_id
     WHERE r.id = $1
     ORDER BY li.id, sp.id, its.id`,
    [id]
  );
  
  if (result.rows.length === 0) return null;
  
  return transformReceiptRows(result.rows);
}

export async function getReceiptsByUserEmail(email: string) {
  const result = await query(
    `SELECT 
       r.id, r.merchant_name, r.transaction_date, r.total_amount, r.currency, r.receipt_data_uri,
       u.email as user_email,
       li.id as line_item_id, li.description, li.quantity, li.price, li.category,
       wi.is_warranty_tracked, wi.warranty_end_date, wi.days_remaining,
       si.is_split, si.payer_email, si.split_type,
       sp.email as participant_email, sp.share, sp.paid, sp.owes, sp.status,
       its.line_item_id as split_item_id, its.assigned_to_email
     FROM receipts r
     LEFT JOIN users u ON r.user_id = u.id
     LEFT JOIN line_items li ON r.id = li.receipt_id
     LEFT JOIN warranty_info wi ON r.id = wi.receipt_id
     LEFT JOIN split_info si ON r.id = si.receipt_id
     LEFT JOIN split_participants sp ON si.id = sp.split_info_id
     LEFT JOIN item_splits its ON si.id = its.split_info_id
     WHERE u.email = $1 OR sp.email = $1
     ORDER BY r.transaction_date DESC, r.id, li.id, sp.id, its.id`,
    [email]
  );
  
  return groupReceiptsByReceiptId(result.rows);
}

// Optimized function for splits page - only fetches split-related data
export async function getSplitsDataByUserEmail(email: string) {
  const result = await query(
    `SELECT 
       r.id, r.merchant_name, r.transaction_date, r.total_amount, r.currency,
       si.is_split, si.payer_email, si.split_type,
       sp.email as participant_email, sp.share, sp.paid, sp.owes, sp.status
     FROM receipts r
     LEFT JOIN users u ON r.user_id = u.id
     LEFT JOIN split_info si ON r.id = si.receipt_id
     LEFT JOIN split_participants sp ON si.id = sp.split_info_id
     WHERE (u.email = $1 OR sp.email = $1) AND si.is_split = true
     ORDER BY r.transaction_date DESC, r.id, sp.id`,
    [email]
  );
  
  return groupSplitsDataByReceiptId(result.rows);
}

export async function updateReceipt(id: string, updates: Partial<Receipt>) {
  // This is a simplified update - in a real app you'd want more granular updates
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    if (updates.merchantName || updates.transactionDate || updates.totalAmount || updates.currency) {
      await client.query(
        `UPDATE receipts 
         SET merchant_name = COALESCE($1, merchant_name),
             transaction_date = COALESCE($2, transaction_date),
             total_amount = COALESCE($3, total_amount),
             currency = COALESCE($4, currency)
         WHERE id = $5`,
        [updates.merchantName, updates.transactionDate, updates.totalAmount, updates.currency, id]
      );
    }
    
    await client.query('COMMIT');
    
    return await getReceiptById(id);
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteReceipt(id: string) {
  const result = await query('DELETE FROM receipts WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
}

// User quotas operations
export async function getUserQuotas(email: string) {
  const result = await query(
    `SELECT uq.category, uq.amount
     FROM user_quotas uq
     JOIN users u ON uq.user_id = u.id
     WHERE u.email = $1`,
    [email]
  );
  
  const quotas: { [key: string]: number } = {};
  result.rows.forEach(row => {
    quotas[row.category] = parseFloat(row.amount);
  });
  
  return quotas;
}

export async function updateUserQuota(email: string, category: string, amount: number) {
  const result = await query(
    `INSERT INTO user_quotas (user_id, category, amount)
     VALUES ((SELECT id FROM users WHERE email = $1), $2, $3)
     ON CONFLICT (user_id, category) 
     DO UPDATE SET amount = $3, updated_at = CURRENT_TIMESTAMP
     RETURNING amount`,
    [email, category, amount]
  );
  
  return parseFloat(result.rows[0].amount);
}

// Helper functions
function transformReceiptRows(rows: any[]): Receipt | null {
  if (rows.length === 0) return null;
  
  const firstRow = rows[0];
  const receipt: Receipt = {
    id: firstRow.id.toString(),
    userId: firstRow.user_email,
    merchantName: firstRow.merchant_name,
    transactionDate: firstRow.transaction_date,
    totalAmount: parseFloat(firstRow.total_amount),
    currency: firstRow.currency,
    lineItems: [],
    receiptDataUri: firstRow.receipt_data_uri,
  };
  
  // Process line items
  const lineItemsMap = new Map();
  rows.forEach(row => {
    if (row.line_item_id && !lineItemsMap.has(row.line_item_id)) {
      lineItemsMap.set(row.line_item_id, {
        id: row.line_item_id.toString(),
        description: row.description,
        quantity: parseFloat(row.quantity),
        price: parseFloat(row.price),
        category: row.category,
      });
    }
  });
  receipt.lineItems = Array.from(lineItemsMap.values());
  
  // Process warranty info
  if (firstRow.is_warranty_tracked !== null) {
    receipt.warrantyInfo = {
      isWarrantyTracked: firstRow.is_warranty_tracked,
      warrantyEndDate: firstRow.warranty_end_date,
      daysRemaining: firstRow.days_remaining,
    };
  }
  
  // Process split info
  if (firstRow.is_split) {
    const participants: SplitParticipant[] = [];
    const itemSplits: ItemSplit[] = [];
    
    rows.forEach(row => {
      if (row.participant_email && !participants.find(p => p.email === row.participant_email)) {
        participants.push({
          email: row.participant_email,
          share: parseFloat(row.share),
          paid: parseFloat(row.paid),
          owes: parseFloat(row.owes),
          status: row.status,
        });
      }
      
      if (row.split_item_id && row.assigned_to_email) {
        itemSplits.push({
          itemId: row.split_item_id.toString(),
          assignedTo: row.assigned_to_email,
        });
      }
    });
    
    receipt.splitInfo = {
      isSplit: firstRow.is_split,
      payer: firstRow.payer_email,
      participants,
      splitType: firstRow.split_type,
      itemSplits: itemSplits.length > 0 ? itemSplits : undefined,
    };
  }
  
  return receipt;
}

function groupReceiptsByReceiptId(rows: any[]): Receipt[] {
  const receiptsMap = new Map();
  
  rows.forEach(row => {
    const receiptId = row.id.toString();
    
    if (!receiptsMap.has(receiptId)) {
      receiptsMap.set(receiptId, {
        id: receiptId,
        userId: row.user_email,
        merchantName: row.merchant_name,
        transactionDate: row.transaction_date,
        totalAmount: parseFloat(row.total_amount),
        currency: row.currency,
        lineItems: [],
        receiptDataUri: row.receipt_data_uri,
        warrantyInfo: null,
        splitInfo: null,
      });
    }
    
    const receipt = receiptsMap.get(receiptId);
    
    // Add line item if not already added
    if (row.line_item_id && !receipt.lineItems.find((li: any) => li.id === row.line_item_id.toString())) {
      receipt.lineItems.push({
        id: row.line_item_id.toString(),
        description: row.description,
        quantity: parseFloat(row.quantity),
        price: parseFloat(row.price),
        category: row.category,
      });
    }
    
    // Set warranty info
    if (row.is_warranty_tracked !== null && !receipt.warrantyInfo) {
      receipt.warrantyInfo = {
        isWarrantyTracked: row.is_warranty_tracked,
        warrantyEndDate: row.warranty_end_date,
        daysRemaining: row.days_remaining,
      };
    }
    
    // Set split info
    if (row.is_split && !receipt.splitInfo) {
      receipt.splitInfo = {
        isSplit: row.is_split,
        payer: row.payer_email,
        participants: [],
        splitType: row.split_type,
        itemSplits: [],
      };
    }
    
    // Add participant if split info exists
    if (receipt.splitInfo && row.participant_email && 
        !receipt.splitInfo.participants.find((p: any) => p.email === row.participant_email)) {
      receipt.splitInfo.participants.push({
        email: row.participant_email,
        share: parseFloat(row.share),
        paid: parseFloat(row.paid),
        owes: parseFloat(row.owes),
        status: row.status,
      });
    }
    
    // Add item split if exists
    if (receipt.splitInfo && row.split_item_id && row.assigned_to_email &&
        !receipt.splitInfo.itemSplits.find((is: any) => is.itemId === row.split_item_id.toString())) {
      receipt.splitInfo.itemSplits.push({
        itemId: row.split_item_id.toString(),
        assignedTo: row.assigned_to_email,
      });
    }
  });
  
  return Array.from(receiptsMap.values());
}

// Helper function to group splits data by receipt ID
function groupSplitsDataByReceiptId(rows: any[]): Receipt[] {
  const receiptMap = new Map<string, any>();
  
  rows.forEach(row => {
    const receiptId = row.id.toString();
    
    if (!receiptMap.has(receiptId)) {
      receiptMap.set(receiptId, {
        id: receiptId,
        userId: row.user_email,
        merchantName: row.merchant_name,
        transactionDate: row.transaction_date,
        totalAmount: parseFloat(row.total_amount),
        currency: row.currency,
        receiptDataUri: row.receipt_data_uri,
        lineItems: [],
        warrantyInfo: null,
        splitInfo: row.is_split ? {
          isSplit: true,
          payer: row.payer_email,
          splitType: row.split_type,
          participants: [],
          itemSplits: []
        } : null
      });
    }
    
    const receipt = receiptMap.get(receiptId);
    
    // Add participant if split exists and participant data is present
    if (row.is_split && row.participant_email) {
      const existingParticipant = receipt.splitInfo.participants.find(
        (p: any) => p.email === row.participant_email
      );
      
      if (!existingParticipant) {
        receipt.splitInfo.participants.push({
          email: row.participant_email,
          share: parseFloat(row.share),
          paid: parseFloat(row.paid),
          owes: parseFloat(row.owes),
          status: row.status
        });
      }
    }
  });
  
  return Array.from(receiptMap.values());
}
