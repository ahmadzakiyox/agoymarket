const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    nama: { type: String, required: true },
    deskripsi: { type: String, required: true },
    harga: { type: Number, required: true },
    hargaCoret: { type: Number },
    stok: { type: Number, required: true, default: 0 },
    gambar: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Product', productSchema);
