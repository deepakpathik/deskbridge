const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { handleSocketEvents } = require('./handlers/socketHandler');
const { handleWebRTCEvents } = require('./handlers/webrtcHandler');

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

    // Auto-join the user's own room so they are reachable
    socket.join(userId);
    console.log(`User connected: ${userId} and joined personal room`);

    handleSocketEvents(io, socket);
    handleWebRTCEvents(io, socket);
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
});
