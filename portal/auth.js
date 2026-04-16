const API_URL = 'http://localhost:3000/api';
const ADMIN_PORT = 5173;
const SUPPLIER_PORT = 5300;

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('error-msg');
const submitBtn = document.getElementById('submitBtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    submitBtn.classList.add('loading');

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login, password })
        });

        const result = await response.json();

        if (result.success) {
            const { user, tokens } = result.data;
            const userDataBase64 = btoa(JSON.stringify(user));
            
            let redirectUrl = '';
            
            // Redirection selon le rôle
            if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'staff') {
                redirectUrl = `http://localhost:${ADMIN_PORT}/?token=${tokens.accessToken}&user=${userDataBase64}`;
            } else if (user.role === 'supplier') {
                redirectUrl = `http://localhost:${SUPPLIER_PORT}/?token=${tokens.accessToken}&user=${userDataBase64}`;
            } else {
                errorMsg.textContent = "Ce rôle n'est pas autorisé sur le portail web. Utilisez l'application mobile.";
                submitBtn.classList.remove('loading');
                return;
            }

            // Rediriger
            window.location.href = redirectUrl;

        } else {
            errorMsg.textContent = result.message || 'Identifiants incorrects';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMsg.textContent = 'Erreur de connexion au serveur.';
    } finally {
        submitBtn.classList.remove('loading');
    }
});
