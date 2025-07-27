-- Query to make some split participants unsettled for testing
-- This will update split participants where the owes amount > 0 to have 'unsettled' status

UPDATE split_participants 
SET status = 'unsettled', updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    SELECT id FROM split_participants 
    WHERE owes > 0 AND status = 'settled' 
    LIMIT 5
);

-- Alternative: Update specific participants by email
UPDATE split_participants sp
SET status = 'unsettled', updated_at = CURRENT_TIMESTAMP
FROM split_info si
WHERE sp.split_info_id = si.id 
AND sp.email IN ('ashish@gmail.com', 'prabhat@gmail.com', 'ayush@gmail.com')
AND sp.owes > 0 
AND sp.status = 'settled';

-- Check the results
SELECT 
    sp.email,
    sp.owes,
    sp.status,
    r.merchant_name,
    si.payer_email
FROM split_participants sp
JOIN split_info si ON sp.split_info_id = si.id
JOIN receipts r ON si.receipt_id = r.id
WHERE sp.owes > 0
ORDER BY sp.status, sp.email; 