// public/js/product-page.js (Versi Final dengan Template Pesan)
document.addEventListener('DOMContentLoaded', async function() {
    const mainContent = document.querySelector('main.product-page');
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        mainContent.innerHTML = '<div class="alert alert-danger">Error: ID Produk tidak ditemukan.</div>';
        return;
    }

    async function loadPageData() {
        try {
            const [productRes, settingsRes] = await Promise.all([
                fetch(`/api/products/${productId}`),
                fetch('/api/settings')
            ]);
            if (!productRes.ok) throw new Error('Produk tidak ditemukan');
            const product = await productRes.json();
            const settings = await settingsRes.json();
            renderProductDetails(product, settings);
        } catch (error) {
            mainContent.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        }
    }

    // --- FUNGSI BARU: Untuk memperbarui link WhatsApp & Telegram ---
    function updateContactLinks(product, settings) {
        const quantityInput = document.getElementById('quantity-input');
        if (!quantityInput) return;

        const quantity = parseInt(quantityInput.value);
        const totalHarga = product.harga * quantity;
        const productUrl = window.location.href; // Link halaman saat ini

        // Template pesan yang akan dibuat
        const messageTemplate = `
Hai kak, saya mau order:
*${product.nama}*

====================
🛒 Quantity: ${quantity} pcs
💰 Total Biaya: Rp ${totalHarga.toLocaleString('id-ID')}
====================

Mohon info untuk langkah selanjutnya. Terima kasih.

Link Produk:
${productUrl}
        `.trim();

        const encodedMessage = encodeURIComponent(messageTemplate);

        // Perbarui link pada tombol WhatsApp jika ada
        const whatsappButton = document.getElementById('whatsapp-button');
        if (whatsappButton && settings.whatsappNumber) {
            whatsappButton.href = `https://api.whatsapp.com/send?phone=${settings.whatsappNumber}&text=${encodedMessage}`;
        }

        // Perbarui link pada tombol Telegram jika ada
        const telegramButton = document.getElementById('telegram-button');
        if (telegramButton && settings.telegramUsername) {
            telegramButton.href = `https://t.me/${settings.telegramUsername}?text=${encodedMessage}`;
        }
    }

    function renderProductDetails(product, settings) {
        document.title = `${product.nama} | TokoSaya`;
        const hargaCoretHTML = product.hargaCoret ? `<span class="price-original-detail"><s>Rp ${product.hargaCoret.toLocaleString('id-ID')}</s></span>` : '';
        
        // Buat placeholder untuk tombol-tombol
        let buttonsHTML = '';
        if (settings && settings.whatsappNumber) {
            buttonsHTML += `<a id="whatsapp-button" target="_blank" class="btn btn-success w-100 mb-2 btn-contact"><i class="fa-brands fa-whatsapp"></i> Pesan via WhatsApp</a>`;
        }
        if (settings && settings.telegramUsername) {
            buttonsHTML += `<a id="telegram-button" target="_blank" class="btn btn-info w-100 text-white btn-contact"><i class="fa-brands fa-telegram"></i> Chat via Telegram</a>`;
        }

        const detailHTML = `
            <nav aria-label="breadcrumb" class="breadcrumb-nav mb-4">
                <ol class="breadcrumb"><li class="breadcrumb-item"><a href="/index.html">Home</a></li><li class="breadcrumb-item"><a href="/index.html#katalog">Katalog</a></li><li class="breadcrumb-item active">${product.nama}</li></ol>
            </nav>
            <div class="product-panel">
                <div class="row">
                    <div class="col-lg-5 mb-4 mb-lg-0"><div class="product-image-gallery"><img src="${product.gambar}" alt="${product.nama}" class="img-fluid"></div></div>
                    <div class="col-lg-7">
                        <div class="product-info">
                            <h1 class="product-title">${product.nama}</h1>
                            <div class="price-detail-wrap my-3"><span class="price-final-detail">Rp ${(product.harga || 0).toLocaleString('id-ID')}</span>${hargaCoretHTML}</div>
                            <div class="option-group pt-3 mt-3"><label class="form-label">Stok Tersedia:</label><p><strong>${product.stok > 0 ? `${product.stok} unit` : 'Habis'}</strong></p></div>
                            <div class="option-group pt-3"><label class="form-label">Quantity:</label>
                                <div class="quantity-selector">
                                    <button class="btn btn-outline-secondary" type="button" id="button-minus">-</button>
                                    <input type="text" id="quantity-input" class="form-control text-center" value="1" readonly>
                                    <button class="btn btn-outline-secondary" type="button" id="button-plus">+</button>
                                </div>
                            </div>
                            <div class="action-buttons mt-4">${buttonsHTML}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-4"><div class="col-12"><div class="description-box"><h5>DESKRIPSI PRODUK</h5><hr><p style="white-space: pre-wrap;">${product.deskripsi}</p></div></div></div>`;
        
        mainContent.innerHTML = detailHTML;
        setupQuantityButtons(product, settings); // Kirim product & settings ke fungsi setup
    }

    function setupQuantityButtons(product, settings) {
        const minus = document.getElementById('button-minus');
        const plus = document.getElementById('button-plus');
        const input = document.getElementById('quantity-input');
        if (!minus || !plus || !input) return;

        // Panggil fungsi untuk set link awal
        updateContactLinks(product, settings);

        minus.addEventListener('click', () => { 
            let currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
                updateContactLinks(product, settings); // Panggil fungsi update setiap kali kuantitas berubah
            }
        });
        plus.addEventListener('click', () => { 
            let currentValue = parseInt(input.value);
            if (currentValue < product.stok) {
                input.value = currentValue + 1;
                updateContactLinks(product, settings); // Panggil fungsi update setiap kali kuantitas berubah
            }
        });
    }

    loadPageData();
});