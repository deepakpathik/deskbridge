import { create } from 'zustand';
import { socketService } from '../services/socketService';
import { getOrCreateDeviceId } from '../utils/deviceId';

export type AppStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'IN_SESSION' | 'ERROR';

interface AppStore {
    status: AppStatus;
    myDeviceId: string | null;
    remoteDeviceId: string | null;
    isSocketConnected: boolean;

    // Actions
    initializeSocket: () => void;
    setStatus: (status: AppStatus) => void;
    setMyDeviceId: (id: string) => void;
    connectToDevice: (targetId: string) => void;
    disconnect: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
    status: 'IDLE',
    myDeviceId: getOrCreateDeviceId(),
    remoteDeviceId: null,
    isSocketConnected: false,

    initializeSocket: () => {
        const socket = socketService.connect();

        socket.on('connect', () => {
            set({ isSocketConnected: true });
        });

        socket.on('disconnect', () => {
            set({ isSocketConnected: false });
        });

        socket.on('room-joined', (roomId) => {
            console.log('Successfully joined room:', roomId);
            set({ status: 'CONNECTED' });
        });

        socket.on('user-connected', (userId) => {
            console.log('Remote user connected:', userId);
            set({ status: 'IN_SESSION', remoteDeviceId: userId }); // Or however we want to track the remote ID
        });

        socket.on('disconnect', () => {
            set({ isSocketConnected: false });
        });
    },

    setStatus: (status) => set({ status }),

    setMyDeviceId: (id) => set({ myDeviceId: id }),

    connectToDevice: (targetId) => {
        set({ status: 'CONNECTING', remoteDeviceId: targetId });
        socketService.joinRoom(targetId);
        // We will move the status update to 'CONNECTED'/'IN_SESSION' to the event listener in Step 15
    },

    disconnect: () => set({ status: 'IDLE', remoteDeviceId: null }),
}));
