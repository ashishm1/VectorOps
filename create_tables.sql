-- PostgreSQL Database Schema for Smart Receipts Application
-- This script creates all tables with proper constraints and indexes

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 2. Receipts Table
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_name VARCHAR(255) NOT NULL,
    transaction_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    receipt_data_uri TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_transaction_date ON receipts(transaction_date);
CREATE INDEX idx_receipts_merchant_name ON receipts(merchant_name);

-- 3. Line Items Table
CREATE TABLE line_items (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_line_items_receipt_id ON line_items(receipt_id);
CREATE INDEX idx_line_items_category ON line_items(category);

-- 4. Warranty Info Table
CREATE TABLE warranty_info (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    is_warranty_tracked BOOLEAN NOT NULL DEFAULT false,
    warranty_end_date DATE,
    days_remaining INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warranty_info_receipt_id ON warranty_info(receipt_id);
CREATE INDEX idx_warranty_info_end_date ON warranty_info(warranty_end_date);

-- 5. Split Info Table
CREATE TABLE split_info (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    is_split BOOLEAN NOT NULL DEFAULT false,
    payer_email VARCHAR(255) NOT NULL,
    split_type VARCHAR(10) NOT NULL CHECK (split_type IN ('equal', 'custom')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_split_info_receipt_id ON split_info(receipt_id);
CREATE INDEX idx_split_info_payer_email ON split_info(payer_email);

-- 6. Split Participants Table
CREATE TABLE split_participants (
    id SERIAL PRIMARY KEY,
    split_info_id INTEGER NOT NULL REFERENCES split_info(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    share DECIMAL(10,2) NOT NULL,
    paid DECIMAL(10,2) NOT NULL DEFAULT 0,
    owes DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'unsettled' CHECK (status IN ('unsettled', 'pending', 'settled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_split_participants_split_info_id ON split_participants(split_info_id);
CREATE INDEX idx_split_participants_email ON split_participants(email);
CREATE INDEX idx_split_participants_status ON split_participants(status);

-- 7. Item Splits Table
CREATE TABLE item_splits (
    id SERIAL PRIMARY KEY,
    split_info_id INTEGER NOT NULL REFERENCES split_info(id) ON DELETE CASCADE,
    line_item_id INTEGER NOT NULL REFERENCES line_items(id) ON DELETE CASCADE,
    assigned_to_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_item_splits_split_info_id ON item_splits(split_info_id);
CREATE INDEX idx_item_splits_line_item_id ON item_splits(line_item_id);
CREATE INDEX idx_item_splits_assigned_to ON item_splits(assigned_to_email);

-- 8. User Quotas Table
CREATE TABLE user_quotas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category)
);

CREATE INDEX idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX idx_user_quotas_category ON user_quotas(category);

-- 9. Recurring Payments Table
CREATE TABLE recurring_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_name VARCHAR(255) NOT NULL,
    estimated_amount DECIMAL(10,2) NOT NULL,
    next_due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recurring_payments_user_id ON recurring_payments(user_id);
CREATE INDEX idx_recurring_payments_next_due_date ON recurring_payments(next_due_date);
CREATE INDEX idx_recurring_payments_status ON recurring_payments(status);

-- 10. Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- 11. Health Checks Table (for API testing)
CREATE TABLE health_checks (
    id SERIAL PRIMARY KEY,
    check_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_checks_created_at ON health_checks(created_at);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE receipts IS 'Main receipts table with transaction details';
COMMENT ON TABLE line_items IS 'Individual items within each receipt';
COMMENT ON TABLE warranty_info IS 'Warranty tracking information for products';
COMMENT ON TABLE split_info IS 'Information about split expenses';
COMMENT ON TABLE split_participants IS 'Participants in split expenses and their shares';
COMMENT ON TABLE item_splits IS 'Custom item-level splits for specific line items';
COMMENT ON TABLE user_quotas IS 'Monthly spending budgets per category for each user';
COMMENT ON TABLE recurring_payments IS 'AI-detected recurring subscriptions and bills';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE health_checks IS 'System health monitoring records';

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to tables that have updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warranty_info_updated_at BEFORE UPDATE ON warranty_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_split_info_updated_at BEFORE UPDATE ON split_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_split_participants_updated_at BEFORE UPDATE ON split_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_quotas_updated_at BEFORE UPDATE ON user_quotas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_payments_updated_at BEFORE UPDATE ON recurring_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 