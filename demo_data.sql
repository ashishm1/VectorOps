-- Demo Data for Smart Receipts Application
-- This script creates comprehensive demo data for hackathon presentation

-- Insert Users
INSERT INTO users (email, created_at) VALUES
('ashish@gmail.com', '2024-01-15 10:30:00+05:30'),
('prabhat@gmail.com', '2024-01-16 14:20:00+05:30'),
('ayush@gmail.com', '2024-01-17 09:15:00+05:30'),
('hackathonuser@gmail.com', '2024-01-18 16:45:00+05:30');

-- Insert User Quotas (Budget per category)
INSERT INTO user_quotas (user_id, category, amount) VALUES
-- Ashish's quotas
(1, 'Home', 8000),
(1, 'Food', 12000),
(1, 'Health', 5000),
(1, 'Entertainment', 3000),
(1, 'Fuel', 4000),
(1, 'Restaurant', 6000),
(1, 'Other', 3000),

-- Prabhat's quotas
(2, 'Home', 6000),
(2, 'Food', 10000),
(2, 'Health', 4000),
(2, 'Entertainment', 2500),
(2, 'Fuel', 3500),
(2, 'Restaurant', 5000),
(2, 'Other', 2000),

-- Ayush's quotas
(3, 'Home', 7000),
(3, 'Food', 11000),
(3, 'Health', 4500),
(3, 'Entertainment', 2800),
(3, 'Fuel', 3800),
(3, 'Restaurant', 5500),
(3, 'Other', 2500),

-- Hackathon user's quotas
(4, 'Home', 5000),
(4, 'Food', 8000),
(4, 'Health', 3000),
(4, 'Entertainment', 2000),
(4, 'Fuel', 3000),
(4, 'Restaurant', 4000),
(4, 'Other', 2000);

-- Insert Receipts (50 receipts across all users)
INSERT INTO receipts (user_id, merchant_name, transaction_date, total_amount, currency, receipt_data_uri) VALUES
-- Ashish's receipts (15 receipts)
(1, 'Reliance Digital', '2024-02-15', 45000, 'INR', 'data:image/jpeg;base64,receipt_ashish_1'),
(1, 'BigBasket', '2024-02-14', 1850, 'INR', 'data:image/jpeg;base64,receipt_ashish_2'),
(1, 'Apollo Pharmacy', '2024-02-13', 850, 'INR', 'data:image/jpeg;base64,receipt_ashish_3'),
(1, 'Shell Petrol Pump', '2024-02-12', 2500, 'INR', 'data:image/jpeg;base64,receipt_ashish_4'),
(1, 'Pizza Hut', '2024-02-11', 1200, 'INR', 'data:image/jpeg;base64,receipt_ashish_5'),
(1, 'Netflix', '2024-02-10', 699, 'INR', 'data:image/jpeg;base64,receipt_ashish_6'),
(1, 'Amazon', '2024-02-09', 3200, 'INR', 'data:image/jpeg;base64,receipt_ashish_7'),
(1, 'Starbucks', '2024-02-08', 450, 'INR', 'data:image/jpeg;base64,receipt_ashish_8'),
(1, 'Decathlon', '2024-02-07', 2800, 'INR', 'data:image/jpeg;base64,receipt_ashish_9'),
(1, 'Domino\'s', '2024-02-06', 800, 'INR', 'data:image/jpeg;base64,receipt_ashish_10'),
(1, 'HP Petrol Pump', '2024-02-05', 1800, 'INR', 'data:image/jpeg;base64,receipt_ashish_11'),
(1, 'Flipkart', '2024-02-04', 15000, 'INR', 'data:image/jpeg;base64,receipt_ashish_12'),
(1, 'Cafe Coffee Day', '2024-02-03', 350, 'INR', 'data:image/jpeg;base64,receipt_ashish_13'),
(1, 'D-Mart', '2024-02-02', 2200, 'INR', 'data:image/jpeg;base64,receipt_ashish_14'),
(1, 'Spotify', '2024-02-01', 119, 'INR', 'data:image/jpeg;base64,receipt_ashish_15'),

