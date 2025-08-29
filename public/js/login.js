// public/js/login.js
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const statusDiv = document.getElementById('login-status');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }
        
        // Simpan token di browser
        localStorage.setItem('adminToken', data.token);

        // Arahkan ke halaman admin
        window.location.href = '/admin.html';

    } catch (error) {
        statusDiv.textContent = error.message;
        statusDiv.className = 'alert alert-danger';
    }
});