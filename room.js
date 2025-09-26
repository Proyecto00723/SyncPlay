// --- Detectar si es creador ---
const urlParams = new URLSearchParams(window.location.search);
const isCreator = urlParams.get("creator") === "true";

// Referencias DOM
const controls = document.getElementById("video-controls");
const alignBtn = document.getElementById("align-btn");
const userNameSpan = document.getElementById("user-name");
const toggleMicBtn = document.getElementById("toggle-mic");
const muteAllBtn = document.getElementById("mute-all");

// Ocultar controles si es espectador
if (!isCreator) {
  if (controls) controls.style.display = "none";
  if (alignBtn) alignBtn.classList.remove("hidden"); // Mostrar Align solo Viewer
} else {
  muteAllBtn.classList.remove("hidden");
}

// --- Firebase ---
import { getDatabase, ref, set, push, onValue, update } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
const db = getDatabase();

// ID sala y usuario
const roomId = urlParams.get("id");
const userId = Math.random().toString(36).substring(2, 10);

// Nombre inicial
let userName = isCreator ? "👑 Creator" : "🙋 Viewer";
userNameSpan.textContent = userName;

// Editar nombre
userNameSpan.addEventListener("click", () => {
  const newName = prompt("Escribe tu nuevo nombre (máx. 13 caracteres):", userName.replace("👑 ", "").replace("🙋 ", ""));
  if (newName !== null) {
    const trimmed = newName.trim().slice(0, 13);
    userName = (isCreator ? "👑 " : "🙋 ") + (trimmed || (isCreator ? "Creator" : "Viewer"));
    userNameSpan.textContent = userName;
    update(ref(db, `rooms/${roomId}/userList/${userId}`), { name: userName });
  }
});

// --- Audio con WebRTC ---
let micEnabled = true;
let localStream;
const peers = {}; // conexiones activas

async function initAudio() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (!micEnabled) {
      localStream.getTracks().forEach(t => t.enabled = false);
    }
  } catch (err) {
    console.error("❌ No se pudo acceder al micrófono", err);
  }
}

// Crear conexión P2P
function createPeer(remoteId) {
  const pc = new RTCPeerConnection();

  // Agregar nuestro audio
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  // Reproducir audio remoto
  pc.ontrack = (event) => {
    let audio = document.getElementById("audio-" + remoteId);
    if (!audio) {
      audio = document.createElement("audio");
      audio.id = "audio-" + remoteId;
      audio.autoplay = true;
      document.body.appendChild(audio);
    }
    audio.srcObject = event.streams[0];
  };

  // Guardar ICE en Firebase
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      push(ref(db, `rooms/${roomId}/candidates/${userId}/${remoteId}`), event.candidate.toJSON());
    }
  };

  peers[remoteId] = pc;
  return pc;
}

// Toggle mic manual
toggleMicBtn.addEventListener("click", () => {
  micEnabled = !micEnabled;
  if (localStream) {
    localStream.getTracks().forEach(t => (t.enabled = micEnabled));
  }
  const icon = toggleMicBtn.querySelector("i");
  icon.classList.toggle("fa-microphone", micEnabled);
  icon.classList.toggle("fa-microphone-slash", !micEnabled);
});

// Mute all (solo creador)
muteAllBtn.addEventListener("click", () => {
  set(ref(db, `rooms/${roomId}/muteAll`), true);
});

// Escuchar muteAll
onValue(ref(db, `rooms/${roomId}/muteAll`), (snap) => {
  if (snap.val() === true) {
    micEnabled = false;
    if (localStream) {
      localStream.getTracks().forEach(t => (t.enabled = false));
    }
    const icon = toggleMicBtn.querySelector("i");
    icon.classList.remove("fa-microphone");
    icon.classList.add("fa-microphone-slash");
  }
});

// Iniciar audio
initAudio();

// --- Función Align video ---
if (!isCreator && alignBtn) {
  alignBtn.addEventListener("click", () => {
    get(videoRef).then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data && data.time !== undefined) {
          player.seekTo(data.time, true);
          if (data.action === "play") {
            player.playVideo();
          } else {
            player.pauseVideo();
          }
        }
      }
    });
  });
}
