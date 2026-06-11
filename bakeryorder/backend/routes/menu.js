const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// GET /api/menu - Ambil semua menu (public)
router.get('/', async (req, res) => {
  try {
    const { category_id, available } = req.query;
    let query = `
      SELECT m.*, c.name as category_name 
      FROM menu_items m 
      JOIN categories c ON m.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (category_id) { query += ' AND m.category_id = ?'; params.push(category_id); }
    if (available !== undefined) { query += ' AND m.is_available = ?'; params.push(available === 'true' ? 1 : 0); }
    query += ' ORDER BY c.id, m.name';

    const [items] = await db.query(query, params);
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data menu' });
  }
});

// GET /api/menu/categories - Ambil semua kategori
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY id');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil kategori' });
  }
});

// GET /api/menu/:id - Detail menu
router.get('/:id', async (req, res) => {
  try {
    const [items] = await db.query(
      'SELECT m.*, c.name as category_name FROM menu_items m JOIN categories c ON m.category_id = c.id WHERE m.id = ?',
      [req.params.id]
    );
    if (items.length === 0) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    res.json({ success: true, data: items[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data menu' });
  }
});

// POST /api/menu - Tambah menu (admin only)
router.post('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { category_id, name, description, price, image_url, is_available } = req.body;
    if (!category_id || !name || !price) {
      return res.status(400).json({ success: false, message: 'category_id, name, dan price wajib diisi' });
    }
    const [result] = await db.query(
      'INSERT INTO menu_items (category_id, name, description, price, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id, name, description, price, image_url, is_available !== false]
    );
    res.status(201).json({ success: true, message: 'Menu berhasil ditambahkan', data: { id: result.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal menambah menu' });
  }
});

// PUT /api/menu/:id - Update menu (admin only)
router.put('/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { category_id, name, description, price, image_url, is_available } = req.body;
    const [result] = await db.query(
      'UPDATE menu_items SET category_id=?, name=?, description=?, price=?, image_url=?, is_available=?, updated_at=NOW() WHERE id=?',
      [category_id, name, description, price, image_url, is_available ? 1 : 0, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    res.json({ success: true, message: 'Menu berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui menu' });
  }
});

// DELETE /api/menu/:id - Hapus menu (admin only)
router.delete('/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    res.json({ success: true, message: 'Menu berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus menu' });
  }
});

module.exports = router;
