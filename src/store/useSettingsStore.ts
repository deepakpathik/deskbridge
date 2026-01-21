import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    resolution: string;
    fps: string;
    codec: string;
    bitrate: string;
    theme: string;
    requirePassword: boolean;
    showNotifications: boolean;

    setResolution: (res: string) => void;
    setFps: (fps: string) => void;
    setCodec: (codec: string) => void;
    setBitrate: (bitrate: string) => void;
    setTheme: (theme: string) => void;
    setRequirePassword: (require: boolean) => void;
    setShowNotifications: (show: boolean) => void;
    resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            resolution: '1920x1080',
            fps: '60',
            codec: 'H.264',
            bitrate: '8',
            theme: 'dark',
            requirePassword: false,
            showNotifications: true,

            setResolution: (resolution) => set({ resolution }),
            setFps: (fps) => set({ fps }),
            setCodec: (codec) => set({ codec }),
            setBitrate: (bitrate) => set({ bitrate }),
            setTheme: (theme) => set({ theme }),
            setRequirePassword: (requirePassword) => set({ requirePassword }),
            setShowNotifications: (showNotifications) => set({ showNotifications }),
            resetSettings: () => set({
                resolution: '1920x1080',
                fps: '60',
                codec: 'H.264',
                bitrate: '8',
                theme: 'dark',
                requirePassword: false,
                showNotifications: true,
            })
        }),
        {
            name: 'deskbridge-settings',
        }
    )
);