-- Prabhat's receipts (12 receipts)
(2, 'Croma', '2024-02-15', 35000, 'INR', 'data:image/jpeg;base64,receipt_prabhat_1'),
(2, 'Grofers', '2024-02-14', 1650, 'INR', 'data:image/jpeg;base64,receipt_prabhat_2'),
(2, 'MedPlus', '2024-02-13', 650, 'INR', 'data:image/jpeg;base64,receipt_prabhat_3'),
(2, 'BP Petrol Pump', '2024-02-12', 2200, 'INR', 'data:image/jpeg;base64,receipt_prabhat_4'),
(2, 'KFC', '2024-02-11', 950, 'INR', 'data:image/jpeg;base64,receipt_prabhat_5'),
(2, 'Prime Video', '2024-02-10', 999, 'INR', 'data:image/jpeg;base64,receipt_prabhat_6'),
(2, 'Myntra', '2024-02-09', 2800, 'INR', 'data:image/jpeg;base64,receipt_prabhat_7'),
(2, 'Barista', '2024-02-08', 380, 'INR', 'data:image/jpeg;base64,receipt_prabhat_8'),
(2, 'Sports Direct', '2024-02-07', 3200, 'INR', 'data:image/jpeg;base64,receipt_prabhat_9'),
(2, 'McDonald\'s', '2024-02-06', 750, 'INR', 'data:image/jpeg;base64,receipt_prabhat_10'),
(2, 'Indian Oil', '2024-02-05', 1600, 'INR', 'data:image/jpeg;base64,receipt_prabhat_11'),
(2, 'Snapdeal', '2024-02-04', 12000, 'INR', 'data:image/jpeg;base64,receipt_prabhat_12'),

-- Ayush's receipts (13 receipts)
(3, 'Vijay Sales', '2024-02-15', 42000, 'INR', 'data:image/jpeg;base64,receipt_ayush_1'),
(3, 'Nature\'s Basket', '2024-02-14', 1950, 'INR', 'data:image/jpeg;base64,receipt_ayush_2'),
(3, 'Health & Glow', '2024-02-13', 750, 'INR', 'data:image/jpeg;base64,receipt_ayush_3'),
(3, 'IOCL Petrol Pump', '2024-02-12', 2400, 'INR', 'data:image/jpeg;base64,receipt_ayush_4'),
(3, 'Subway', '2024-02-11', 1100, 'INR', 'data:image/jpeg;base64,receipt_ayush_5'),
(3, 'Disney+ Hotstar', '2024-02-10', 899, 'INR', 'data:image/jpeg;base64,receipt_ayush_6'),
(3, 'Ajio', '2024-02-09', 3100, 'INR', 'data:image/jpeg;base64,receipt_ayush_7'),
(3, 'Costa Coffee', '2024-02-08', 420, 'INR', 'data:image/jpeg;base64,receipt_ayush_8'),
(3, 'Adidas Store', '2024-02-07', 3500, 'INR', 'data:image/jpeg;base64,receipt_ayush_9'),
(3, 'Burger King', '2024-02-06', 850, 'INR', 'data:image/jpeg;base64,receipt_ayush_10'),
(3, 'HP Petrol Pump', '2024-02-05', 1900, 'INR', 'data:image/jpeg;base64,receipt_ayush_11'),
(3, 'Paytm Mall', '2024-02-04', 13500, 'INR', 'data:image/jpeg;base64,receipt_ayush_12'),
(3, 'Licious', '2024-02-03', 1800, 'INR', 'data:image/jpeg;base64,receipt_ayush_13'),

