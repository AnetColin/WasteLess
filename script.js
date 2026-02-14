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

// --- DOM Elements ---
const roleSelection = document.getElementById('role-selection');
const userAuth = document.getElementById('user-auth');
const buyerAuth = document.getElementById('buyer-auth');

// --- Navigation Logic --- (Exposed to window for inline onclicks)

window.selectRole = function (role) {
    roleSelection.classList.add('hidden');
    if (role === 'user') {
        userAuth.classList.remove('hidden');
        userAuth.classList.add('fade-in');
    } else {
        buyerAuth.classList.remove('hidden');
        buyerAuth.classList.add('fade-in');
    }
}

window.showRoles = function () {
    userAuth.classList.add('hidden');
    buyerAuth.classList.add('hidden');
    roleSelection.classList.remove('hidden');
    roleSelection.classList.add('fade-in');
}

window.toggleForm = function (role, type) {
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

// --- Auth Logic (Real Firebase Backend) ---

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
    btn.textContent = "Creating Account...";
    btn.disabled = true;

    try {
        // 1. Create User in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Store Role and Name in Firestore
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
        alert("Registration Error: " + errorMsg + "\n\nTip: Make sure you have created a 'Cloud Firestore' database in your Firebase Console and set the rules to allow writes.");
    } finally {
        btn.textContent = "Register";
        btn.disabled = false;
    }
}

async function handleLogin(e, role) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    const btn = form.querySelector('button');
    btn.textContent = "Logging in...";
    btn.disabled = true;

    try {
        // 1. Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Verify Role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role !== role) {
                alert(`Warning: You are registered as a ${userData.role}, but logging in as a ${role}.`);
            }
            redirectUser(userData.role);
        } else {
            console.warn("User document not found in Firestore.");
            redirectUser(role);
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login Error: " + error.message);
    } finally {
        btn.textContent = "Login";
        btn.disabled = false;
    }
}

function redirectUser(role) {
    localStorage.setItem('wasteless_user_role', role);
    localStorage.setItem('wasteless_is_logged_in', 'true');

    if (role === 'user') {
        window.location.href = 'seller-dashboard.html';
    } else {
        window.location.href = 'buyer-dashboard.html';
    }
}

// --- Event Listeners ---

document.getElementById('user-login-form').addEventListener('submit', (e) => handleLogin(e, 'user'));
document.getElementById('user-register-form').addEventListener('submit', (e) => handleRegister(e, 'user'));
document.getElementById('buyer-login-form').addEventListener('submit', (e) => handleLogin(e, 'buyer'));
document.getElementById('buyer-register-form').addEventListener('submit', (e) => handleRegister(e, 'buyer'));
