document.addEventListener('DOMContentLoaded', function() {
    // --- Page Protection & Token Setup ---
    const token = localStorage.getItem('adminToken');
    if (!token) {
        // Redirect to login page if no token is found
        window.location.href = '/login';
        return; // Stop script execution
    }

    // Prepare authorization headers for all API requests
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
    const settingsForm = document.getElementById('settingsForm');
    const settingsStatusDiv = document.getElementById('settings-status');
    const whatsappInput = document.getElementById('whatsappNumber');
    const telegramInput = document.getElementById('telegramUsername');

    // --- Main Function: Fetch and Display Products ---
    async function fetchAndDisplayProducts() {
        try {
            const response = await fetch('/api/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // If token is invalid or expired, redirect to login
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken');
                window.location.href = '/login';
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch products');

            const products = await response.json();
            productTableBody.innerHTML = ''; // Clear table before populating

            if (products.length === 0) {
                productTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No products found.</td></tr>';
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
        } catch (error) {
            productTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${error.message}</td></tr>`;
        }
    }

    // --- Add New Product ---
    addProductForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const productData = {
            nama: document.getElementById('nama').value,
            gambar: document.getElementById('gambar').value,
            harga: document.getElementById('harga').value,
            stok: document.getElementById('stok').value,
            deskripsi: document.getElementById('deskripsi').value,
        };

        statusDiv.textContent = 'Adding...';
        statusDiv.className = 'alert alert-info';
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(productData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            statusDiv.textContent = 'Product added successfully!';
            statusDiv.className = 'alert alert-success';
            addProductForm.reset();
            fetchAndDisplayProducts(); // Refresh the table
        } catch (error) {
            statusDiv.textContent = 'Error: ' + error.message;
            statusDiv.className = 'alert alert-danger';
        }
    });

    // --- Handle Edit and Delete Button Clicks ---
    productTableBody.addEventListener('click', async function(event) {
        const target = event.target.closest('button');
        if (!target) return;

        const productId = target.dataset.id;

        // Handle Delete
        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this product?')) {
                try {
                    const response = await fetch(`/api/products/${productId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message);
                    fetchAndDisplayProducts(); // Refresh the table
                } catch (error) {
                    alert('Failed to delete product: ' + error.message);
                }
            }
        }

        // Handle Edit
        if (target.classList.contains('edit-btn')) {
            try {
                const response = await fetch(`/api/products/${productId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch product details');
                const product = await response.json();

                document.getElementById('edit-productId').value = product._id;
                document.getElementById('edit-nama').value = product.nama;
                document.getElementById('edit-gambar').value = product.gambar;
                document.getElementById('edit-harga').value = product.harga;
                document.getElementById('edit-stok').value = product.stok;
                document.getElementById('edit-deskripsi').value = product.deskripsi;
                editModal.show(); // Show the modal with populated data
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    });

    // --- Save Changes from Edit Modal ---
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
                headers: authHeaders,
                body: JSON.stringify(updatedData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            editModal.hide();
            fetchAndDisplayProducts(); // Refresh the table
        } catch (error) {
            alert('Failed to save changes: ' + error.message);
        }
    });

    // --- Contact Settings ---
    async function loadSettings() {
        try {
            const response = await fetch('/api/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to load settings');
            const settings = await response.json();
            whatsappInput.value = settings.whatsappNumber ? settings.whatsappNumber.replace(/^62/, '') : '';
            telegramInput.value = settings.telegramUsername || '';
        } catch (error) {
            console.error('Failed to load settings:', error);
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
        settingsStatusDiv.textContent = 'Saving...';
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(settingsData)
            });
            if (!response.ok) throw new Error('Failed to save');
            const result = await response.json();
            settingsStatusDiv.textContent = 'Settings saved successfully!';
            settingsStatusDiv.className = 'alert alert-success';
        } catch (error) {
            settingsStatusDiv.textContent = 'Error: ' + error.message;
            settingsStatusDiv.className = 'alert alert-danger';
        }
    });

    // --- Logout ---
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
    });

    // --- Initial Calls on Page Load ---
    fetchAndDisplayProducts();
    loadSettings();
});
