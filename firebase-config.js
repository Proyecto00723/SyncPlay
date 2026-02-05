// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

// --- Firebase config (centralizado) ---
const firebaseConfig = {
  apiKey: "AIzaSyBpUX-bHM7tO6azpEPj2-56k9QfZhkttkw",
  authDomain: "stylishsteps-b67e8.firebaseapp.com",
  databaseURL: "https://stylishsteps-b67e8-default-rtdb.firebaseio.com",
  projectId: "stylishsteps-b67e8",
  storageBucket: "stylishsteps-b67e8.firebasestorage.app",
  messagingSenderId: "855401239447",
  appId: "1:855401239447:web:a0d9ca75fec39f3a21ead2",
  measurementId: "G-HV24CLYXRF"
};
// Inicializar Firebase
export const app = initializeApp(firebaseConfig);








