require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const Product = require('./models/product');
const Setting = require('./models/Setting');
const Admin = require('./models/Admin');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Rute Halaman (Clean URLs) ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/product-detail', (req, res) => res.sendFile(path.join(__dirname, 'public', 'product-detail.html')));

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.get('/admin', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use(express.static('public'));

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// --- AUTHENTICATION ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) return res.status(400).json({ message: "Registrasi admin sudah ditutup." });
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ username, password: hashedPassword });
        await admin.save();
        res.status(201).json({ message: "Admin berhasil dibuat." });
    } catch (error) {
        res.status(500).json({ message: "Error registrasi", error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(401).json({ message: "Username atau password salah." });
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Username atau password salah." });
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server error saat login" });
    }
});

// --- API Endpoints yang Diproteksi ---
app.post('/api/products', authMiddleware, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: 'Produk berhasil ditambahkan', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambahkan produk', error: error.message });
    }
});
app.put('/api/products/:id', authMiddleware, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.status(200).json({ message: 'Produk berhasil diperbarui', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui produk', error: error.message });
    }
});
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.status(200).json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus produk', error: error.message });
    }
});
app.post('/api/settings', authMiddleware, async (req, res) => {
    try {
        const { whatsappNumber, telegramUsername } = req.body;
        const updatedSettings = await Setting.findOneAndUpdate({}, { whatsappNumber, telegramUsername }, { new: true, upsert: true, setDefaultsOnInsert: true });
        res.status(200).json({ message: 'Pengaturan berhasil disimpan', settings: updatedSettings });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menyimpan pengaturan', error: error.message });
    }
});

// --- API Endpoints Publik ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data produk' });
    }
});
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data produk' });
    }
});
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await Setting.findOne() || new Setting();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pengaturan' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
