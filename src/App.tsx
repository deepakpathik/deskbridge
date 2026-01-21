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

  // Determine current view based on Store Status and Local Settings State
  let CurrentView;
  if (isSettingsOpen) {
    CurrentView = isMobile ? MobileSettingsScreen : SettingsScreen;
  } else if (status === 'IN_SESSION') {
    CurrentView = isMobile ? MobileLiveSessionScreen : LiveSessionScreen;
  } else {
    CurrentView = isMobile ? MobileHomeScreen : HomeScreen;
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#0a0d14] via-[#1a1625] to-[#0f1419] text-white overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 w-full h-full">
        {/* Render the determined view. We pass common props, 
            though specific components might ignore some. 
            We'll refine this as we refactor child components. */}
        {status === 'IN_SESSION' && !isSettingsOpen ? (
          <CurrentView onDisconnect={handleDisconnect} />
        ) : isSettingsOpen ? (
          <CurrentView onClose={handleCloseSettings} />
        ) : (
          <CurrentView
            onAcceptConnection={() => {
              // For manually triggering "Accept Connection" button (maybe debug or reverse connect?)
              // For now, let's keep it but maybe it should just set state to IDLE or allow reverse connection?
              // The "Accept Connection" button usually meant "Make me discoverable/ready".
              // In our socket logic, we are always ready once connected. 
              // Maybe we can repurpose this button or remove connection logic from it if it was dummy.
              // For safety: no-op or specific debug action.
              console.log("Accept connection clicked - awaiting incoming requests");
            }}
            onOpenSettings={handleOpenSettings}
          />
        )}

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