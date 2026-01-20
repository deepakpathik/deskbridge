import { Monitor, Zap, Users, Settings, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { ConnectionStatus, Connection } from '../../App';

interface HomeScreenProps {
  connectionStatus: ConnectionStatus;
  onConnect: (deviceId: string) => void;
  onAcceptConnection: () => void;
  onOpenSettings: () => void;
}

const recentConnections: Connection[] = [
  {
    id: '1',
    deviceId: '847291',
    deviceName: 'MacBook Pro - Design Team',
    lastConnected: '2 hours ago',
    duration: '45 min',
  },
  {
    id: '2',
    deviceId: '593847',
    deviceName: 'Windows Desktop - Dev Server',
    lastConnected: 'Yesterday',
    duration: '1h 20min',
  },
  {
    id: '3',
    deviceId: '234091',
    deviceName: 'Linux Workstation',
    lastConnected: '3 days ago',
    duration: '30 min',
  },
];

export function HomeScreen({ connectionStatus, onConnect, onAcceptConnection, onOpenSettings }: HomeScreenProps) {
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [copied, setCopied] = useState(false);
  const myDeviceId = '452-891-376';

  const handleCopyId = () => {
    navigator.clipboard.writeText(myDeviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = () => {
    if (deviceIdInput.trim()) {
      onConnect(deviceIdInput);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'online':
        return 'bg-emerald-400';
      case 'connecting':
        return 'bg-amber-400';
      case 'connected':
        return 'bg-blue-400';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'online':
        return 'Online';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
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
                      {myDeviceId}
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
                    disabled={!deviceIdInput.trim() || connectionStatus === 'connecting'}
                    className="w-full py-5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-emerald-500/30 disabled:shadow-none hover:shadow-emerald-500/50 hover:scale-[1.02] duration-200 disabled:hover:scale-100"
                  >
                    {connectionStatus === 'connecting' ? (
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

            {/* Recent Connections - Glass Card */}
            <div className="rounded-3xl p-8 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Connections</h2>
                <div className="px-3 py-1 rounded-lg bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 text-xs font-semibold text-blue-400">
                  {recentConnections.length} saved
                </div>
              </div>

              <div className="space-y-3">
                {recentConnections.map((conn) => (
                  <button
                    key={conn.id}
                    onClick={() => onConnect(conn.deviceId)}
                    className="w-full p-5 backdrop-blur-xl bg-black/20 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl transition-all text-left group hover:scale-[1.02] duration-200 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1.5 group-hover:text-cyan-400 transition-colors">
                          {conn.deviceName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                            {conn.deviceId}
                          </span>
                          <span>•</span>
                          <span>{conn.lastConnected}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-medium">
                        {conn.duration}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
