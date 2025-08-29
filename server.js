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

// Middleware
app.use(cors());
app.use(express.json());

// --- Security Middleware (Gatekeeper) ---
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN
    if (!token) return res.sendStatus(401); // Unauthorized if no token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden if token is invalid
        req.user = user;
        next(); // Proceed to the requested route
    });
};

// --- Page Routes (Clean URLs) ---
// Public pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/product-detail', (req, res) => res.sendFile(path.join(__dirname, 'public', 'product-detail.html')));

// Protected Admin Page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve static files (CSS, public JS, images)
app.use(express.static('public'));

// --- Authentication API ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) return res.status(400).json({ message: "Admin registration is closed." });
        const hashedPassword = await bcrypt.hash(password, 12);
        const admin = new Admin({ username, password: hashedPassword });
        await admin.save();
        res.status(201).json({ message: "Admin created successfully." });
    } catch (error) {
        res.status(500).json({ message: "Registration error", error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(401).json({ message: "Invalid username or password." });
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid username or password." });
        
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token });
    } catch (error) {
        console.error("Login Server Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});

// --- Protected API Endpoints ---
app.post('/api/products', authMiddleware, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }
});
app.put('/api/products/:id', authMiddleware, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
});
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
});
app.post('/api/settings', authMiddleware, async (req, res) => {
    try {
        const { whatsappNumber, telegramUsername } = req.body;
        const updatedSettings = await Setting.findOneAndUpdate({}, { whatsappNumber, telegramUsername }, { new: true, upsert: true, setDefaultsOnInsert: true });
        res.status(200).json({ message: 'Settings saved successfully', settings: updatedSettings });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save settings', error: error.message });
    }
});

// --- Public API Endpoints ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch product data' });
    }
});
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await Setting.findOne() || new Setting();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
});

// --- Database Connection & Server Start ---
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch(err => console.error(err));
