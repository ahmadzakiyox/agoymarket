document.addEventListener('DOMContentLoaded', function() {
    // Di versi ini, kita tidak lagi menggunakan cookie-parser di sisi server,
    // jadi kita kembali menggunakan token dari localStorage.
    
    // --- Proteksi Klien dengan Pop-up ---
    const token = localStorage.getItem('adminToken');

    // Siapkan header otorisasi untuk semua permintaan API
    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // --- Element Selectors ---
    const productTableBody = document.getElementById('product-table-body');
    const addProductForm = document.getElementById('addProductForm');
    const statusDiv = document.getElementById('status');
    const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    const saveEditButton = document.getElementById('saveEditButton');
    const logoutButton = document.getElementById('logoutButton');
    
    // --- Fungsi Pengecekan Utama ---
    async function checkAdminStatusAndFetchProducts() {
        // Jika tidak ada token sama sekali di browser, langsung usir.
        if (!token) {
            alert('Anda bukan Admin! Anda akan dialihkan ke halaman login.');
            window.location.href = '/login';
            return;
        }

        try {
            // Coba ambil data produk (ini akan melewati authMiddleware di server)
            const response = await fetch('/api/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Jika token tidak valid (server menolak dengan 401/403)
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken'); // Hapus token yang tidak valid
                alert('Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.');
                window.location.href = '/login';
                return;
            }
            if (!response.ok) throw new Error('Gagal mengambil data produk');
            
            const products = await response.json();
            renderProducts(products); // Jika berhasil, tampilkan produk

        } catch (error) {
            console.error(error);
        }
    }

    function renderProducts(products) {
        productTableBody.innerHTML = '';
        if (products.length === 0) {
            productTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada produk.</td></tr>';
            return;
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
                </tr>`;
            productTableBody.innerHTML += row;
        });
    }

    // --- Logika Tombol Logout ---
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
    });
    
    // ... (Semua kode untuk Tambah, Edit, Delete, dan Settings tetap sama persis)
    // Cukup pastikan semua 'fetch' di dalamnya menggunakan 'authHeaders'
    
    // --- Panggil Fungsi Pengecekan Saat Halaman Dimuat ---
    checkAdminStatusAndFetchProducts();

    // --- (Salin sisa fungsi Anda dari file admin.js sebelumnya ke sini) ---
    // Contoh: addProductForm.addEventListener(...) , productTableBody.addEventListener(...) , dll.
    // Pastikan semua fetch di dalamnya menggunakan 'headers: authHeaders'
});
