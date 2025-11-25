-- Replace payment tables with simple COD system

-- Drop payment tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS user_wallets;
DROP TABLE IF EXISTS refunds;

-- Update rentals table for COD
ALTER TABLE rentals DROP COLUMN IF EXISTS payment_status;
ALTER TABLE rentals DROP COLUMN IF EXISTS deposit_transaction_id;
ALTER TABLE rentals DROP COLUMN IF EXISTS rental_transaction_id;
ALTER TABLE rentals ADD COLUMN payment_method ENUM('cash_on_delivery') DEFAULT 'cash_on_delivery';
ALTER TABLE rentals ADD COLUMN deposit_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE rentals ADD COLUMN rental_paid BOOLEAN DEFAULT FALSE;

-- Messages table for in-app chat (keep this)
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    rental_id INT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (rental_id) REFERENCES rentals(id)
);

-- Notifications table (keep this)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('rental_request', 'rental_approved', 'rental_rejected', 'message', 'general') DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);