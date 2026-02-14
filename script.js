import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- Helpers ---
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function redirectUser(role) {
    try {
        localStorage.setItem('wasteless_user_role', role);
        localStorage.setItem('wasteless_is_logged_in', 'true');

        if (role === 'user') {
            window.location.href = 'seller-dashboard.html';
        } else {
            window.location.href = 'buyer-dashboard.html';
        }
    } catch (e) {
        console.error("Storage Error:", e);
        // Fallback redirect even if storage fails
        window.location.href = role === 'user' ? 'seller-dashboard.html' : 'buyer-dashboard.html';
    }
}

// --- Navigation Logic ---

function selectRole(role) {
    const roleSelection = document.getElementById('role-selection');
    const userAuth = document.getElementById('user-auth');
    const buyerAuth = document.getElementById('buyer-auth');

    if (!roleSelection || !userAuth || !buyerAuth) return;

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
    const roleSelection = document.getElementById('role-selection');
    const userAuth = document.getElementById('user-auth');
    const buyerAuth = document.getElementById('buyer-auth');

    if (!roleSelection || !userAuth || !buyerAuth) return;

    userAuth.classList.add('hidden');
    buyerAuth.classList.add('hidden');
    roleSelection.classList.remove('hidden');
    roleSelection.classList.add('fade-in');
}

function toggleForm(role, type) {
    const title = document.getElementById(`${role}-form-title`);
    const loginForm = document.getElementById(`${role}-login-form`);
    const registerForm = document.getElementById(`${role}-register-form`);

    if (!title || !loginForm || !registerForm) return;

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

// --- Auth Logic ---

async function handleRegister(e, role) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value;
    const name = form.querySelector('input[type="text"]').value;

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const btn = form.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = "Creating Account...";
    btn.disabled = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            role: role,
            createdAt: new Date().toISOString()
        });

        alert(`Registration Successful as ${capitalize(role)}!`);
        redirectUser(role);
    } catch (error) {
        console.error("Registration Error:", error);
        let errorMsg = error.message;
        if (error.code === 'auth/email-already-in-use') {
            errorMsg = "This email is already registered. Please login instead.";
        }
        alert("Registration Error: " + errorMsg);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function handleLogin(e, role) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    const btn = form.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = "Logging in...";
    btn.disabled = true;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            redirectUser(userData.role);
        } else {
            redirectUser(role);
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login Error: " + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// --- Initialize ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Wasteless Login Init...");

    // Role Selection
    document.getElementById('select-user-role')?.addEventListener('click', () => selectRole('user'));
    document.getElementById('select-buyer-role')?.addEventListener('click', () => selectRole('buyer'));

    // Back Buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', showRoles);
    });

    // Form Switchers
    document.getElementById('switch-to-user-register')?.addEventListener('click', () => toggleForm('user', 'register'));
    document.getElementById('switch-to-user-login')?.addEventListener('click', () => toggleForm('user', 'login'));
    document.getElementById('switch-to-buyer-register')?.addEventListener('click', () => toggleForm('buyer', 'register'));
    document.getElementById('switch-to-buyer-login')?.addEventListener('click', () => toggleForm('buyer', 'login'));

    // Auth Forms
    document.getElementById('user-login-form')?.addEventListener('submit', (e) => handleLogin(e, 'user'));
    document.getElementById('user-register-form')?.addEventListener('submit', (e) => handleRegister(e, 'user'));
    document.getElementById('buyer-login-form')?.addEventListener('submit', (e) => handleLogin(e, 'buyer'));
    document.getElementById('buyer-register-form')?.addEventListener('submit', (e) => handleRegister(e, 'buyer'));

    // Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
