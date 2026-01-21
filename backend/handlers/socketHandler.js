const handleSocketEvents = (io, socket) => {
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

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId || socket.id}`);
    });
};

module.exports = { handleSocketEvents };