-- Hackathon user's receipts (10 receipts)
(4, 'GreenGrocer', '2024-02-15', 1850, 'INR', 'data:image/jpeg;base64,receipt_hackathon_1'),
(4, 'Local Pharmacy', '2024-02-14', 450, 'INR', 'data:image/jpeg;base64,receipt_hackathon_2'),
(4, 'Local Petrol Pump', '2024-02-13', 1200, 'INR', 'data:image/jpeg;base64,receipt_hackathon_3'),
(4, 'Local Restaurant', '2024-02-12', 650, 'INR', 'data:image/jpeg;base64,receipt_hackathon_4'),
(4, 'YouTube Premium', '2024-02-11', 129, 'INR', 'data:image/jpeg;base64,receipt_hackathon_5'),
(4, 'Local Store', '2024-02-10', 850, 'INR', 'data:image/jpeg;base64,receipt_hackathon_6'),
(4, 'Local Cafe', '2024-02-09', 280, 'INR', 'data:image/jpeg;base64,receipt_hackathon_7'),
(4, 'Local Market', '2024-02-08', 1200, 'INR', 'data:image/jpeg;base64,receipt_hackathon_8'),
(4, 'Local Fast Food', '2024-02-07', 450, 'INR', 'data:image/jpeg;base64,receipt_hackathon_9'),
(4, 'Local Gas Station', '2024-02-06', 900, 'INR', 'data:image/jpeg;base64,receipt_hackathon_10');

-- Insert Line Items (150+ line items across all receipts)
INSERT INTO line_items (receipt_id, description, quantity, price, category) VALUES
-- Ashish's line items
(1, 'MacBook Air M2', 1, 45000, 'Other'),
(2, 'Organic Milk', 2, 65, 'Food'),
(2, 'Whole Wheat Bread', 1, 45, 'Food'),
(2, 'Apples', 1, 200, 'Food'),
(2, 'Chicken Breast', 0.5, 250, 'Food'),
(2, 'Dish Soap', 1, 90, 'Home'),
(2, 'Cheddar Cheese', 1, 260, 'Food'),
(2, 'Tomatoes', 0.5, 80, 'Food'),
(2, 'Onions', 0.5, 60, 'Food'),
(3, 'Vitamin D3', 1, 450, 'Health'),
(3, 'Paracetamol', 1, 200, 'Health'),
(3, 'Bandages', 1, 200, 'Health'),
(4, 'Petrol', 45.5, 55, 'Fuel'),
(5, 'Margherita Pizza', 1, 450, 'Restaurant'),
(5, 'Garlic Bread', 1, 200, 'Restaurant'),
(5, 'Coke', 2, 150, 'Restaurant'),
(5, 'Ice Cream', 1, 400, 'Restaurant'),
(6, 'Netflix Premium', 1, 699, 'Entertainment'),
(7, 'Bluetooth Headphones', 1, 3200, 'Other'),
(8, 'Caramel Macchiato', 1, 450, 'Restaurant'),
(9, 'Running Shoes', 1, 2800, 'Other'),
(10, 'Pepperoni Pizza', 1, 500, 'Restaurant'),
(10, 'Chicken Wings', 1, 300, 'Restaurant'),
(11, 'Petrol', 32.7, 55, 'Fuel'),
(12, 'Gaming Mouse', 1, 15000, 'Other'),
(13, 'Cappuccino', 1, 350, 'Restaurant'),
(14, 'Rice', 2, 150, 'Food'),
(14, 'Cooking Oil', 1, 200, 'Food'),
(14, 'Toothpaste', 1, 150, 'Home'),
(14, 'Shampoo', 1, 300, 'Home'),
(14, 'Soap', 2, 100, 'Home'),
(14, 'Eggs', 1, 120, 'Food'),
(14, 'Bananas', 1, 80, 'Food'),
(15, 'Spotify Premium', 1, 119, 'Entertainment'),

