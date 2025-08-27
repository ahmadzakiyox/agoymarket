// server.js (Dengan fungsionalitas CRUD Lengkap)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/product');
const Setting = require('./models/Settings');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Koneksi ke MongoDB
const mongoURI = process.env.DATABASE_URL;
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// --- API Endpoints ---

// Create (POST) - Menambah produk baru
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: 'Produk berhasil ditambahkan', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambahkan produk', error: error.message });
    }
});

// Read (GET) - Mendapatkan semua produk
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data produk' });
    }
});

// Read (GET) - Mendapatkan satu produk by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data produk' });
    }
});

// Update (PUT) - Mengedit produk by ID
app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Mengembalikan dokumen yang sudah diperbarui
        );
        if (!updatedProduct) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.status(200).json({ message: 'Produk berhasil diperbarui', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui produk', error: error.message });
    }
});

// Delete (DELETE) - Menghapus produk by ID
app.delete('/api/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.status(200).json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus produk', error: error.message });
    }
});

// Tambahkan endpoint ini di bawah endpoint produk lainnya
// GET - Ambil data pengaturan
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await Setting.findOne() || new Setting();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pengaturan' });
    }
});

// POST - Simpan atau perbarui data pengaturan
app.post('/api/settings', async (req, res) => {
    try {
        const { whatsappNumber, telegramUsername } = req.body;
        const updatedSettings = await Setting.findOneAndUpdate({}, 
            { whatsappNumber, telegramUsername },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({ message: 'Pengaturan berhasil disimpan', settings: updatedSettings });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menyimpan pengaturan', error: error.message });
    }
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Menjalankan Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
