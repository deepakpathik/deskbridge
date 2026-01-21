import { Monitor, Zap, Users, Settings, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface HomeScreenProps {
  onAcceptConnection: () => void;
  onOpenSettings: () => void;
}

export function HomeScreen({ onAcceptConnection, onOpenSettings }: HomeScreenProps) {
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [copied, setCopied] = useState(false);
  const { status, myDeviceId, connectToDevice } = useAppStore();

  const displayDeviceId = myDeviceId || 'Generating...';

  const handleCopyId = () => {
    if (myDeviceId) {
      navigator.clipboard.writeText(myDeviceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = () => {
    if (deviceIdInput.trim()) {
      connectToDevice(deviceIdInput);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'IDLE':
        return 'bg-emerald-400';
      case 'CONNECTING':
        return 'bg-amber-400';
      case 'CONNECTED':
        return 'bg-blue-400';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'IDLE':
        return 'Online';
      case 'CONNECTING':
        return 'Connecting...';
      case 'CONNECTED':
        return 'Connected';
      default:
        return 'Offline';
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Glass Header */}
      <header className="flex items-center justify-between px-8 py-6 backdrop-blur-2xl bg-white/[0.02] border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Monitor className="w-7 h-7" />
            <div className="absolute -top-1 -right-1 w-3 h-3">
              <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              DeskBridge
            </h1>
            <p className="text-xs text-gray-400 font-medium">Remote Desktop Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/[0.05] backdrop-blur-xl border border-white/20 shadow-xl">
            <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()} shadow-lg animate-pulse`}></div>
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-3 rounded-xl hover:bg-white/10 transition-all backdrop-blur-xl bg-white/[0.03] border border-white/10 hover:border-white/20 shadow-lg hover:scale-105 duration-200"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-8">
          {/* Left Column - Connection Panel */}
          <div className="space-y-8">
            {/* Your Device ID - Glass Card */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/20 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl flex items-center justify-center border border-blue-400/30 shadow-lg shadow-blue-500/20">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Your Device ID</h2>
                    <p className="text-sm text-gray-400">Share this ID to receive connections</p>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-black/30 rounded-2xl p-8 mb-6 border border-white/10 shadow-inner">
                  <div className="text-center">
                    <div className="text-5xl font-bold tracking-wider mb-3 font-mono bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {displayDeviceId}
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Your Device ID</p>
                  </div>
                </div>

                <button
                  onClick={handleCopyId}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] duration-200"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy Device ID
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Accept Connection - Glass Card */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl flex items-center justify-center border border-purple-400/30 shadow-lg shadow-purple-500/20">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Accept Connection</h2>
                    <p className="text-sm text-gray-400">Allow remote access to this device</p>
                  </div>
                </div>

                <button
                  onClick={onAcceptConnection}
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 transition-all font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] duration-200 bg-[length:200%_100%] hover:bg-right"
                >
                  Accept Incoming Connection
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Connect & Recent */}
          <div className="space-y-8">
            {/* Connect to Device - Glass Card */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/20 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl flex items-center justify-center border border-emerald-400/30 shadow-lg shadow-emerald-500/20">
                    <Monitor className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Connect to Device</h2>
                    <p className="text-sm text-gray-400">Enter remote device ID</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <input
                    type="text"
                    value={deviceIdInput}
                    onChange={(e) => setDeviceIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                    placeholder="xxx-xxx-xxx"
                    className="w-full px-6 py-5 bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl text-center text-2xl font-mono tracking-wider focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-inner placeholder:text-gray-600"
                  />

                  <button
                    onClick={handleConnect}
                    disabled={!deviceIdInput.trim() || status === 'CONNECTING'}
                    className="w-full py-5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-emerald-500/30 disabled:shadow-none hover:shadow-emerald-500/50 hover:scale-[1.02] duration-200 disabled:hover:scale-100"
                  >
                    {status === 'CONNECTING' ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Connecting...
                      </span>
                    ) : (
                      'Connect Now'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Placeholder for Recent Connections or other info if needed, or just allow the layout to breathe. 
                For now, we remove the dummy recent connections to avoid clutter with fake data.
             */}
          </div>
        </div>
      </div>

      {/* Debug: Socket Status Indicator */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-gray-400">
        <div className={`w-2 h-2 rounded-full ${status === 'CONNECTED' || status === 'IN_SESSION' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500/50'}`} />
        {status}
      </div>
    </div>
  );
}
