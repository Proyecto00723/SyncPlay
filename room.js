```js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, runTransaction, update, get, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

// --- Parámetros URL
const params = new URLSearchParams(window.location.search);
let roomId = params.get("id");
const isCreator = params.get("creator") === "true";

if (!roomId) {
  alert("❌ No room ID provided");
  window.location.href = "index.html";
}
document.getElementById("room-id-display").innerText = "Room: " + roomId;

// --- Nombre usuario
let userName = isCreator ? "👑 Creator" : "🙋 Viewer";
const userId = Math.random().toString(36).substring(2, 10);

const userNameSpan = document.getElementById("user-name");
userNameSpan.textContent = userName;

userNameSpan.addEventListener("click", () => {
  const newName = prompt("Escribe tu nuevo nombre (máx. 13 caracteres):", userName.replace("👑 ", "").replace("🙋 ", ""));
  if (newName !== null) {
    const trimmed = newName.trim().slice(0, 13);
    userName = (isCreator ? "👑 " : "🙋 ") + (trimmed || (isCreator ? "Creator" : "Viewer"));
    userNameSpan.textContent = userName;
    update(ref(db, `rooms/${roomId}/userList/${userId}`), { name: userName });
  }
});

// --- Lista usuarios
const userCountRef = ref(db, `rooms/${roomId}/users`);
runTransaction(userCountRef, (current) => (current || 0) + 1);

const userListRef = ref(db, `rooms/${roomId}/userList/${userId}`);
set(userListRef, { name: userName, muted: false });

onValue(userCountRef, (snap) => {
  document.getElementById("user-count").innerText = (snap.val() || 0) + " online";
});

window.addEventListener("beforeunload", () => {
  runTransaction(userCountRef, (current) => (current || 1) - 1);
  remove(userListRef);
});

// --- Modal de usuarios
const userModal = document.getElementById("user-modal");
const userListDiv = document.getElementById("user-list");

document.getElementById("user-count").addEventListener("click", () => {
  userModal.classList.remove("hidden");
});
document.getElementById("close-modal").addEventListener("click", () => {
  userModal.classList.add("hidden");
});

onValue(ref(db, `rooms/${roomId}/userList`), (snap) => {
  userListDiv.innerHTML = "";
  snap.forEach((child) => {
    const data = child.val();
    const div = document.createElement("div");
    div.className = "flex justify-between items-center bg-slate-700 p-2 rounded";

    div.innerHTML = `
      <span>${data.name}</span>
      ${isCreator ? `
      <div class="flex gap-2">
        <button data-id="${child.key}" class="mute-btn bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs">
          ${data.muted ? "Unmute" : "Mute"}
        </button>
        <button data-expel="${child.key}" class="expel-btn bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs">
          Expulsar
        </button>
      </div>` : ""}
    `;

    userListDiv.appendChild(div);
  });

  if (isCreator) {
    // --- Botón Mute/Unmute
    document.querySelectorAll(".mute-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.dataset.id;
        const newState = btn.textContent === "Mute";
        update(ref(db, `rooms/${roomId}/userList/${uid}`), { muted: newState });
      });
    });

    // --- Botón Expulsar
    document.querySelectorAll(".expel-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.dataset.expel;
        set(ref(db, `rooms/${roomId}/expelled/${uid}`), true);

        // Cambiar RoomID después de expulsar
        const newRoomId = Math.random().toString(36).substring(2, 8);
        set(ref(db, `rooms/${newRoomId}`), { users: 0 });
        document.getElementById("room-id-display").innerText = "Room: " + newRoomId;
        alert("🔄 Nuevo Room creado: " + newRoomId);
      });
    });
  }
});

// --- Detección expulsión (lado cliente)
const expelledRef = ref(db, `rooms/${roomId}/expelled/${userId}`);
onValue(expelledRef, (snap) => {
  if (snap.val() === true) {
    alert("Has sido expulsado de la sala.");
    window.location.href = "index.html";
  }
});

// --- Audio Controls ---
let micEnabled = true;
const toggleMicBtn = document.getElementById("toggle-mic");
const muteAllBtn = document.getElementById("mute-all");

if (isCreator) {
  muteAllBtn.classList.remove("hidden");
}

toggleMicBtn.addEventListener("click", () => {
  micEnabled = !micEnabled;
  const icon = toggleMicBtn.querySelector("i");
  if (micEnabled) {
    icon.classList.remove("fa-microphone-slash");
    icon.classList.add("fa-microphone");
  } else {
    icon.classList.remove("fa-microphone");
    icon.classList.add("fa-microphone-slash");
  }
});

muteAllBtn.addEventListener("click", () => {
  set(ref(db, `rooms/${roomId}/muteAll`), true);
});

onValue(ref(db, `rooms/${roomId}/muteAll`), (snap) => {
  if (snap.val() === true) {
    micEnabled = false;
    const icon = toggleMicBtn.querySelector("i");
    icon.classList.remove("fa-microphone");
    icon.classList.add("fa-microphone-slash");
  }
});

// --- Leave room
document.getElementById("leave-room").addEventListener("click", () => {
  window.location.href = "index.html";
});
```
