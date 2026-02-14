// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Replace the following with your app's Git configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "AIzaSyDNEDGX2K7KpJpiPoiPG6_-IZEuh2AqO98",
    authDomain: "wasteless-20ac3.firebaseapp.com",
    databaseURL: "https://wasteless-20ac3-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wasteless-20ac3",
    storageBucket: "wasteless-20ac3.firebasestorage.app",
    messagingSenderId: "391784570572",
    appId: "1:391784570572:web:238dc1015cdaab28e7ac69"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
