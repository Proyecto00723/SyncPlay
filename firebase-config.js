// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

// --- Firebase config (centralizado) ---
const firebaseConfig = {
  apiKey: "AIzaSyDwird5A7fTnSD3JA7HgHNJhVOi3yiPVwU",
  authDomain: "stylish-steps.firebaseapp.com",
  databaseURL: "https://stylish-steps-default-rtdb.firebaseio.com",
  projectId: "stylish-steps",
  storageBucket: "stylish-steps.firebasestorage.app",
  messagingSenderId: "580730135694",
  appId: "1:580730135694:web:3d77bfef3af246f9c755df",
  measurementId: "G-21F9WH2PZT"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);