-- Prabhat's line items
(16, 'iPhone 15', 1, 35000, 'Other'),
(17, 'Fresh Vegetables', 1, 400, 'Food'),
(17, 'Fruits', 1, 300, 'Food'),
(17, 'Dairy Products', 1, 250, 'Food'),
(17, 'Bread', 2, 100, 'Food'),
(17, 'Eggs', 1, 120, 'Food'),
(17, 'Cooking Oil', 1, 200, 'Food'),
(17, 'Spices', 1, 180, 'Food'),
(18, 'Pain Relief Tablets', 1, 300, 'Health'),
(18, 'Cough Syrup', 1, 200, 'Health'),
(18, 'Vitamin C', 1, 150, 'Health'),
(19, 'Petrol', 40, 55, 'Fuel'),
(20, 'Chicken Bucket', 1, 600, 'Restaurant'),
(20, 'French Fries', 1, 200, 'Restaurant'),
(20, 'Soft Drink', 1, 150, 'Restaurant'),
(21, 'Amazon Prime', 1, 999, 'Entertainment'),
(22, 'Casual Shirt', 1, 1200, 'Other'),
(22, 'Jeans', 1, 1600, 'Other'),
(23, 'Espresso', 1, 380, 'Restaurant'),
(24, 'Football', 1, 1500, 'Other'),
(24, 'Sports Jersey', 1, 1700, 'Other'),
(25, 'Big Mac Meal', 1, 450, 'Restaurant'),
(25, 'Chicken Nuggets', 1, 300, 'Restaurant'),
(26, 'Petrol', 29.1, 55, 'Fuel'),
(27, 'Wireless Earbuds', 1, 12000, 'Other'),

-- Ayush's line items
(28, 'Samsung TV 55"', 1, 42000, 'Other'),
(29, 'Organic Fruits', 1, 500, 'Food'),
(29, 'Fresh Vegetables', 1, 450, 'Food'),
(29, 'Organic Milk', 2, 140, 'Food'),
(29, 'Honey', 1, 300, 'Food'),
(29, 'Nuts', 1, 360, 'Food'),
(30, 'Protein Powder', 1, 450, 'Health'),
(30, 'Multivitamin', 1, 300, 'Health'),
(31, 'Petrol', 43.6, 55, 'Fuel'),
(32, 'Veggie Delite Sub', 1, 350, 'Restaurant'),
(32, 'Chips', 1, 100, 'Restaurant'),
(32, 'Coke', 1, 150, 'Restaurant'),
(32, 'Cookie', 1, 100, 'Restaurant'),
(32, 'Coffee', 1, 200, 'Restaurant'),
(32, 'Extra Cheese', 1, 200, 'Restaurant'),
(33, 'Disney+ Hotstar', 1, 899, 'Entertainment'),
(34, 'Formal Shirt', 1, 1500, 'Other'),
(34, 'Formal Pants', 1, 1600, 'Other'),
(35, 'Cappuccino', 1, 420, 'Restaurant'),
(36, 'Running Shoes', 1, 2500, 'Other'),
(36, 'Sports Socks', 1, 1000, 'Other'),
(37, 'Whopper Meal', 1, 500, 'Restaurant'),
(37, 'Onion Rings', 1, 200, 'Restaurant'),
(37, 'Milkshake', 1, 150, 'Restaurant'),
(38, 'Petrol', 34.5, 55, 'Fuel'),
(39, 'Gaming Laptop', 1, 13500, 'Other'),
(40, 'Fresh Meat', 1, 800, 'Food'),
(40, 'Seafood', 1, 1000, 'Food'),

