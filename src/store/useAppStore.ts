import { create } from 'zustand';
import { socketService } from '../services/socketService';
import { getOrCreateDeviceId } from '../utils/deviceId';

export type AppStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'INCOMING_REQUEST' | 'IN_SESSION' | 'ERROR' | 'DISCONNECTED';

interface AppStore {
    status: AppStatus;
    myDeviceId: string | null;
    remoteDeviceId: string | null;
    isSocketConnected: boolean;
    isCaller: boolean;
    error: string | null;
    notification: string | null;

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
}

export const useAppStore = create<AppStore>((set, get) => ({
    status: 'IDLE',
    myDeviceId: getOrCreateDeviceId(),
    remoteDeviceId: null,
    isSocketConnected: false,
    isCaller: false,
    error: null,
    notification: null,

    initializeSocket: () => {
        const { myDeviceId } = get();
        const socket = socketService.connect(myDeviceId || undefined);

        socket.on('connect', () => {
            set({ isSocketConnected: true });
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
            if (roomId !== myDeviceId) {
                set({ status: 'CONNECTED' });
            }
        });

        socket.on('user-connected', (userId) => {
            console.log('Remote user connected:', userId);
            // If I am waiting for connection (CONNECTED), this means someone joined my room.
            // We should ask for approval.
            const { status, isCaller } = get();

            if (status === 'CONNECTED') {
                // I am the host
                set({ status: 'INCOMING_REQUEST', remoteDeviceId: userId, isCaller: false });
            } else if (status === 'CONNECTING' || isCaller) {
                // I am the caller
                set({ status: 'IN_SESSION', remoteDeviceId: userId });
            }
        });

        socket.on('room-not-found', () => {
            set({ status: 'IDLE', error: "Device Unreachable: ID is incorrect or offline.", notification: null, isCaller: false, remoteDeviceId: null });
        });

        socket.on('disconnect', () => {
            set({ isSocketConnected: false });
        });

        socket.on('room-joined', (roomId) => {
            console.log('Successfully joined room:', roomId);
            const { myDeviceId } = get();
            if (roomId !== myDeviceId) {
                set({ status: 'CONNECTED', error: null, notification: "Waiting for approval..." });
            }
        });

        socket.on('user-connected', (userId) => {
            console.log('Remote user connected:', userId);
            // If I am waiting for connection (CONNECTED), this means someone joined my room.
            // We should ask for approval.
            const { status, isCaller } = get();

            if (status === 'CONNECTED') {
                // I am the host
                set({ status: 'INCOMING_REQUEST', remoteDeviceId: userId, isCaller: false });
            } else if (status === 'CONNECTING' || isCaller) {
                // I am the caller
                set({ status: 'IN_SESSION', remoteDeviceId: userId });
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

        if (!targetId || targetId.trim().length < 6) { // Increased length check
            set({ error: "Invalid ID: Must be at least 6 characters." });
            return;
        }

        // Check for self-connection
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
        set({ status: 'IDLE', remoteDeviceId: null, isCaller: false, error: null, notification: null });
    },

    disconnect: () => {
        socketService.disconnect();
        set({ status: 'IDLE', remoteDeviceId: null, isCaller: false, error: null, notification: "Disconnected" });
        // Reconnect to own room to stay online
        const { myDeviceId } = get();
        if (myDeviceId) {
            setTimeout(() => {
                get().initializeSocket();
            }, 500);
        }
    },

    approveConnection: () => {
        set({ status: 'IN_SESSION', error: null, notification: "Session Started" });
    },

    denyConnection: () => {
        set({ status: 'CONNECTED', remoteDeviceId: null, isCaller: false, error: null, notification: "Connection Denied" });
    },

    clearError: () => set({ error: null }),
    clearNotification: () => set({ notification: null })
}));
