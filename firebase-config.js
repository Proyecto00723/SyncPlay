// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

// --- Firebase config (centralizado) ---
const firebaseConfig = {
  apiKey: "AIzaSyBQyCiEDDFE1qfCphr3-fE7MPwJ7nLoQss",
  authDomain: "syncplay-c6b2a.firebaseapp.com",
  databaseURL: "https://syncplay-c6b2a-default-rtdb.firebaseio.com",
  projectId: "syncplay-c6b2a",
  storageBucket: "syncplay-c6b2a.firebasestorage.app",
  messagingSenderId: "484954878226",
  appId: "1:484954878226:web:83e8ce3d502e0ab2d343cb"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);