-- Hackathon user's line items
(41, 'Organic Milk', 2, 65, 'Food'),
(41, 'Whole Wheat Bread', 1, 45, 'Food'),
(41, 'Apples', 1, 200, 'Food'),
(41, 'Chicken Breast', 0.5, 250, 'Food'),
(41, 'Dish Soap', 1, 90, 'Home'),
(41, 'Cheddar Cheese', 1, 260, 'Food'),
(41, 'Tomatoes', 0.5, 80, 'Food'),
(41, 'Onions', 0.5, 60, 'Food'),
(41, 'Rice', 2, 150, 'Food'),
(41, 'Cooking Oil', 1, 200, 'Food'),
(42, 'Pain Relief Tablets', 1, 300, 'Health'),
(42, 'Cough Syrup', 1, 150, 'Health'),
(43, 'Petrol', 21.8, 55, 'Fuel'),
(44, 'Biryani', 1, 400, 'Restaurant'),
(44, 'Raita', 1, 100, 'Restaurant'),
(44, 'Soft Drink', 1, 150, 'Restaurant'),
(45, 'YouTube Premium', 1, 129, 'Entertainment'),
(46, 'Toothpaste', 1, 150, 'Home'),
(46, 'Shampoo', 1, 300, 'Home'),
(46, 'Soap', 2, 100, 'Home'),
(46, 'Toilet Paper', 1, 300, 'Home'),
(47, 'Tea', 1, 150, 'Restaurant'),
(47, 'Biscuits', 1, 130, 'Restaurant'),
(48, 'Rice', 2, 150, 'Food'),
(48, 'Cooking Oil', 1, 200, 'Food'),
(48, 'Spices', 1, 180, 'Food'),
(48, 'Pulses', 1, 120, 'Food'),
(48, 'Sugar', 1, 100, 'Food'),
(48, 'Salt', 1, 50, 'Food'),
(48, 'Tea Leaves', 1, 200, 'Food'),
(49, 'Burger', 1, 250, 'Restaurant'),
(49, 'French Fries', 1, 200, 'Restaurant'),
(50, 'Petrol', 16.4, 55, 'Fuel');

-- Insert Warranty Info (for electronics and appliances)
INSERT INTO warranty_info (receipt_id, is_warranty_tracked, warranty_end_date, days_remaining) VALUES
(1, true, '2027-02-15', 1095), -- MacBook Air M2 - 3 years warranty
(12, true, '2026-02-04', 730), -- Gaming Mouse - 2 years warranty
(16, true, '2027-02-15', 1095), -- iPhone 15 - 3 years warranty
(27, true, '2026-02-04', 730), -- Wireless Earbuds - 2 years warranty
(28, true, '2027-02-15', 1095), -- Samsung TV - 3 years warranty
(36, true, '2025-08-07', 365), -- Running Shoes - 1 year warranty
(39, true, '2026-02-04', 730); -- Gaming Laptop - 2 years warranty

-- Insert Split Info (for group expenses)
INSERT INTO split_info (receipt_id, is_split, payer_email, split_type) VALUES
-- 2-person splits
(5, true, 'ashish@gmail.com', 'equal'), -- Pizza Hut split between Ashish and Prabhat
(20, true, 'prabhat@gmail.com', 'equal'), -- KFC split between Prabhat and Ayush
(32, true, 'ayush@gmail.com', 'equal'), -- Subway split between Ayush and Hackathon user
(44, true, 'hackathonuser@gmail.com', 'equal'), -- Restaurant split between Hackathon user and Ashish

-- 3-person splits
(10, true, 'ashish@gmail.com', 'equal'), -- Domino's split between Ashish, Prabhat, and Ayush
(25, true, 'prabhat@gmail.com', 'equal'), -- McDonald's split between Prabhat, Ayush, and Hackathon user
(37, true, 'ayush@gmail.com', 'equal'), -- Burger King split between Ayush, Hackathon user, and Ashish

-- 4-person splits
(8, true, 'ashish@gmail.com', 'equal'), -- Starbucks split between all 4 users
(23, true, 'prabhat@gmail.com', 'equal'), -- Barista split between all 4 users
(35, true, 'ayush@gmail.com', 'equal'), -- Costa Coffee split between all 4 users
(47, true, 'hackathonuser@gmail.com', 'equal'); -- Local Cafe split between all 4 users

-- Insert Split Participants (using subquery to get correct split_info_id)
INSERT INTO split_participants (split_info_id, email, share, paid, owes, status) VALUES
-- 2-person splits
((SELECT id FROM split_info WHERE receipt_id = 5), 'ashish@gmail.com', 600, 1200, 0, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 5), 'prabhat@gmail.com', 600, 0, 600, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 20), 'prabhat@gmail.com', 475, 950, 0, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 20), 'ayush@gmail.com', 475, 0, 475, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 32), 'ayush@gmail.com', 550, 1100, 0, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 32), 'hackathonuser@gmail.com', 550, 0, 550, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 44), 'hackathonuser@gmail.com', 325, 650, 0, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 44), 'ashish@gmail.com', 325, 0, 325, 'settled'),

