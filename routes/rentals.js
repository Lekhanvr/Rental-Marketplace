const express = require('express');
const db = require('../config/database');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { item_id, borrower_id, start_date, end_date } = req.body;
        
        const [items] = await db.execute('SELECT * FROM items WHERE id = ?', [item_id]);
        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        const item = items[0];
        const days = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
        const total_amount = days * item.price_per_day;
        
        const [result] = await db.execute(
            'INSERT INTO rentals (item_id, borrower_id, lender_id, start_date, end_date, total_amount, deposit_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [item_id, borrower_id, item.user_id, start_date, end_date, total_amount, item.deposit_amount]
        );
        
        res.status(201).json({ message: 'Rental request created', rentalId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const [rentals] = await db.execute(`
            SELECT r.*, i.title as item_title, i.image_url,
                   borrower.name as borrower_name, lender.name as lender_name
            FROM rentals r
            JOIN items i ON r.item_id = i.id
            JOIN users borrower ON r.borrower_id = borrower.id
            JOIN users lender ON r.lender_id = lender.id
            WHERE r.borrower_id = ? OR r.lender_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.userId, req.params.userId]);
        
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/requests/:userId', async (req, res) => {
    try {
        const [requests] = await db.execute(`
            SELECT r.*, i.title as item_title, 
                   borrower.name as borrower_name, lender.name as lender_name
            FROM rentals r
            JOIN items i ON r.item_id = i.id
            JOIN users borrower ON r.borrower_id = borrower.id
            JOIN users lender ON r.lender_id = lender.id
            WHERE r.lender_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.userId]);
        
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        await db.execute('UPDATE rentals SET status = ? WHERE id = ?', [status, req.params.id]);
        
        if (status === 'approved') {
            const [rental] = await db.execute('SELECT item_id FROM rentals WHERE id = ?', [req.params.id]);
            await db.execute('UPDATE items SET availability = "rented" WHERE id = ?', [rental[0].item_id]);
        }
        
        res.json({ message: 'Rental status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;