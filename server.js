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

// Estado de cada sala
// rooms = { roomId: { videoState: {}, users: {} } }
const rooms = {};

io.on("connection", (socket) => {
  console.log("✅ Usuario conectado:", socket.id);

  // Usuario se une a una sala
  socket.on("join room", ({ roomId, userName }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { videoState: null, users: {} };
    }

    // Guardar usuario en la sala
    rooms[roomId].users[socket.id] = {
      name: userName || "🙋 Invitado",
      muted: false,
    };

    console.log(`👥 ${socket.id} (${userName}) entró a sala ${roomId}`);

    // Avisar a todos en la sala que alguien entró
    io.to(roomId).emit("user list", rooms[roomId].users);
    io.to(roomId).emit("chat message", {
      id: "system",
      text: `🔔 ${userName || "Invitado"} se unió a la sala.`,
    });

    // Si hay estado de video, mandarlo al nuevo usuario
    if (rooms[roomId].videoState) {
      socket.emit("video state", rooms[roomId].videoState);
    }
  });

  // Chat en tiempo real
  socket.on("chat message", ({ roomId, msg, user }) => {
    if (!rooms[roomId]) return;
    io.to(roomId).emit("chat message", {
      id: socket.id,
      user: user || "🙋 Invitado",
      text: msg,
    });
  });

  // Creador actualiza el video
  socket.on("video update", ({ roomId, state }) => {
    if (!rooms[roomId]) return;
    rooms[roomId].videoState = state; // guardar último estado
    io.to(roomId).emit("video state", state); // enviar a todos
  });

  // Mute / Unmute a un usuario
  socket.on("toggle mute", ({ roomId, targetId }) => {
    if (!rooms[roomId] || !rooms[roomId].users[targetId]) return;
    rooms[roomId].users[targetId].muted =
      !rooms[roomId].users[targetId].muted;
    io.to(roomId).emit("user list", rooms[roomId].users);
  });

  // Mute All
  socket.on("mute all", (roomId) => {
    if (!rooms[roomId]) return;
    for (const uid in rooms[roomId].users) {
      rooms[roomId].users[uid].muted = true;
    }
    io.to(roomId).emit("user list", rooms[roomId].users);
  });

  // Usuario se desconecta
  socket.on("disconnect", () => {
    console.log("❌ Usuario desconectado:", socket.id);

    for (const roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        const userName = rooms[roomId].users[socket.id].name;
        delete rooms[roomId].users[socket.id];

        // Avisar al resto
        io.to(roomId).emit("user list", rooms[roomId].users);
        io.to(roomId).emit("chat message", {
          id: "system",
          text: `👋 ${userName} salió de la sala.`,
        });

        // Si la sala queda vacía → eliminarla
        if (Object.keys(rooms[roomId].users).length === 0) {
          delete rooms[roomId];
          console.log(`🗑️ Sala ${roomId} eliminada (vacía).`);
        }
      }
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
