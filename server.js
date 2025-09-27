// server.js

// 1. Importaciones de módulos
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// 2. Inicialización de la aplicación y el servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 3. Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 4. Almacenamiento de estado de las salas
const rooms = {}; // Guardar estado de cada sala

// 5. Manejo de eventos de Socket.IO
io.on('connection', (socket) => {
    console.log('✅ Usuario conectado:', socket.id);

    // Unirse a una sala
    socket.on('join room', (roomId) => {
        socket.join(roomId);
        console.log(`👥 Usuario ${socket.id} entró a sala ${roomId}`);
        // Si ya hay estado guardado en la sala → enviarlo al nuevo usuario
        if (rooms[roomId]) {
            socket.emit('video state', rooms[roomId]);
        }
    });

    // Chat en tiempo real
    socket.on('chat message', ({ roomId, msg }) => {
        io.to(roomId).emit('chat message', { id: socket.id, text: msg });
    });

    // Cuando el creador actualiza el video
    socket.on('video update', ({ roomId, state }) => {
        rooms[roomId] = state; // guardar último estado
        io.to(roomId).emit('video state', state); // enviar a todos en la sala
    });

    // Desconexión
    socket.on('disconnect', () => {
        console.log('❌ Usuario desconectado:', socket.id);
    });
});

// 6. Inicio del servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
