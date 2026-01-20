import { useState } from 'react';
import { HomeScreen } from './features/home/HomeScreen';
import { LiveSessionScreen } from './features/session/LiveSessionScreen';
import { ConnectionApprovalPopup } from './features/connection/ConnectionApprovalPopup';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { MobileHomeScreen } from './features/home/MobileHomeScreen';
import { MobileLiveSessionScreen } from './features/session/MobileLiveSessionScreen';
import { MobileSettingsScreen } from './features/settings/MobileSettingsScreen';
import { useIsMobile } from './hooks/useIsMobile';

export type ConnectionStatus = 'online' | 'connecting' | 'connected' | 'offline';
export type Screen = 'home' | 'session' | 'settings';

export interface Connection {
  id: string;
  deviceId: string;
  deviceName: string;
  lastConnected: string;
  duration: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [incomingConnection, setIncomingConnection] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleConnect = (_deviceId: string) => {
    setConnectionStatus('connecting');
    setConnectionStatus('connecting');

    setTimeout(() => {
      setConnectionStatus('connected');
      setCurrentScreen('session');
    }, 2000);
  };

  const handleAcceptConnection = () => {
    setIncomingConnection('Device #847291');
    setShowApprovalPopup(true);
  };

  const handleApprove = () => {
    setShowApprovalPopup(false);
    setConnectionStatus('connected');
    setCurrentScreen('session');
  };

  const handleDeny = () => {
    setShowApprovalPopup(false);
    setIncomingConnection(null);
  };

  const handleDisconnect = () => {
    setConnectionStatus('online');
    setCurrentScreen('home');
  };

  const handleOpenSettings = () => {
    setCurrentScreen('settings');
  };

  const handleCloseSettings = () => {
    setCurrentScreen('home');
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#0a0d14] via-[#1a1625] to-[#0f1419] text-white overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 w-full h-full">
        {isMobile ? (
          <>
            {currentScreen === 'home' && (
              <MobileHomeScreen
                connectionStatus={connectionStatus}
                onConnect={handleConnect}
                onAcceptConnection={handleAcceptConnection}
                onOpenSettings={handleOpenSettings}
              />
            )}

            {currentScreen === 'session' && (
              <MobileLiveSessionScreen
                onDisconnect={handleDisconnect}
              />
            )}

            {currentScreen === 'settings' && (
              <MobileSettingsScreen onClose={handleCloseSettings} />
            )}
          </>
        ) : (
          <>
            {currentScreen === 'home' && (
              <HomeScreen
                connectionStatus={connectionStatus}
                onConnect={handleConnect}
                onAcceptConnection={handleAcceptConnection}
                onOpenSettings={handleOpenSettings}
              />
            )}

            {currentScreen === 'session' && (
              <LiveSessionScreen
                onDisconnect={handleDisconnect}
              />
            )}

            {currentScreen === 'settings' && (
              <SettingsScreen onClose={handleCloseSettings} />
            )}
          </>
        )}

        {showApprovalPopup && (
          <ConnectionApprovalPopup
            deviceName={incomingConnection || 'Unknown Device'}
            onApprove={handleApprove}
            onDeny={handleDeny}
          />
        )}
      </div>
    </div>
  );
}