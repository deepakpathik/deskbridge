import { create } from 'zustand';
import { socketService } from '../services/socketService';
import { getOrCreateDeviceId } from '../utils/deviceId';

export type AppStatus = 'IDLE' | 'CONNECTING' | 'WAITING_FOR_APPROVAL' | 'CONNECTED' | 'INCOMING_REQUEST' | 'IN_SESSION' | 'ERROR' | 'DISCONNECTED';

export interface RecentSession {
    deviceId: string;
    timestamp: number;
}

interface AppStore {
    status: AppStatus;
    myDeviceId: string | null;
    remoteDeviceId: string | null;
    isSocketConnected: boolean;
    isCaller: boolean;
    error: string | null;
    notification: string | null;
    recentSessions: RecentSession[];

    // Actions
    initializeSocket: () => void;
    setStatus: (status: AppStatus) => void;
    setMyDeviceId: (id: string) => void;
    connectToDevice: (targetId: string) => void;
    cancelConnection: () => void;
    disconnect: () => void;
    approveConnection: () => void;
    denyConnection: () => void;
    clearError: () => void;
    clearNotification: () => void;
    removeSession: (deviceId: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
    status: 'IDLE',
    myDeviceId: getOrCreateDeviceId(),
    remoteDeviceId: null,
    isSocketConnected: false,
    isCaller: false,
    error: null,
    notification: null,
    recentSessions: JSON.parse(localStorage.getItem('recent_sessions') || '[]'),

    initializeSocket: () => {
        const { myDeviceId } = get();
        const socket = socketService.connect(myDeviceId || undefined);

        // Remove existing listeners to prevent duplication on re-init
        socket.off('connect');
        socket.off('disconnect');
        socket.off('room-joined');
        socket.off('room-not-found');
        socket.off('user-connected');
        socket.off('user-disconnected');
        socket.off('call-accepted');
        socket.off('error');

        socket.on('connect', () => {
            set({ isSocketConnected: true, error: null });
            if (myDeviceId) {
                console.log('Joining my own room:', myDeviceId);
                socketService.joinRoom(myDeviceId, myDeviceId);
            }
        });

        socket.on('disconnect', () => {
            set({ isSocketConnected: false });
        });

        socket.on('room-joined', (roomId) => {
            console.log('Successfully joined room:', roomId);
            const { myDeviceId } = get();
            if (roomId === myDeviceId) {
                // I joined my own room, I am now online and ready for connections
                set({ status: 'CONNECTED', error: null, notification: "Online - Ready for connections" });
            } else {
                // I joined someone else's room, wait for their approval? 
                // Actually if I join their room, I am the caller.
                // The 'user-connected' event on THEIR side triggers the request.
                // On MY side, I just wait.
                set({ status: 'WAITING_FOR_APPROVAL', error: null, notification: "Waiting for approval..." });
            }
        });

        socket.on('room-not-found', () => {
            set({ status: 'IDLE', error: "Device Unreachable: ID is incorrect or offline.", notification: null, isCaller: false, remoteDeviceId: null });
        });

        socket.on('error', (msg) => {
            console.error('Socket error received:', msg);
            const errorMessage = typeof msg === 'string' ? msg : 'An error occurred';
            set({ status: 'IDLE', error: errorMessage, isCaller: false, notification: null });
        });

        socket.on('user-connected', (userId) => {
            console.log('Remote user connected:', userId);
            const { status, isCaller } = get();

            if (status === 'CONNECTED') {
                // I am the host
                set({ status: 'INCOMING_REQUEST', remoteDeviceId: userId, isCaller: false });
            } else if (status === 'CONNECTING' || isCaller) {
                // I am the caller
                set({ status: 'WAITING_FOR_APPROVAL', remoteDeviceId: userId, notification: "Waiting for approval..." });
            }
        });

        socket.on('call-accepted', () => {
            console.log('Call accepted by host');
            const { remoteDeviceId, recentSessions } = get();

            // Add to recent sessions
            if (remoteDeviceId && remoteDeviceId !== get().myDeviceId) {
                const newSession: RecentSession = { deviceId: remoteDeviceId, timestamp: Date.now() };
                const updatedSessions = [newSession, ...recentSessions.filter(s => s.deviceId !== remoteDeviceId)].slice(0, 5); // Keep last 5
                set({ recentSessions: updatedSessions });
                localStorage.setItem('recent_sessions', JSON.stringify(updatedSessions));
            }

            set({ status: 'IN_SESSION', error: null, notification: "Session Started" });
        });

        socket.on('user-disconnected', (userId) => {
            console.log('Peer disconnected:', userId);
            const { remoteDeviceId, isCaller } = get();
            if (remoteDeviceId && remoteDeviceId === userId) {
                if (isCaller) {
                    socketService.leaveRoom(remoteDeviceId);
                }
                set({ status: 'CONNECTED', remoteDeviceId: null, isCaller: false, notification: "Online - Ready for connections", error: null });
            }
        });
    },

    setStatus: (status) => set({ status }),

    setMyDeviceId: (id) => set({ myDeviceId: id }),

    connectToDevice: (targetId) => {
        const { myDeviceId, isSocketConnected } = get();

        if (!isSocketConnected) {
            set({ error: "Connection Failed: Server is offline." });
            return;
        }

        if (!targetId || targetId.trim().length < 6) {
            set({ error: "Invalid ID: Must be at least 6 characters." });
            return;
        }

        if (targetId === myDeviceId) {
            set({ error: "Action Denied: You cannot connect to your own device." });
            return;
        }
        set({ status: 'CONNECTING', remoteDeviceId: targetId, isCaller: true, error: null, notification: "Connecting..." });
        if (myDeviceId) {
            socketService.joinRoom(targetId, myDeviceId);
        }
    },

    cancelConnection: () => {
        const { remoteDeviceId } = get();
        if (remoteDeviceId) {
            socketService.leaveRoom(remoteDeviceId);
        }
        set({ status: 'CONNECTED', remoteDeviceId: null, isCaller: false, error: null, notification: "Online - Ready for connections" });
    },

    disconnect: () => {
        socketService.disconnect();
        set({ status: 'IDLE', remoteDeviceId: null, isCaller: false, error: null, notification: "Disconnected" });
        // Reconnect to own room
        const { myDeviceId } = get();
        if (myDeviceId) {
            setTimeout(() => {
                get().initializeSocket();
            }, 500);
        }
    },

    approveConnection: () => {
        const { myDeviceId, remoteDeviceId, recentSessions } = get();
        if (myDeviceId) {
            socketService.sendCallAccepted(myDeviceId);
        }

        // Add to recent sessions (Host side)
        if (remoteDeviceId && remoteDeviceId !== myDeviceId) {
            const newSession: RecentSession = { deviceId: remoteDeviceId, timestamp: Date.now() };
            const updatedSessions = [newSession, ...recentSessions.filter(s => s.deviceId !== remoteDeviceId)].slice(0, 5);
            set({ recentSessions: updatedSessions });
            localStorage.setItem('recent_sessions', JSON.stringify(updatedSessions));
        }

        set({ status: 'IN_SESSION', error: null, notification: "Session Started" });
    },

    denyConnection: () => {
        set({ status: 'CONNECTED', remoteDeviceId: null, isCaller: false, error: null, notification: "Connection Denied" });
    },

    clearError: () => set({ error: null }),
    clearNotification: () => set({ notification: null }),

    removeSession: (deviceId) => {
        const { recentSessions } = get();
        const updatedSessions = recentSessions.filter(s => s.deviceId !== deviceId);
        set({ recentSessions: updatedSessions });
        localStorage.setItem('recent_sessions', JSON.stringify(updatedSessions));
    }
}));

