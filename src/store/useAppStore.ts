import { create } from 'zustand';
import { socketService } from '../services/socketService';
import { getOrCreateDeviceId } from '../utils/deviceId';

export type AppStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'INCOMING_REQUEST' | 'IN_SESSION' | 'ERROR';

interface AppStore {
    status: AppStatus;
    myDeviceId: string | null;
    remoteDeviceId: string | null;
    isSocketConnected: boolean;
    isCaller: boolean;

    // Actions
    initializeSocket: () => void;
    setStatus: (status: AppStatus) => void;
    setMyDeviceId: (id: string) => void;
    connectToDevice: (targetId: string) => void;
    disconnect: () => void;
    approveConnection: () => void;
    denyConnection: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
    status: 'IDLE',
    myDeviceId: getOrCreateDeviceId(),
    remoteDeviceId: null,
    isSocketConnected: false,
    isCaller: false,

    initializeSocket: () => {
        const socket = socketService.connect();

        socket.on('connect', () => {
            set({ isSocketConnected: true });
            const { myDeviceId } = get();
            if (myDeviceId) {
                console.log('Joining my own room:', myDeviceId);
                socketService.joinRoom(myDeviceId);
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

        socket.on('disconnect', () => {
            set({ isSocketConnected: false });
        });
    },

    setStatus: (status) => set({ status }),

    setMyDeviceId: (id) => set({ myDeviceId: id }),

    connectToDevice: (targetId) => {
        set({ status: 'CONNECTING', remoteDeviceId: targetId, isCaller: true });
        socketService.joinRoom(targetId);
    },

    disconnect: () => {
        socketService.disconnect();
        set({ status: 'IDLE', remoteDeviceId: null, isCaller: false });
    },

    approveConnection: () => {
        set({ status: 'IN_SESSION' });
    },

    denyConnection: () => {
        // Here we might want to emit an event to kick the user or just reset our state?
        // deeper logic needed later (e.g. socket.leave), for now just UI reset.
        set({ status: 'CONNECTED', remoteDeviceId: null, isCaller: false });
    }
}));
