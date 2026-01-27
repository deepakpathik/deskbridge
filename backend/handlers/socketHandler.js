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

    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.userId || socket.id} left room ${roomId}`);
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            // Notify others in the room (excluding the sender, which is default for 'to')
            socket.to(roomId).emit('user-disconnected', socket.userId || socket.id);
        });
        console.log(`User disconnecting: ${socket.userId || socket.id}`);
    });

    // Control Actions (Mouse/Keyboard)
    socket.on('control-action', ({ roomId, action }) => {
        // Relay to all others in the room (Host should be in this room)
        socket.to(roomId).emit('control-action', action);
    });

    // Permission Sync
    socket.on('permission-update', ({ roomId, allowed }) => {
        socket.to(roomId).emit('permission-update', allowed);
    });
};

module.exports = { handleSocketEvents };
