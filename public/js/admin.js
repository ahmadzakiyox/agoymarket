// public/js/admin.js (Dengan fungsionalitas CRUD Lengkap)
document.addEventListener('DOMContentLoaded', function() {
    const productTableBody = document.getElementById('product-table-body');
    const addProductForm = document.getElementById('addProductForm');
    const statusDiv = document.getElementById('status');
    const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    const editForm = document.getElementById('editProductForm');
    const saveEditButton = document.getElementById('saveEditButton');
    // Tambahkan di dalam event listener DOMContentLoaded

const settingsForm = document.getElementById('settingsForm');
const settingsStatusDiv = document.getElementById('settings-status');
const whatsappInput = document.getElementById('whatsappNumber');
const telegramInput = document.getElementById('telegramUsername');

async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        whatsappInput.value = settings.whatsappNumber ? settings.whatsappNumber.replace(/^62/, '') : '';
        telegramInput.value = settings.telegramUsername || '';
    } catch (error) {
        console.error('Gagal memuat pengaturan:', error);
    }
}

settingsForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    let whatsappNumber = whatsappInput.value.trim();
    if (whatsappNumber && !whatsappNumber.startsWith('62')) {
        whatsappNumber = '62' + whatsappNumber;
    }
    const settingsData = {
        whatsappNumber: whatsappNumber,
        telegramUsername: telegramInput.value.trim()
    };
    settingsStatusDiv.textContent = 'Menyimpan...';
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settingsData)
        });
        if (!response.ok) throw new Error('Gagal menyimpan');
        settingsStatusDiv.textContent = 'Pengaturan berhasil disimpan!';
        settingsStatusDiv.className = 'alert alert-success';
    } catch (error) {
        settingsStatusDiv.textContent = 'Error: ' + error.message;
        settingsStatusDiv.className = 'alert alert-danger';
    }
});

loadSettings();

    // --- FUNGSI UTAMA: Ambil dan Tampilkan Produk ---
    async function fetchAndDisplayProducts() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Gagal mengambil data produk');
            
            const products = await response.json();
            productTableBody.innerHTML = '';

            if (products.length === 0) {
                productTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada produk.</td></tr>';
            }

            products.forEach(product => {
                const row = `
                    <tr>
                        <td><img src="${product.gambar}" alt="${product.nama}" width="50" height="50" style="object-fit: cover;"></td>
                        <td>${product.nama}</td>
                        <td>Rp ${(product.harga || 0).toLocaleString('id-ID')}</td>
                        <td>${product.stok}</td>
                        <td>
                            <button class="btn btn-sm btn-warning edit-btn" data-id="${product._id}"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${product._id}"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                productTableBody.innerHTML += row;
            });
        } catch (error) {
            productTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${error.message}</td></tr>`;
        }
    }

    // --- FUNGSI 2: Tambah Produk Baru ---
    addProductForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const productData = {
            nama: document.getElementById('nama').value,
            gambar: document.getElementById('gambar').value,
            harga: document.getElementById('harga').value,
            stok: document.getElementById('stok').value,
            deskripsi: document.getElementById('deskripsi').value,
        };
        
        statusDiv.textContent = 'Menambahkan...';
        statusDiv.className = 'alert alert-info';

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            statusDiv.textContent = 'Produk berhasil ditambahkan!';
            statusDiv.className = 'alert alert-success';
            addProductForm.reset();
            fetchAndDisplayProducts();
        } catch (error) {
            statusDiv.textContent = 'Error: ' + error.message;
            statusDiv.className = 'alert alert-danger';
        }
    });

    // --- FUNGSI 3: Menangani Klik di Tabel (untuk Edit dan Delete) ---
    productTableBody.addEventListener('click', async function(event) {
        const target = event.target.closest('button');
        if (!target) return;

        const productId = target.dataset.id;

        // Jika tombol DELETE yang diklik
        if (target.classList.contains('delete-btn')) {
            if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                try {
                    const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message);
                    fetchAndDisplayProducts(); // Muat ulang tabel
                } catch (error) {
                    alert('Gagal menghapus produk: ' + error.message);
                }
            }
        }

        // Jika tombol EDIT yang diklik
        if (target.classList.contains('edit-btn')) {
            try {
                const response = await fetch(`/api/products/${productId}`);
                if (!response.ok) throw new Error('Gagal mengambil detail produk');
                const product = await response.json();
                
                // Isi form di modal dengan data produk
                document.getElementById('edit-productId').value = product._id;
                document.getElementById('edit-nama').value = product.nama;
                document.getElementById('edit-gambar').value = product.gambar;
                document.getElementById('edit-harga').value = product.harga;
                document.getElementById('edit-stok').value = product.stok;
                document.getElementById('edit-deskripsi').value = product.deskripsi;

                editModal.show(); // Tampilkan modal
            } catch (error) {
                 alert('Error: ' + error.message);
            }
        }
    });

    // --- FUNGSI 4: Simpan Perubahan dari Modal Edit ---
    saveEditButton.addEventListener('click', async function() {
        const productId = document.getElementById('edit-productId').value;
        const updatedData = {
            nama: document.getElementById('edit-nama').value,
            gambar: document.getElementById('edit-gambar').value,
            harga: document.getElementById('edit-harga').value,
            stok: document.getElementById('edit-stok').value,
            deskripsi: document.getElementById('edit-deskripsi').value,
        };

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            editModal.hide(); // Sembunyikan modal
            fetchAndDisplayProducts(); // Muat ulang tabel
        } catch (error) {
            alert('Gagal menyimpan perubahan: ' + error.message);
        }
    });

    const token = localStorage.getItem('adminToken');
if (!token) {
    // Jika tidak ada token, paksa kembali ke halaman login
    window.location.href = '/login';
}

// Siapkan header otorisasi untuk semua permintaan API dari halaman ini
const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};



    // Panggil fungsi utama saat halaman dimuat
    fetchAndDisplayProducts();
});
