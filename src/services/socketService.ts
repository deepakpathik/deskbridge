import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

class SocketService {
    private socket: Socket | null = null;

    public connect(userId?: string): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
            query: userId ? { userId } : undefined,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // Room Actions
    public joinRoom(roomId: string, userId: string) {
        if (this.socket) {
            this.socket.emit('join-room', roomId, userId);
        }
    }

    public leaveRoom(roomId: string) {
        if (this.socket) {
            this.socket.emit('leave-room', roomId);
        }
    }

    // WebRTC Signaling
    public sendOffer(roomId: string, offer: RTCSessionDescriptionInit) {
        if (this.socket) {
            this.socket.emit('offer', { roomId, offer });
        }
    }

    public onOffer(callback: (offer: RTCSessionDescriptionInit) => void) {
        if (this.socket) {
            this.socket.on('offer', callback);
        }
    }

    public offOffer(callback?: (offer: RTCSessionDescriptionInit) => void) {
        if (this.socket) {
            this.socket.off('offer', callback);
        }
    }

    public sendAnswer(roomId: string, answer: RTCSessionDescriptionInit) {
        if (this.socket) {
            this.socket.emit('answer', { roomId, answer });
        }
    }

    public onAnswer(callback: (answer: RTCSessionDescriptionInit) => void) {
        if (this.socket) {
            this.socket.on('answer', callback);
        }
    }

    public offAnswer(callback?: (answer: RTCSessionDescriptionInit) => void) {
        if (this.socket) {
            this.socket.off('answer', callback);
        }
    }

    public sendIceCandidate(roomId: string, candidate: RTCIceCandidate) {
        if (this.socket) {
            this.socket.emit('ice-candidate', { roomId, candidate });
        }
    }

    public onIceCandidate(callback: (candidate: RTCIceCandidate) => void) {
        if (this.socket) {
            this.socket.on('ice-candidate', callback);
        }
    }

    public offIceCandidate(callback?: (candidate: RTCIceCandidate) => void) {
        if (this.socket) {
            this.socket.off('ice-candidate', callback);
        }
    }

    public sendCallAccepted(roomId: string) {
        if (this.socket) {
            this.socket.emit('call-accepted', { roomId });
        }
    }

    public onCallAccepted(callback: () => void) {
        if (this.socket) {
            this.socket.on('call-accepted', callback);
        }
    }

    // Remote Control
    public sendControlAction(roomId: string, action: any) {
        if (this.socket) {
            this.socket.emit('control-action', { roomId, action });
        }
    }

    public onControlAction(callback: (action: any) => void) {
        if (this.socket) {
            this.socket.on('control-action', callback);
        }
    }

    public offControlAction(callback?: (action: any) => void) {
        if (this.socket) {
            this.socket.off('control-action', callback);
        }
    }

    // Permission Sync
    public sendPermissionUpdate(roomId: string, allowed: boolean) {
        if (this.socket) {
            this.socket.emit('permission-update', { roomId, allowed });
        }
    }

    public onPermissionUpdate(callback: (allowed: boolean) => void) {
        if (this.socket) {
            this.socket.on('permission-update', callback);
        }
    }

    public offPermissionUpdate(callback?: (allowed: boolean) => void) {
        if (this.socket) {
            this.socket.off('permission-update', callback);
        }
    }
}

export const socketService = new SocketService();
