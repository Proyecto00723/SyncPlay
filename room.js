// Detectar si es creador desde la URL
const urlParams = new URLSearchParams(window.location.search);
const isCreator = urlParams.get("creator") === "true";

// Ocultar controles si es espectador
if (!isCreator) {
  document.getElementById("video-controls").style.display = "none";
}
