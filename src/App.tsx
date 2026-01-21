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
  const isMobile = useIsMobile();

  useEffect(() => {
    initializeSocket();

    // Check permissions on startup
    const checkPermissions = async () => {
      if (window.electronAPI) {
        const perms = await window.electronAPI.checkPermissions();
        console.log('OS Permissions:', perms);

        // If screen recording is needed (AnyDesk clone), we might want to warn if not granted.
        // On macOS, we can't force-prompt for screen easily without trying to capture.
        // But we can prompt for mic/camera if we used audio.
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