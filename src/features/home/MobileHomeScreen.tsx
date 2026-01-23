import { Zap, Settings, Copy, Check, Shield, Wifi } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import navbarLogo from '../../assets/navbar_logo.png';

interface MobileHomeScreenProps {
  onOpenSettings: () => void;
}

export function MobileHomeScreen({ onOpenSettings }: MobileHomeScreenProps) {
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [copied, setCopied] = useState(false);

  const { status, myDeviceId, connectToDevice, isSocketConnected, cancelConnection, remoteDeviceId, notification, error } = useAppStore();
  const { showNotifications } = useSettingsStore();

  // Similar to HomeScreen, sync input
  useEffect(() => {
    if (remoteDeviceId) {
      setDeviceIdInput(remoteDeviceId);
    }
  }, [remoteDeviceId]);

  const displayDeviceId = myDeviceId || 'Loading...';

  const handleCopyId = async () => {
    if (myDeviceId) {
      await navigator.clipboard.writeText(myDeviceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    if (deviceIdInput.trim()) {
      await connectToDevice(deviceIdInput.trim());
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'CONNECTED': return '#10b981';
      case 'CONNECTING': return '#f59e0b';
      case 'IN_SESSION': return '#3b82f6';
      case 'DISCONNECTED': return '#ef4444';
      case 'IDLE': return isSocketConnected ? '#10b981' : '#ef4444';
      default: return '#ef4444';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'CONNECTED': return 'Online';
      case 'CONNECTING': return 'Connecting...';
      case 'IN_SESSION': return 'Active Session';
      case 'DISCONNECTED': return 'Disconnected';
      case 'IDLE': return isSocketConnected ? 'Online' : 'Offline';
      default: return 'Offline';
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-4 bg-black/40">
      {/* Mobile Header */}
      <header className="flex items-center justify-between px-5 py-3 backdrop-blur-2xl bg-gray-900/60 border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src={navbarLogo} alt="DeskBridge" className="h-6 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-3">
          {/* Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/20">
            <div
              className="w-2 h-2 shrink-0 rounded-full animate-pulse transition-colors duration-300"
              style={{ backgroundColor: getStatusColor(), boxShadow: `0 0 6px ${getStatusColor()}` }}
            />
            <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wide">{getStatusText()}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-white/10 transition-all border border-white/20"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* Identity Card (Mobile Version of Sidebar) */}
        <div className="p-5 rounded-2xl bg-white/5 border-2 border-white/20 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-semibold text-sm">Your Identity</span>
          </div>

          <div className="mb-4 text-center">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Device ID</div>
            <div className="font-mono text-xl font-bold text-white tracking-widest break-all">
              {displayDeviceId}
            </div>
          </div>

          <button
            onClick={handleCopyId}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy ID'}
          </button>
        </div>

        {/* Connect Card */}
        <div>
          <div className="mb-3">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Establish Connection</h2>
            <p className="text-xs text-gray-400">Connect to remote workstation</p>
          </div>

          <div className="backdrop-blur-3xl bg-black/20 rounded-2xl p-5 border-2 border-white/20 shadow-xl space-y-4">
            <label className="block text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
                <Zap className="w-3 h-3 text-emerald-400" />
              </div>
              Remote Device ID
            </label>

            <input
              type="text"
              value={deviceIdInput}
              onChange={(e) => setDeviceIdInput(e.target.value)}
              placeholder="Ex: 123-456"
              className="w-full px-4 py-3 bg-black/30 border-2 border-white/30 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all font-mono text-base placeholder:text-gray-600 text-center"
            />

            <button
              onClick={status === 'CONNECTING' ? cancelConnection : handleConnect}
              disabled={!deviceIdInput.trim() && status !== 'CONNECTING'}
              className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg duration-200 text-sm
                         ${status === 'CONNECTING'
                  ? 'bg-red-500/10 text-red-500 border-2 border-red-500/40'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-blue-500/30'
                }
                         disabled:opacity-50 disabled:cursor-not-allowed
                       `}
            >
              {status === 'CONNECTING' ? 'Cancel' : 'Connect Now'}
            </button>
          </div>
        </div>

        {/* Notifications/Errors Mobile */}
        {(showNotifications && notification || error) && (
          <div className={`w-full p-4 rounded-xl shadow-lg border backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${error
            ? 'bg-red-500/10 border-red-500/30 text-red-200'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}>
            {error ? <Shield className="w-4 h-4 text-red-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
            <span className="font-medium text-xs">{error || notification}</span>
          </div>
        )}

      </div>
    </div>
  );
}
