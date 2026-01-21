import { Monitor, Zap, Users, Settings, Copy, Check, Sparkles, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface MobileHomeScreenProps {
  onAcceptConnection: () => void;
  onOpenSettings: () => void;
}

export function MobileHomeScreen({ onAcceptConnection, onOpenSettings }: MobileHomeScreenProps) {
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
      <header className="flex items-center justify-between px-5 py-4 backdrop-blur-2xl bg-white/[0.02] border-b border-white/10 shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Monitor className="w-5 h-5" />
            <div className="absolute -top-0.5 -right-0.5">
              <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              DeskBridge
            </h1>
            <p className="text-[10px] text-gray-400 font-medium">Remote Desktop</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] backdrop-blur-xl border border-white/20">
            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor()} animate-pulse`}></div>
            <span className="text-xs font-medium">{getStatusText()}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg hover:bg-white/10 transition-all backdrop-blur-xl bg-white/[0.03] border border-white/10"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-5 py-6">
        <div className="space-y-5">
          <div className="group rounded-3xl p-6 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl flex items-center justify-center border border-blue-400/30 shadow-lg shadow-blue-500/20">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-bold">Your Device ID</h2>
                <p className="text-xs text-gray-400">Share to receive connections</p>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-black/30 rounded-2xl p-5 mb-5 border border-white/10 shadow-inner">
              <div className="text-center">
                <div className="text-3xl font-bold tracking-wider mb-2 font-mono bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {displayDeviceId}
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Your Device ID</p>
              </div>
            </div>

            <button
              onClick={handleCopyId}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 active:scale-95 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-500/30"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy ID
                </>
              )}
            </button>
          </div>

          <div className="rounded-3xl p-6 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl flex items-center justify-center border border-emerald-400/30 shadow-lg shadow-emerald-500/20">
                <Monitor className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-bold">Connect to Device</h2>
                <p className="text-xs text-gray-400">Enter remote device ID</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={deviceIdInput}
                onChange={(e) => setDeviceIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                placeholder="xxx-xxx-xxx"
                className="w-full px-4 py-4 bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl text-center text-xl font-mono tracking-wider focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-inner placeholder:text-gray-600"
              />

              <button
                onClick={handleConnect}
                disabled={!deviceIdInput.trim() || status === 'CONNECTING'}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed active:scale-95 transition-all font-semibold shadow-lg shadow-emerald-500/30 disabled:shadow-none"
              >
                {status === 'CONNECTING' ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Connecting...
                  </span>
                ) : (
                  'Connect Now'
                )}
              </button>
            </div>
          </div>

          <div className="rounded-3xl p-6 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl flex items-center justify-center border border-purple-400/30 shadow-lg shadow-purple-500/20">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="font-bold">Accept Connection</h2>
                <p className="text-xs text-gray-400">Allow remote access</p>
              </div>
            </div>

            <button
              onClick={onAcceptConnection}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 active:scale-95 transition-all font-semibold shadow-lg shadow-purple-500/30"
            >
              Accept Incoming Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
