import { create } from 'zustand';
import { socketService } from '../services/socketService';
import { getOrCreateDeviceId } from '../utils/deviceId';

export type AppStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'INCOMING_REQUEST' | 'IN_SESSION' | 'ERROR';

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
    approveConnection: () => void;
    denyConnection: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
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
            // If I am waiting for connection (CONNECTED), this means someone joined my room.
            // We should ask for approval.
            const currentStatus = get().status;
            if (currentStatus === 'CONNECTED') {
                set({ status: 'INCOMING_REQUEST', remoteDeviceId: userId });
            } else {
                // If I initiated the connection (CONNECTING), I should just go to IN_SESSION
                // But wait, the caller joins the room too? Protocol needs clarification.
                // Current backend implementation: logic is symmetric.
                // If I am CONNECTING, I joined a room.
                // If I am HOST (IDLE/CONNECTED), I created a room (implicitly by joining my own ID?).
                // Let's assume for now:
                // If status is CONNECTING -> We initiated -> Go to IN_SESSION (Peer approved implicitly or we are the caller)
                // If status is CONNECTED -> We are host -> Incoming request -> Go to INCOMING_REQUEST
                if (currentStatus === 'CONNECTING') {
                    set({ status: 'IN_SESSION', remoteDeviceId: userId });
                } else {
                    set({ status: 'INCOMING_REQUEST', remoteDeviceId: userId });
                }
            }
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
    },

    disconnect: () => {
        socketService.disconnect();
        set({ status: 'IDLE', remoteDeviceId: null });
    },

    approveConnection: () => {
        set({ status: 'IN_SESSION' });
    },

    denyConnection: () => {
        // Here we might want to emit an event to kick the user or just reset our state?
        // deeper logic needed later (e.g. socket.leave), for now just UI reset.
        set({ status: 'CONNECTED', remoteDeviceId: null });
    }
}));
