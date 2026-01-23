const handleWebRTCEvents = (io, socket) => {
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

    socket.on('call-accepted', (payload) => {
        const { roomId } = payload;
        socket.to(roomId).emit('call-accepted');
        console.log(`Call accepted in room ${roomId}`);
    });
};

module.exports = { handleWebRTCEvents };
