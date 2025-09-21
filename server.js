// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, "public")));

// Guardar estado de cada sala
const rooms = {};

// Evento cuando un cliente se conecta
io.on("connection", (socket) => {
  console.log("✅ Usuario conectado:", socket.id);

  // Unirse a una sala
  socket.on("join room", (roomId) => {
    socket.join(roomId);
    console.log(`👥 Usuario ${socket.id} entró a sala ${roomId}`);

    // Si ya hay estado guardado en la sala → enviarlo al nuevo usuario
    if (rooms[roomId]) {
      socket.emit("video state", rooms[roomId]);
    }
  });

  // Chat en tiempo real
  socket.on("chat message", ({ roomId, msg }) => {
    io.to(roomId).emit("chat message", { id: socket.id, text: msg });
  });

  // Cuando el creador actualiza el video
  socket.on("video update", ({ roomId, state }) => {
    rooms[roomId] = state; // guardar último estado
    io.to(roomId).emit("video state", state); // enviar a todos en la sala
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
