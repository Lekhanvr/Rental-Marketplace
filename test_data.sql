-- Test data for CampusShare application

-- Insert sample users
INSERT INTO users (name, email, password, phone, college, rating) VALUES
('John Doe', 'john@example.com', '$2a$10$example_hash', '9876543210', 'VIT University', 4.5),
('Jane Smith', 'jane@example.com', '$2a$10$example_hash', '9876543211', 'VIT University', 4.8),
('Mike Johnson', 'mike@example.com', '$2a$10$example_hash', '9876543212', 'VIT University', 4.2),
('Sarah Wilson', 'sarah@example.com', '$2a$10$example_hash', '9876543213', 'VIT University', 4.7);

-- Insert sample items
INSERT INTO items (user_id, category_id, title, description, price_per_day, deposit_amount, location, image_url) VALUES
(1, 1, 'DBMS Textbook (VTU)', 'Complete textbook with notes and solved examples', 25, 200, 'Library Block', NULL),
(1, 2, 'Electronics Toolkit', 'Complete kit with multimeter, breadboard, components', 100, 500, 'EEE Lab', NULL),
(2, 1, 'Data Structures Book', 'Latest edition with programming examples', 30, 250, 'CSE Block', NULL),
(2, 3, 'Traditional Costume Set', 'Perfect for cultural events and festivals', 300, 1000, 'Hostel Block A', NULL),
(3, 2, 'Mechanical Tools Set', 'Wrenches, screwdrivers, measuring tools', 150, 700, 'Mechanical Workshop', NULL),
(3, 4, 'Guitar (Acoustic)', 'Yamaha acoustic guitar in excellent condition', 200, 800, 'Music Room', NULL);

-- Sample messages for testing
-- These will be created via JavaScript when users interact