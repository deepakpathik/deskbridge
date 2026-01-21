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

export type Screen = 'home' | 'session' | 'settings';

export interface Connection {
  id: string;
  deviceId: string;
  deviceName: string;
  lastConnected: string;
  duration: string;
}

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { status, setStatus, disconnect, initializeSocket, approveConnection, denyConnection, remoteDeviceId } = useAppStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    initializeSocket();
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
          onAcceptConnection={() => {
            console.log("Accept connection clicked - awaiting incoming requests");
          }}
          onOpenSettings={handleOpenSettings}
        />
      );
    }

    return (
      <HomeScreen
        onAcceptConnection={() => {
          console.log("Accept connection clicked - awaiting incoming requests");
        }}
        onOpenSettings={handleOpenSettings}
      />
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#0a0d14] via-[#1a1625] to-[#0f1419] text-white overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]"></div>
      </div>

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