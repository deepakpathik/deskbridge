import { useState, useEffect } from 'react';
import { HomeScreen } from './features/home/HomeScreen';
import { LiveSessionScreen } from './features/session/LiveSessionScreen';
import { ConnectionApprovalPopup } from './features/connection/ConnectionApprovalPopup';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { MobileHomeScreen } from './features/home/MobileHomeScreen';
import { MobileLiveSessionScreen } from './features/session/MobileLiveSessionScreen';
import { MobileSettingsScreen } from './features/settings/MobileSettingsScreen';
import { useIsMobile } from './hooks/useIsMobile';
import { useAppStore } from './store/useAppStore';
import { useSettingsStore } from './store/useSettingsStore';

import backgroundImage from './assets/background_image.jpeg';

export type Screen = 'home' | 'session' | 'settings';

export interface Connection {
  id: string;
  deviceId: string;
  deviceName: string;
  lastConnected: string;
  duration: string;
}


declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      checkPermissions: () => Promise<{ screen: string; mic: string }>;
      requestMediaAccess: (mediaType: 'microphone' | 'camera') => Promise<boolean>;
    };
  }
}

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { status, setStatus, disconnect, initializeSocket, approveConnection, denyConnection, remoteDeviceId } = useAppStore();
  const { theme } = useSettingsStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Apply theme
    document.documentElement.className = theme; // Assuming "dark" / "light" classes
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.className = prefersDark ? 'dark' : 'light';
    }
  }, [theme]);

  // Suppress notifications in UI if setting is disabled
  // Note: We might want to filter this in the store itself, but doing it here hides it from view.
  // The 'notification' in store is textual.
  // If we really want to stop "Desktop Notifications" (system notifications), we'd need the Notification API.
  // But here it seems 'notifications' tab controls "Desktop Notifications" but also refers to connection events.
  // Assuming the intent is for the in-app "Notifications" or System ones. 
  // Given the "notifications" tab in settings lists "Connection established" etc, and "Desktop Notifications",
  // let's assume "showNotifications" controls the in-app pill visibility mostly.

  useEffect(() => {
    initializeSocket();

    // Check permissions on startup
    const checkPermissions = async () => {
      if (window.electronAPI) {
        const perms = await window.electronAPI.checkPermissions();
        console.log('OS Permissions:', perms);
      }
    };
    checkPermissions();
  }, []);

  // Remove local handlers as we now use store actions directly or wrapped
  const handleApprove = () => {
    approveConnection();
  };

  const handleDeny = () => {
    denyConnection();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  // Render explicit components based on state to ensure type safety
  const renderContent = () => {
    if (isSettingsOpen) {
      if (isMobile) {
        return <MobileSettingsScreen onClose={handleCloseSettings} />;
      }
      return <SettingsScreen onClose={handleCloseSettings} />;
    }

    if (status === 'IN_SESSION') {
      if (isMobile) {
        return <MobileLiveSessionScreen onDisconnect={handleDisconnect} />
      }
      return <LiveSessionScreen onDisconnect={handleDisconnect} />;
    }

    // Default: Home Screen
    if (isMobile) {
      return (
        <MobileHomeScreen
          onOpenSettings={handleOpenSettings}
        />
      );
    }

    return (
      <HomeScreen
        onOpenSettings={handleOpenSettings}
      />
    );
  };

  return (
    <div
      className="w-full h-screen text-white overflow-hidden relative bg-black"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" /> {/* Optional overlay for readability */}

      <div className="relative z-10 w-full h-full">
        {renderContent()}

        {status === 'INCOMING_REQUEST' && (
          <ConnectionApprovalPopup
            deviceName={`Device ${remoteDeviceId || 'Unknown'}`}
            onApprove={handleApprove}
            onDeny={handleDeny}
          />
        )}
      </div>
    </div>
  );
}