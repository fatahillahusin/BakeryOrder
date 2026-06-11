const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Generate order number
function generateOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0,10).replace(/-/g,'');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${date}-${rand}`;
}

// POST /api/orders - Buat pesanan baru (public - pelanggan)
router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { customer_name, table_number, items, notes, payment_method } = req.body;

    if (!customer_name || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Nama pelanggan dan item pesanan wajib diisi' });
    }

    // Hitung total
    let total_amount = 0;
    const orderItems = [];
    for (const item of items) {
      const [menuRows] = await conn.query('SELECT * FROM menu_items WHERE id = ? AND is_available = 1', [item.menu_item_id]);
      if (menuRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: `Menu ID ${item.menu_item_id} tidak tersedia` });
      }
      const menu = menuRows[0];
      const subtotal = menu.price * item.quantity;
      total_amount += subtotal;
      orderItems.push({ menu_item_id: item.menu_item_id, quantity: item.quantity, unit_price: menu.price, subtotal, notes: item.notes });
    }

    const order_number = generateOrderNumber();
    const [orderResult] = await conn.query(
      'INSERT INTO orders (order_number, customer_name, table_number, total_amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [order_number, customer_name, table_number, total_amount, payment_method || 'cash', notes]
    );
    const order_id = orderResult.insertId;

    for (const oi of orderItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [order_id, oi.menu_item_id, oi.quantity, oi.unit_price, oi.subtotal, oi.notes]
      );
    }

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat!',
      data: { order_id, order_number, total_amount }
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal membuat pesanan' });
  } finally {
    conn.release();
  }
});

// GET /api/orders - Ambil semua pesanan (kasir/admin)
router.get('/', authenticate, authorizeRoles('admin', 'kasir', 'pelayan', 'dapur'), async (req, res) => {
  try {
    const { status, date, limit = 50 } = req.query;
    let query = `
      SELECT o.*, 
        GROUP_CONCAT(CONCAT(mi.name, ' x', oi.quantity) SEPARATOR ', ') as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE 1=1
    `;
    const params = [];
    if (status) { query += ' AND o.status = ?'; params.push(status); }
    if (date) { query += ' AND DATE(o.created_at) = ?'; params.push(date); }
    query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [orders] = await db.query(query, params);
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pesanan' });
  }
});

// GET /api/orders/:id - Detail pesanan
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    const [items] = await db.query(
      `SELECT oi.*, mi.name as item_name, mi.image_url 
       FROM order_items oi 
       JOIN menu_items mi ON oi.menu_item_id = mi.id 
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...orders[0], items } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail pesanan' });
  }
});

// PATCH /api/orders/:id/status - Update status pesanan
router.patch('/:id/status', authenticate, authorizeRoles('admin', 'kasir', 'pelayan', 'dapur'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }
    const [result] = await db.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    res.json({ success: true, message: `Status pesanan diperbarui menjadi ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui status' });
  }
});

// PATCH /api/orders/:id/payment - Update pembayaran (kasir)
// PATCH /api/orders/:id/payment - Update pembayaran (kasir)
router.patch('/:id/payment', authenticate, authorizeRoles('admin', 'kasir'), async (req, res) => {
  try {
    const { payment_status, payment_method } = req.body;

    const [result] = await db.query(
      'UPDATE orders SET payment_status = ?, payment_method = ?, updated_at = NOW() WHERE id = ?',
      [payment_status, payment_method || 'cash', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Status pembayaran berhasil diperbarui'
    });
  } catch (err) {
    console.error('Payment update error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui pembayaran'
    });
  }
});

// GET /api/orders/stats/today  
router.get('/stats/today', ...)
