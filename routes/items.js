const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = `
            SELECT i.*, c.name as category_name, u.name as owner_name 
            FROM items i 
            JOIN categories c ON i.category_id = c.id 
            JOIN users u ON i.user_id = u.id 
            WHERE i.availability = 'available'
        `;
        const params = [];
        
        if (category) {
            query += ' AND c.name = ?';
            params.push(category);
        }
        
        if (search) {
            query += ' AND (i.title LIKE ? OR i.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY i.created_at DESC';
        
        const [items] = await db.execute(query, params);
        const itemsWithFullUrl = items.map(item => ({
            ...item,
            image_url: item.image_url ? `http://localhost:3000${item.image_url}` : null
        }));
        res.json(itemsWithFullUrl);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [items] = await db.execute(`
            SELECT i.*, c.name as category_name, u.name as owner_name, u.rating as owner_rating 
            FROM items i 
            JOIN categories c ON i.category_id = c.id 
            JOIN users u ON i.user_id = u.id 
            WHERE i.id = ?
        `, [req.params.id]);
        
        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        const item = items[0];
        if (item.image_url) {
            item.image_url = `http://localhost:3000${item.image_url}`;
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { user_id, category_id, title, description, price_per_day, deposit_amount, location } = req.body;
        
        const [result] = await db.execute(
            'INSERT INTO items (user_id, category_id, title, description, price_per_day, deposit_amount, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, category_id, title, description, price_per_day, deposit_amount, location]
        );
        
        res.status(201).json({ message: 'Item listed successfully', itemId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/categories/all', async (req, res) => {
    try {
        const [categories] = await db.execute('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { user_id, category_id, title, description, price_per_day, deposit_amount, location } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        const [result] = await db.execute(
            'INSERT INTO items (user_id, category_id, title, description, price_per_day, deposit_amount, location, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, category_id, title, description, price_per_day, deposit_amount, location, image_url]
        );
        
        res.status(201).json({ message: 'Item listed successfully', itemId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const [items] = await db.execute(`
            SELECT i.*, c.name as category_name 
            FROM items i 
            JOIN categories c ON i.category_id = c.id 
            WHERE i.user_id = ?
            ORDER BY i.created_at DESC
        `, [req.params.userId]);
        const itemsWithFullUrl = items.map(item => ({
            ...item,
            image_url: item.image_url ? `http://localhost:3000${item.image_url}` : null
        }));
        res.json(itemsWithFullUrl);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;