-- 3-person splits
((SELECT id FROM split_info WHERE receipt_id = 10), 'ashish@gmail.com', 267, 800, 0, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 10), 'prabhat@gmail.com', 267, 0, 267, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 10), 'ayush@gmail.com', 266, 0, 266, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 25), 'prabhat@gmail.com', 250, 750, 0, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 25), 'ayush@gmail.com', 250, 0, 250, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 25), 'hackathonuser@gmail.com', 250, 0, 250, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 37), 'ayush@gmail.com', 283, 850, 0, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 37), 'hackathonuser@gmail.com', 283, 0, 283, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 37), 'ashish@gmail.com', 284, 0, 284, 'settled'),

-- 4-person splits
((SELECT id FROM split_info WHERE receipt_id = 8), 'ashish@gmail.com', 113, 450, 0, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 8), 'prabhat@gmail.com', 113, 0, 113, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 8), 'ayush@gmail.com', 112, 0, 112, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 8), 'hackathonuser@gmail.com', 112, 0, 112, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 23), 'prabhat@gmail.com', 95, 380, 0, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 23), 'ashish@gmail.com', 95, 0, 95, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 23), 'ayush@gmail.com', 95, 0, 95, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 23), 'hackathonuser@gmail.com', 95, 0, 95, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 35), 'ayush@gmail.com', 105, 420, 0, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 35), 'ashish@gmail.com', 105, 0, 105, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 35), 'prabhat@gmail.com', 105, 0, 105, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 35), 'hackathonuser@gmail.com', 105, 0, 105, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 47), 'hackathonuser@gmail.com', 70, 280, 0, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 47), 'ashish@gmail.com', 70, 0, 70, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 47), 'prabhat@gmail.com', 70, 0, 70, 'settled'),
((SELECT id FROM split_info WHERE receipt_id = 47), 'ayush@gmail.com', 70, 0, 70, 'settled');

-- Insert Item Splits (for custom splits)
INSERT INTO item_splits (split_info_id, line_item_id, assigned_to_email) VALUES
-- Custom splits for specific items (using subqueries to get correct IDs)
((SELECT id FROM split_info WHERE receipt_id = 5), (SELECT id FROM line_items WHERE receipt_id = 5 AND description = 'Margherita Pizza'), 'ashish@gmail.com'),
((SELECT id FROM split_info WHERE receipt_id = 5), (SELECT id FROM line_items WHERE receipt_id = 5 AND description = 'Garlic Bread'), 'prabhat@gmail.com'),
((SELECT id FROM split_info WHERE receipt_id = 5), (SELECT id FROM line_items WHERE receipt_id = 5 AND description = 'Coke'), 'ashish@gmail.com'),
((SELECT id FROM split_info WHERE receipt_id = 5), (SELECT id FROM line_items WHERE receipt_id = 5 AND description = 'Ice Cream'), 'prabhat@gmail.com'),

((SELECT id FROM split_info WHERE receipt_id = 20), (SELECT id FROM line_items WHERE receipt_id = 20 AND description = 'Chicken Bucket'), 'prabhat@gmail.com'),
((SELECT id FROM split_info WHERE receipt_id = 20), (SELECT id FROM line_items WHERE receipt_id = 20 AND description = 'French Fries'), 'ayush@gmail.com'),
((SELECT id FROM split_info WHERE receipt_id = 20), (SELECT id FROM line_items WHERE receipt_id = 20 AND description = 'Soft Drink'), 'prabhat@gmail.com'),

