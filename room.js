// ===============================
// 🎬 SYNCPLAY ROOM.JS
// ===============================

// Detectar si es creador desde la URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("id");
const isCreator = urlParams.get("creator") === "true";

// Referencias a elementos
const controls = document.getElementById("video-controls");
const alignBtn = document.getElementById("align-btn");
const userNameSpan = document.getElementById("user-name");
const leaveBtn = document.getElementById("leave-room");

// Ocultar controles si es espectador
if (!isCreator) {
  if (controls) controls.style.display = "none";
  if (alignBtn) alignBtn.classList.remove("hidden"); // Mostrar Align solo a Viewer
}

// Asignar nombre inicial con emoji
let userName = isCreator ? "👑 Creator" : "🙋 Viewer";
userNameSpan.textContent = userName;

// === Editar nombre al hacer click ===
userNameSpan.addEventListener("click", () => {
  const newName = prompt(
    "Escribe tu nuevo nombre (máx. 13 caracteres):",
    userName.replace("👑 ", "").replace("🙋 ", "")
  );
  if (newName !== null) {
    const trimmed = newName.trim().slice(0, 13); // Máx 13 caracteres
    userName = (isCreator ? "👑 " : "🙋 ") + (trimmed || (isCreator ? "Creator" : "Viewer"));
    userNameSpan.textContent = userName;

    // 🔥 Guardar nombre en Firebase (opcional)
    if (typeof db !== "undefined" && typeof ref !== "undefined" && typeof set !== "undefined") {
      const userRef = ref(db, `rooms/${roomId}/users/${socketId}`);
      set(userRef, { name: userName });
    }
  }
});

// === Alinear con el Creator (solo viewers) ===
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

// === Salir de la sala ===
if (leaveBtn) {
  leaveBtn.addEventListener("click", () => {
    const confirmExit = confirm("¿Seguro que deseas salir de la sala?");
    if (confirmExit) {
      window.location.href = "index.html";
    }
  });
}

// ===============================
// 💬 CHAT FLOTANTE
// ===============================
const chatButton = document.createElement("button");
chatButton.textContent = "💬 Chat";
chatButton.className = "fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg";
document.body.appendChild(chatButton);

const chatBox = document.createElement("div");
chatBox.className =
  "hidden fixed bottom-16 right-4 bg-white rounded-2xl shadow-2xl w-80 max-h-[70vh] flex flex-col";
chatBox.innerHTML = `
  <div class="bg-blue-600 text-white text-center py-2 rounded-t-2xl font-semibold">Chat de Sala</div>
  <div id="chat-messages" class="flex-1 overflow-y-auto p-3 text-sm"></div>
  <div class="flex border-t">
    <input id="chat-input" type="text" placeholder="Escribe un mensaje..." class="flex-1 p-2 outline-none rounded-bl-2xl">
    <button id="send-btn" class="bg-blue-600 text-white px-4 rounded-br-2xl">Enviar</button>
  </div>
`;
document.body.appendChild(chatBox);

// Mostrar / ocultar chat
chatButton.addEventListener("click", () => {
  chatBox.classList.toggle("hidden");
});

// Función de envío de mensaje (simulada)
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(name, message) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "my-1";
  msgDiv.innerHTML = `<strong>${name}:</strong> ${message}`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.addEventListener("click", () => {
  const message = chatInput.value.trim();
  if (message) {
    addMessage(userName, message);
    chatInput.value = "";
  }
});

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// ===============================
// 🎤 BASE PARA CHAT DE VOZ (futuro)
// ===============================
// Puedes usar WebRTC o una API como Daily, Agora o Twilio para
// habilitar voz. Aquí se deja la estructura base:

function startVoiceChat() {
  alert("🎙️ Chat de voz próximamente (en desarrollo)");
}

// Puedes agregar un botón si quieres probar:
const voiceBtn = document.createElement("button");
voiceBtn.textContent = "🎙️ Voz";
voiceBtn.className = "fixed bottom-4 right-24 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg";
voiceBtn.addEventListener("click", startVoiceChat);
document.body.appendChild(voiceBtn);
