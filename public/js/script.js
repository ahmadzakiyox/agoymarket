// public/js/script.js
document.addEventListener('DOMContentLoaded', async function() {
    const productList = document.getElementById('productList');

    async function fetchProducts() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Gagal memuat produk');
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            if(productList) productList.innerHTML = `<p class="text-danger">${error.message}</p>`;
        }
    }

    function renderProducts(products) {
        if(!productList) return;
        productList.innerHTML = '';
        if (products.length === 0) {
            productList.innerHTML = '<p>Belum ada produk.</p>';
            return;
        }
        products.forEach(product => {
            const hargaCoretHTML = product.hargaCoret ? `<span class="price-original"><s>Rp ${product.hargaCoret.toLocaleString('id-ID')}</s></span>` : '';
            const productCardHTML = `
                <div class="col-6 col-md-4 col-lg-5ths product-item reveal">
                    <div class="card product-card">
                        <a href="/product-detail.html?id=${product._id}" class="text-decoration-none">
                            <img src="${product.gambar}" class="card-img-top" alt="${product.nama}" style="height: 200px; object-fit: cover;">
                            <div class="card-body">
                                <h6 class="card-title product-name">${product.nama}</h6>
                                <div class="price-wrap">
                                    ${hargaCoretHTML}
                                    <span class="price-final">Rp ${(product.harga || 0).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            `;
            productList.innerHTML += productCardHTML;
        });
        setupAnimations();
    }
    
    function setupAnimations() {
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => revealObserver.observe(el));
    }

    fetchProducts();
});