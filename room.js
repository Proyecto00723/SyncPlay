// Detectar si es creador desde la URL
const urlParams = new URLSearchParams(window.location.search);
const isCreator = urlParams.get("creator") === "true";

// Referencias
const controls = document.getElementById("video-controls");
const alignBtn = document.getElementById("align-btn");
const userNameSpan = document.getElementById("user-name");

// Ocultar controles si es espectador
if (!isCreator) {
  if (controls) controls.style.display = "none";
  if (alignBtn) alignBtn.classList.remove("hidden"); // Mostrar Align solo Viewer
}

// Asignar nombre inicial con emoji
let userName = isCreator ? "👑 Creator" : "🙋 Viewer";
userNameSpan.textContent = userName;

// Editar nombre al hacer click
userNameSpan.addEventListener("click", () => {
  const newName = prompt("Escribe tu nuevo nombre (máx. 13 caracteres):", userName.replace("👑 ", "").replace("🙋 ", ""));
  if (newName !== null) {
    const trimmed = newName.trim().slice(0, 13); // Máx 13
    userName = (isCreator ? "👑 " : "🙋 ") + (trimmed || (isCreator ? "Creator" : "Viewer"));
    userNameSpan.textContent = userName;

    // 🔥 Guardar nombre en Firebase para el chat
    const userRef = ref(db, `rooms/${roomId}/users/${socketId}`); 
    set(userRef, { name: userName });
  }
});

// Función para alinear con el Creator (solo viewers)
if (!isCreator && alignBtn) {
  alignBtn.addEventListener("click", () => {
    get(videoRef).then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data && data.time !== undefined) {
          player.seekTo(data.time, true); // Sincronizar tiempo exacto
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
