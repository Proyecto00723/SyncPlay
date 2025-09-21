// Detectar si es creador desde la URL
const urlParams = new URLSearchParams(window.location.search);
const isCreator = urlParams.get("creator") === "true";
const roomId = urlParams.get("id");

// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDEVWAQ4eIoi2NvbYj7XeFrsgCaiCZj0uc",
  authDomain: "ecosalas-25261.firebaseapp.com",
  databaseURL: "https://ecosalas-25261-default-rtdb.firebaseio.com",
  projectId: "ecosalas-25261",
  storageBucket: "ecosalas-25261.firebasestorage.app",
  messagingSenderId: "406797661209",
  appId: "1:406797661209:web:260d6d3890a4342beba688",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elementos
const iframe = document.getElementById("video-frame");
const controls = document.getElementById("video-controls");

// Si no es creador, ocultar controles
if (!isCreator) {
  controls.style.display = "none";
}

// --- Función para convertir URL a formato embed ---
function getEmbedUrl(url) {
  let videoId = "";

  // Caso: link normal de YouTube (https://www.youtube.com/watch?v=xxxx)
  const normalMatch = url.match(/v=([^&]+)/);
  if (normalMatch) {
    videoId = normalMatch[1];
  }

  // Caso: link corto (https://youtu.be/xxxx)
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) {
    videoId = shortMatch[1];
  }

  if (!videoId) {
    return null; // no válido
  }

  // Devuelve en formato embed con API habilitada
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
}

// --- Escuchar cambios en Firebase ---
onValue(ref(db, "rooms/" + roomId + "/video"), (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const embedUrl = getEmbedUrl(data.url);
  if (!embedUrl) {
    console.error("URL inválida de YouTube:", data.url);
    return;
  }

  // Cargar el video si aún no está cargado
  if (iframe.src !== embedUrl) {
    iframe.src = embedUrl;
  }

  // Aquí después puedes manejar data.action y data.time
  // para sincronizar (ej: play/pause, currentTime)
});

// --- Controles del creador ---
if (isCreator) {
  document.getElementById("play-btn").addEventListener("click", () => {
    set(ref(db, "rooms/" + roomId + "/video"), {
      url: iframe.src,
      action: "play",
      time: 0, // luego puedes reemplazar con currentTime real
    });
  });

  document.getElementById("pause-btn").addEventListener("click", () => {
    set(ref(db, "rooms/" + roomId + "/video"), {
      url: iframe.src,
      action: "pause",
      time: 0,
    });
  });
}
