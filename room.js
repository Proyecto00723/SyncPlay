// Detectar si es creador desde la URL
const urlParams = new URLSearchParams(window.location.search);
const isCreator = urlParams.get("creator") === "true";

// Ocultar controles si es espectador (Viewer)
if (!isCreator) {
  const controls = document.getElementById("video-controls");
  if (controls) {
    controls.style.display = "none";
  }
}
