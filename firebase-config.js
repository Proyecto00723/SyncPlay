// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

// --- Firebase config (centralizado) ---
const firebaseConfig = {
  apiKey: "AIzaSyAejrbK9T57bdc5MpYRzvioWdWUKyBOR4Q",
  authDomain: "ventas-tecnologicas-fe784.firebaseapp.com",
  databaseURL: "https://ventas-tecnologicas-fe784-default-rtdb.firebaseio.com",
  projectId: "ventas-tecnologicas-fe784",
  storageBucket: "ventas-tecnologicas-fe784.firebasestorage.app",
  messagingSenderId: "673551715331",
  appId: "1:673551715331:web:830ec279ac978ccf711236"
};
// Inicializar Firebase
export const app = initializeApp(firebaseConfig);








