import { create } from 'zustand';

export type AppStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'IN_SESSION' | 'ERROR';

interface AppStore {
    status: AppStatus;
    myDeviceId: string | null;
    remoteDeviceId: string | null;

    // Actions
    setStatus: (status: AppStatus) => void;
    setMyDeviceId: (id: string) => void;
    connectToDevice: (targetId: string) => void;
    disconnect: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
    status: 'IDLE',
    myDeviceId: null,
    remoteDeviceId: null,

    setStatus: (status) => set({ status }),

    setMyDeviceId: (id) => set({ myDeviceId: id }),

    connectToDevice: (targetId) => {
        set({ status: 'CONNECTING', remoteDeviceId: targetId });
        // Simulation for now - will be replaced by real socket logic later
        setTimeout(() => {
            set({ status: 'CONNECTED' });
            // Auto transition to session for now to test nav, removed in later steps
            setTimeout(() => {
                set({ status: 'IN_SESSION' });
            }, 1000);
        }, 1500);
    },

    disconnect: () => set({ status: 'IDLE', remoteDeviceId: null }),
}));