((SELECT id FROM split_info WHERE receipt_id = 32), (SELECT id FROM line_items WHERE receipt_id = 32 AND description = 'Veggie Delite Sub'), 'ayush@gmail.com'),
((SELECT id FROM split_info WHERE receipt_id = 32), (SELECT id FROM line_items WHERE receipt_id = 32 AND description = 'Chips'), 'hackathonuser@gmail.com'),
((SELECT id FROM split_info WHERE receipt_id = 32), (SELECT id FROM line_items WHERE receipt_id = 32 AND description = 'Coke'), 'ayush@gmail.com'),
((SELECT id FROM split_info WHERE receipt_id = 32), (SELECT id FROM line_items WHERE receipt_id = 32 AND description = 'Cookie'), 'hackathonuser@gmail.com'),
((SELECT id FROM split_info WHERE receipt_id = 32), (SELECT id FROM line_items WHERE receipt_id = 32 AND description = 'Coffee'), 'ayush@gmail.com'),
((SELECT id FROM split_info WHERE receipt_id = 32), (SELECT id FROM line_items WHERE receipt_id = 32 AND description = 'Extra Cheese'), 'hackathonuser@gmail.com');

-- Insert Recurring Payments (AI-detected subscriptions)
INSERT INTO recurring_payments (user_id, merchant_name, estimated_amount, next_due_date, status) VALUES
-- Ashish's subscriptions
(1, 'Netflix', 699, '2024-03-10', 'paid'),
(1, 'Spotify', 119, '2024-03-01', 'paid'),

-- Prabhat's subscriptions
(2, 'Prime Video', 999, '2024-03-10', 'paid'),

-- Ayush's subscriptions
(3, 'Disney+ Hotstar', 899, '2024-03-10', 'paid'),

-- Hackathon user's subscriptions
(4, 'YouTube Premium', 129, '2024-03-11', 'paid'),

-- Upcoming unpaid subscriptions
(1, 'Netflix', 699, '2024-04-10', 'unpaid'),
(2, 'Prime Video', 999, '2024-04-10', 'unpaid'),
(3, 'Disney+ Hotstar', 899, '2024-04-10', 'unpaid'),
(4, 'YouTube Premium', 129, '2024-04-11', 'unpaid');

-- Insert Notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
-- Ashish's notifications
(1, 'Warranty Alert', 'Your MacBook Air M2 warranty expires in 1095 days', 'warranty', false),
(1, 'Budget Warning', 'You\'ve spent 85% of your Food budget this month', 'budget', false),
(1, 'Subscription Due', 'Netflix subscription due on March 10th', 'subscription', false),

-- Prabhat's notifications
(2, 'Warranty Alert', 'Your iPhone 15 warranty expires in 1095 days', 'warranty', false),
(2, 'Budget Exceeded', 'You\'ve exceeded your Entertainment budget by ₹200', 'budget', false),
(2, 'Subscription Due', 'Prime Video subscription due on March 10th', 'subscription', false),

-- Ayush's notifications
(3, 'Warranty Alert', 'Your Samsung TV warranty expires in 1095 days', 'warranty', false),
(3, 'Budget Warning', 'You\'ve spent 90% of your Fuel budget this month', 'budget', false),
(3, 'Subscription Due', 'Disney+ Hotstar subscription due on March 10th', 'subscription', false),

-- Hackathon user's notifications
(4, 'Budget Warning', 'You\'ve spent 75% of your Food budget this month', 'budget', false),
(4, 'Subscription Due', 'YouTube Premium subscription due on March 11th', 'subscription', false),
(4, 'Split Settlement', 'You owe ₹325 to ashish@gmail.com for restaurant bill', 'split', false);

-- Insert Health Checks
INSERT INTO health_checks (check_name, status, details) VALUES
('Database Connection', 'healthy', '{"response_time": "2ms", "connections": 5}'),
('AI Services', 'healthy', '{"receipt_parsing": "online", "chatbot": "online"}'),
('Payment Processing', 'healthy', '{"gateway": "active", "transactions": "normal"}'),
('File Storage', 'healthy', '{"receipt_images": "accessible", "backup": "complete"}'),
('Email Service', 'healthy', '{"delivery_rate": "99.9%", "queue": "empty"}');

-- Update warranty days remaining based on current date
UPDATE warranty_info 
SET days_remaining = (warranty_end_date::date - CURRENT_DATE)
WHERE is_warranty_tracked = true; 