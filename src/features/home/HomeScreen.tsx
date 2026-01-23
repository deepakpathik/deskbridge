import { useState, useEffect } from 'react';
import {
  Settings,
  Copy,
  Check,
  ArrowRight,
  History,
  Zap,
  Shield,
  Activity,
  Wifi
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import navbarLogo from '../../assets/navbar_logo.png';

interface HomeScreenProps {
  onOpenSettings: () => void;
}

export function HomeScreen({ onOpenSettings }: HomeScreenProps) {
  const {
    myDeviceId,
    status,
    connectToDevice,
    cancelConnection,
    remoteDeviceId,
    isSocketConnected,
    notification,
    error
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const { showNotifications } = useSettingsStore();

  // ... (rest of the component)

  // Move the error display logic to be outside the card later


  // Auto-populate input if we have a target
  useEffect(() => {
    if (remoteDeviceId) {
      setDeviceIdInput(remoteDeviceId);
    }
  }, [remoteDeviceId]);

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

  const displayDeviceId = myDeviceId || 'Loading...';

  const getStatusColor = () => {
    switch (status) {
      case 'CONNECTED': return '#10b981'; // Emerald-500
      case 'CONNECTING': return '#f59e0b'; // Amber-500
      case 'WAITING_FOR_APPROVAL': return '#f59e0b'; // Amber-500
      case 'IN_SESSION': return '#3b82f6'; // Blue-500
      case 'DISCONNECTED': return '#ef4444'; // Red-500
      case 'IDLE': return isSocketConnected ? '#10b981' : '#ef4444';
      default: return '#ef4444';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'CONNECTED': return 'Online';
      case 'CONNECTING': return 'Connecting...';
      case 'WAITING_FOR_APPROVAL': return 'Waiting for Host...';
      case 'IN_SESSION': return 'Active Session';
      case 'DISCONNECTED': return 'Disconnected';
      case 'IDLE': return isSocketConnected ? 'Online' : 'Offline';
      default: return 'Offline';
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-10"> {/* Add top padding for draggable area */}
      {/* Header - Consistent with Settings */}
      <header className="flex items-center justify-between px-8 py-3 backdrop-blur-2xl bg-gray-900/60 border-2 border-white/30 shadow-lg mx-10 mt-8 rounded-full">
        <div className="flex items-center gap-4">
          <img
            src={navbarLogo}
            alt="DeskBridge"
            className="h-20 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status Pill */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.05] backdrop-blur-xl border-2 border-white/30">
            <div
              className="w-3 h-3 shrink-0 rounded-full border border-white/20 animate-pulse transition-colors duration-300"
              style={{
                backgroundColor: getStatusColor(),
                boxShadow: `0 0 10px ${getStatusColor()}`
              }}
            />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{getStatusText()}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-3 rounded-xl hover:bg-white/10 transition-all backdrop-blur-xl bg-white/[0.03] border-2 border-white/30 hover:border-white/40 shadow-lg hover:scale-105 duration-200"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Your Identity (Matches Settings Tab Column) */}
        <div className="w-80 shadow-2xl p-6 backdrop-blur-3xl bg-black/40 flex flex-col gap-6 relative z-10">

          <div className="p-6 rounded-2xl bg-white/5 border-2 border-white/30 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <span className="font-semibold text-sm">Your Identity</span>
            </div>

            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Device ID</div>
              <div className="font-mono text-2xl font-bold text-white tracking-widest break-all">
                {displayDeviceId}
              </div>
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                Ready for incoming connections
              </div>
            </div>

            <button
              onClick={handleCopyId}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border-2 border-white/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy ID'}
            </button>
          </div>

          {/* Quick Stats list styling */}
          <div className="space-y-2">
            <div className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-gray-400 hover:bg-white/5 transition-all duration-200 cursor-default">
              <div className="p-2 rounded-lg bg-white/5">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white">Low Latency</div>
                <div className="text-[10px] text-gray-500">Optimized</div>
              </div>
            </div>
            <div className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-gray-400 hover:bg-white/5 transition-all duration-200 cursor-default">
              <div className="p-2 rounded-lg bg-white/5">
                <Wifi className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white">P2P Direct</div>
                <div className="text-[10px] text-gray-500">Active</div>
              </div>
            </div>
          </div>

          {/* Absolute Vertical Divider */}
          <div className="absolute top-0 right-0 w-[6px] h-full bg-white z-50"></div>
        </div>




        {/* Main Content Area (Matches Settings Content Area) */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Section: Establish Connection */}
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Establish Connection
                </h2>
                <p className="text-sm text-gray-400">
                  Connect to a remote workstation or share your screen
                </p>
              </div>

              {/* Card Style matching Settings */}
              <div className="backdrop-blur-3xl bg-black/20 rounded-2xl p-8 border-2 border-white/30 shadow-2xl">
                <label className="block text-base font-semibold mb-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  Remote Device ID
                </label>

                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={deviceIdInput}
                      onChange={(e) => setDeviceIdInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                      placeholder="Ex: 123-456-789"
                      className="w-full px-5 py-4 bg-black/30 border-2 border-white/40 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 transition-all font-mono text-lg placeholder:text-gray-600"
                    />
                  </div>

                  <button
                    onClick={(status === 'CONNECTING' || status === 'WAITING_FOR_APPROVAL') ? cancelConnection : handleConnect}
                    disabled={!deviceIdInput.trim() && (status !== 'CONNECTING' && status !== 'WAITING_FOR_APPROVAL')}
                    className={`px-8 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg duration-200 text-sm
                        ${(status === 'CONNECTING' || status === 'WAITING_FOR_APPROVAL')
                        ? 'bg-red-500/10 text-red-500 border-2 border-red-500/40 hover:bg-red-500/20'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/30'
                      }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                  >
                    {(status === 'CONNECTING' || status === 'WAITING_FOR_APPROVAL') ? (
                      <>Cancel</>
                    ) : (
                      <>
                        Connect <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

              </div>



            </div>

            {/* Section: Recent Connections */}
            <div>
              <div className="mb-6 mt-12">
                <h2 className="text-2xl font-bold mb-2 text-white">
                  Recent Sessions
                </h2>
                <p className="text-sm text-gray-400">
                  Quickly reconnect to previously accessed devices
                </p>
              </div>

              {/* List Style matching Settings Notifications list */}
              <div className="space-y-3">
                {/* Empty State designed as a list item */}
                <div className="backdrop-blur-3xl bg-black/20 rounded-xl p-8 border-2 border-white/30 shadow-lg flex flex-col items-center justify-center text-center opacity-70">
                  <div className="p-4 rounded-full bg-white/5 mb-3">
                    <History className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-300">No recent connections</p>
                  <p className="text-xs text-gray-500 mt-1">Your connection history will appear here</p>
                </div>
              </div>
            </div>

            {/* Notifications/Errors Popup - Below Recent Sessions */}
            {(showNotifications && notification || error) && (
              <div className="mt-4 w-full flex justify-center animate-in fade-in slide-in-from-top-4 duration-300">
                <div className={`w-full max-w-md p-4 rounded-xl shadow-2xl border backdrop-blur-xl flex items-center justify-center gap-3 ${error
                  ? 'bg-red-500/10 border-red-500/30 text-red-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  }`}>
                  {error ? (
                    <>
                      <div className="p-2 rounded-full bg-red-500/20 animate-pulse">
                        <Shield className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="font-medium text-sm">{error}</span>
                    </>
                  ) : (
                    <>
                      <div className="p-2 rounded-full bg-emerald-500/20">
                        <Wifi className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="font-medium text-sm">{notification}</span>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
