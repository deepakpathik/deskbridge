const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId || socket.id;
    socket.userId = userId;
    console.log(`User connected: ${userId}`);

    // Join Room
    socket.on('join-room', (roomId, userId) => {
        const room = io.sockets.adapter.rooms.get(roomId);

        // Logic: 
        // 1. If roomId == userId, it's the Host establishing their room. Always allow.
        // 2. If room exists, it's a Caller joining an existing room. Allow.
        // 3. If room DOES NOT exist and roomId != userId, it's a Caller trying to join an offline host. Deny.

        if (roomId === userId || (room && room.size > 0)) {
            socket.join(roomId);
            console.log(`User ${userId || socket.id} joined room ${roomId}`);
            socket.emit('room-joined', roomId);
            socket.to(roomId).emit('user-connected', userId || socket.id);
        } else {
            console.log(`User ${userId || socket.id} tried to join non-existent room ${roomId}`);
            socket.emit('room-not-found');
        }
    });

    // Signaling
    socket.on('offer', (payload) => {
        const { roomId, offer } = payload;
        socket.to(roomId).emit('offer', offer);
        console.log(`Offer relayed to room ${roomId}`);
    });

    socket.on('answer', (payload) => {
        const { roomId, answer } = payload;
        socket.to(roomId).emit('answer', answer);
        console.log(`Answer relayed to room ${roomId}`);
    });

    socket.on('ice-candidate', (payload) => {
        const { roomId, candidate } = payload;
        socket.to(roomId).emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId || socket.id}`);
    });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
});
