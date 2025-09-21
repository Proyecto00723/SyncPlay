// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos desde la carpeta /public
app.use(express.static(path.join(__dirname, "public")));

// Evento cuando un cliente se conecta
io.on("connection", (socket) => {
  console.log("✅ Usuario conectado:", socket.id);

  // Chat en tiempo real
  socket.on("chat message", (msg) => {
    io.emit("chat message", { id: socket.id, text: msg });
  });

  // Desconexión
  socket.on("disconnect", () => {
    console.log("❌ Usuario desconectado:", socket.id);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
