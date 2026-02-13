// --- DOM Elements ---
const roleSelection = document.getElementById('role-selection');
const userAuth = document.getElementById('user-auth');
const buyerAuth = document.getElementById('buyer-auth');

// --- Navigation Logic ---

function selectRole(role) {
    roleSelection.classList.add('hidden');
    if (role === 'user') {
        userAuth.classList.remove('hidden');
        userAuth.classList.add('fade-in');
    } else {
        buyerAuth.classList.remove('hidden');
        buyerAuth.classList.add('fade-in');
    }
}

function showRoles() {
    userAuth.classList.add('hidden');
    buyerAuth.classList.add('hidden');
    roleSelection.classList.remove('hidden');
    roleSelection.classList.add('fade-in');
}

function toggleForm(role, type) {
    const title = document.getElementById(`${role}-form-title`);
    const loginForm = document.getElementById(`${role}-login-form`);
    const registerForm = document.getElementById(`${role}-register-form`);

    if (type === 'register') {
        title.textContent = `${capitalize(role)} Registration`;
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        registerForm.classList.add('fade-in');
    } else {
        title.textContent = `${capitalize(role)} Login`;
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        loginForm.classList.add('fade-in');
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Auth Logic (Mock Backend) ---

function handleAuth(e, role, type) {
    e.preventDefault();
    const form = e.target;
    // In a real app, collect FormData here

    // Simulate API Call
    const btn = form.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = "Processing...";
    btn.disabled = true;

    setTimeout(() => {
        // Mock Success
        alert(`${type === 'login' ? 'Login' : 'Registration'} Successful as ${capitalize(role)}!`);

        // Save Session
        localStorage.setItem('wasteless_user_role', role);
        localStorage.setItem('wasteless_is_logged_in', 'true');

        // Redirect
        if (role === 'user') {
            window.location.href = 'seller-dashboard.html';
        } else {
            window.location.href = 'buyer-dashboard.html';
        }
    }, 300); // Fast 300ms transition
}

// --- Event Listeners ---

// User Forms
document.getElementById('user-login-form').addEventListener('submit', (e) => handleAuth(e, 'user', 'login'));
document.getElementById('user-register-form').addEventListener('submit', (e) => handleAuth(e, 'user', 'register'));

// Buyer Forms
document.getElementById('buyer-login-form').addEventListener('submit', (e) => handleAuth(e, 'buyer', 'login'));
document.getElementById('buyer-register-form').addEventListener('submit', (e) => handleAuth(e, 'buyer', 'register'));
