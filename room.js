// Cuando el Viewer entra por primera vez → auto-sync con Creator
if (!isCreator) {
  const snap = await get(videoRef);
  if (snap.exists()) {
    const videoData = snap.val();

    // Sincronizar tiempo al entrar
    if (player && videoData.time !== undefined) {
      player.seekTo(videoData.time, true);

      // Copiar estado del Creator
      if (videoData.action === "play") {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    }
  }
}

// Botón Align solo visible para viewers
if (!isCreator) {
  const alignBtn = document.getElementById("align-btn");

  alignBtn.addEventListener("click", async () => {
    const snap = await get(videoRef);
    if (snap.exists()) {
      const videoData = snap.val();

      // Sincronizar tiempo cuando haga clic en 🔄
      if (player && videoData.time !== undefined) {
        player.seekTo(videoData.time, true);

        if (videoData.action === "play") {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      }
    }
  });
} else {
  // Ocultar controles extra si eres el creador
  document.getElementById("viewer-controls").style.display = "none";
}
