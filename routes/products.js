const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// GET: Mendapatkan SEMUA produk
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }); // Tampilkan yg terbaru dulu
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Mendapatkan SATU produk berdasarkan ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product == null) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Menambah produk baru
router.post('/', async (req, res) => {
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        originalPrice: req.body.originalPrice,
        imageUrl: req.body.imageUrl
    });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT (atau PATCH): Mengupdate produk
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE: Menghapus produk
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;