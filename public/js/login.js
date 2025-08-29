document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const statusDiv = document.getElementById('login-status');
    statusDiv.textContent = '';
    statusDiv.className = '';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login gagal');
        }
        
        // Simpan token di browser (local storage)
        localStorage.setItem('adminToken', data.token);

        // Arahkan ke halaman admin yang diproteksi
        window.location.href = '/admin';

    } catch (error) {
        statusDiv.textContent = error.message;
        statusDiv.className = 'alert alert-danger';
    }
});
