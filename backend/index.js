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
    console.log(`User connected: ${socket.id}`);

    // Join Room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
        socket.emit('room-joined', roomId);
        socket.to(roomId).emit('user-connected', userId);
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
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
});
