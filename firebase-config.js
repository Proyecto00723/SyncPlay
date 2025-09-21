// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

// --- Firebase config (centralizado) ---
const firebaseConfig = {
  apiKey: "AIzaSyDEVWAQ4eIoi2NvbYj7XeFrsgCaiCZj0uc",
  authDomain: "ecosalas-25261.firebaseapp.com",
  databaseURL: "https://ecosalas-25261-default-rtdb.firebaseio.com",
  projectId: "ecosalas-25261",
  storageBucket: "ecosalas-25261.firebasestorage.app",
  messagingSenderId: "406797661209",
  appId: "1:406797661209:web:260d6d3890a4342beba688",
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
