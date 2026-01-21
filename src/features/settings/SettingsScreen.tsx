import { useState } from 'react';
import {
  X,
  Monitor,
  Video,
  Lock,
  Palette,
  Bell,
  Save,
  RotateCcw,
  ChevronRight,
  Shield
} from 'lucide-react';
import navbarLogo from '../../assets/navbar_logo.png';
import { useAppStore } from '../../store/useAppStore';

interface SettingsScreenProps {
  onClose: () => void;
}

type SettingsTab = 'streaming' | 'security' | 'appearance' | 'notifications';

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('streaming');
  const [resolution, setResolution] = useState('1920x1080');
  const [fps, setFps] = useState('60');
  const [codec, setCodec] = useState('H.264');
  const [bitrate, setBitrate] = useState('8');
  const [theme, setTheme] = useState('dark');
  const [requirePassword, setRequirePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);

  const { status, isSocketConnected } = useAppStore();

  const getStatusColor = () => {
    switch (status) {
      case 'CONNECTED': return '#10b981'; // Emerald-500
      case 'CONNECTING': return '#f59e0b'; // Amber-500
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
      case 'IN_SESSION': return 'Active Session';
      case 'DISCONNECTED': return 'Disconnected';
      case 'IDLE': return isSocketConnected ? 'Online' : 'Offline';
      default: return 'Offline';
    }
  };

  const tabs = [
    { id: 'streaming' as const, label: 'Streaming Quality', icon: Video, color: 'from-blue-500 to-cyan-500' },
    { id: 'security' as const, label: 'Security & Privacy', icon: Lock, color: 'from-purple-500 to-pink-500' },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette, color: 'from-orange-500 to-amber-500' },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, color: 'from-emerald-500 to-green-500' },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <header className="flex items-center justify-between px-8 py-3 backdrop-blur-2xl bg-gray-900/60 border-2 border-white/30 shadow-lg relative mx-12 mt-8 rounded-full">
        {/* Left: Logo */}
        <div className="flex items-center gap-4 z-10">
          <img
            src={navbarLogo}
            alt="DeskBridge"
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Center: Title */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        {/* Right: Close Button */}
        <div className="z-10 flex items-center gap-4">
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
            onClick={onClose}
            className="p-3 rounded-xl hover:bg-white/10 transition-all backdrop-blur-xl bg-white/[0.03] border-2 border-white/30 hover:border-white/40 shadow-lg hover:scale-105 duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 shadow-2xl p-6 backdrop-blur-3xl bg-black/40 relative z-10">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group ${isActive
                    ? 'backdrop-blur-xl bg-gradient-to-r ' + tab.color + ' text-white shadow-xl scale-[1.02]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white backdrop-blur-xl'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${isActive
                    ? 'bg-white/20'
                    : 'bg-white/5 group-hover:bg-white/10'
                    } transition-all`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold flex-1 text-left">{tab.label}</span>
                  {isActive && (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 p-5 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/30">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white mb-1">Secure Connection</div>
                <div className="text-xs text-gray-400 leading-relaxed">
                  All connections use end-to-end encryption
                </div>
              </div>
            </div>
          </div>
          {/* Absolute Vertical Divider */}
          <div className="absolute top-0 right-0 w-[6px] h-full bg-white z-50"></div>
        </div>



        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'streaming' && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Streaming Quality
                  </h2>
                  <p className="text-sm text-gray-400">
                    Configure video streaming settings for optimal performance and quality
                  </p>
                </div>

                <div className="backdrop-blur-3xl bg-black/20 rounded-2xl p-8 border-2 border-white/30 shadow-2xl">
                  <label className="block text-base font-semibold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                      <Monitor className="w-4 h-4 text-blue-400" />
                    </div>
                    Resolution
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['1920x1080', '1680x1050', '1440x900', '1280x720'].map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`py-4 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${resolution === res
                          ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                          : 'backdrop-blur-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                          }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 px-1">
                    Higher resolution provides better quality but requires more bandwidth
                  </p>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-8 border border-white/20 shadow-xl">
                  <label className="block text-base font-semibold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-400/30">
                      <Video className="w-4 h-4 text-purple-400" />
                    </div>
                    Frame Rate (FPS)
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {['30', '45', '60', '75', '120'].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setFps(rate)}
                        className={`py-4 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${fps === rate
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                          : 'backdrop-blur-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                          }`}
                      >
                        {rate}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 px-1">
                    Higher frame rates provide smoother motion but increase CPU usage
                  </p>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-8 border border-white/20 shadow-xl">
                  <label className="block text-base font-semibold mb-4">Video Codec</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['VP8', 'VP9', 'H.264'].map((codecOption) => (
                      <button
                        key={codecOption}
                        onClick={() => setCodec(codecOption)}
                        className={`py-4 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${codec === codecOption
                          ? 'bg-gradient-to-br from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                          : 'backdrop-blur-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                          }`}
                      >
                        {codecOption}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 p-4 backdrop-blur-xl bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-xs text-blue-300 leading-relaxed">
                      <strong className="text-blue-200">H.264</strong> - Best compatibility and quality. Recommended for most users.
                    </p>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-8 border border-white/20 shadow-xl">
                  <label className="block text-base font-semibold mb-4">
                    Target Bitrate: <span className="text-cyan-400 font-mono">{bitrate} Mbps</span>
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={bitrate}
                      onChange={(e) => setBitrate(e.target.value)}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(parseInt(bitrate) - 1) / 19 * 100}%, rgba(255,255,255,0.1) ${(parseInt(bitrate) - 1) / 19 * 100}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-3 px-1">
                    <span className="font-semibold">1 Mbps</span>
                    <span className="text-gray-600">Low Quality</span>
                    <span className="text-gray-600">High Quality</span>
                    <span className="font-semibold">20 Mbps</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 px-1">
                    Higher bitrate provides better quality but requires more bandwidth
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Security & Privacy
                  </h2>
                  <p className="text-sm text-gray-400">
                    Manage security settings and privacy options
                  </p>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-8 border border-white/20 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Require Password</h3>
                      <p className="text-sm text-gray-400">
                        Require a password for incoming connections
                      </p>
                    </div>
                    <button
                      onClick={() => setRequirePassword(!requirePassword)}
                      className={`relative w-16 h-8 rounded-full transition-all duration-200 ${requirePassword ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-white/10'
                        }`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-200 ${requirePassword ? 'translate-x-9' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl p-8 border border-emerald-500/30 shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl flex items-center justify-center flex-shrink-0 border border-emerald-400/30 shadow-lg shadow-emerald-500/20">
                      <Lock className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">End-to-End Encryption</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        All connections are encrypted using DTLS-SRTP with WebRTC
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/30">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span className="text-emerald-400 font-semibold">Encryption Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-8 border border-white/20 shadow-xl">
                  <h3 className="font-semibold text-lg mb-3">Auto Disconnect</h3>
                  <p className="text-sm text-gray-400 mb-5">
                    Automatically disconnect after period of inactivity
                  </p>
                  <select className="w-full px-5 py-4 backdrop-blur-xl bg-black/30 border-2 border-white/40 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all font-medium">
                    <option>Never</option>
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>

                {/* Allowed Devices - Glass Card */}
                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-8 border-2 border-white/30 shadow-xl">
                  <h3 className="font-semibold text-lg mb-3">Connection Whitelist</h3>
                  <p className="text-sm text-gray-400 mb-5">
                    Only allow connections from specific device IDs
                  </p>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/30 hover:scale-105 duration-200">
                    Manage Whitelist
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                    Appearance
                  </h2>
                  <p className="text-sm text-gray-400">
                    Customize the look and feel of DeskBridge
                  </p>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-8 border border-white/20 shadow-xl">
                  <label className="block text-base font-semibold mb-5">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light', preview: 'bg-gradient-to-br from-gray-100 to-gray-200' },
                      { id: 'dark', label: 'Dark', preview: 'bg-gradient-to-br from-gray-900 to-black' },
                      { id: 'auto', label: 'Auto', preview: 'bg-gradient-to-br from-gray-100 via-gray-500 to-gray-900' },
                    ].map((themeOption) => (
                      <button
                        key={themeOption.id}
                        onClick={() => setTheme(themeOption.id)}
                        className={`p-5 rounded-2xl border-2 transition-all duration-200 ${theme === themeOption.id
                          ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-lg shadow-blue-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                          }`}
                      >
                        <div className={`w-full h-20 rounded-xl mb-3 ${themeOption.preview} shadow-inner`}></div>
                        <div className="text-sm font-semibold">{themeOption.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-8 border border-white/20 shadow-xl">
                  <label className="block text-base font-semibold mb-5">UI Scale</label>
                  <input
                    type="range"
                    min="80"
                    max="120"
                    defaultValue="100"
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: 'linear-gradient(to right, #3b82f6 0%, #3b82f6 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 100%)'
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-3">
                    <span className="font-semibold">80%</span>
                    <span className="font-semibold text-white">100%</span>
                    <span className="font-semibold">120%</span>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-8 border border-white/20 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Window Transparency</h3>
                      <p className="text-sm text-gray-400">
                        Enable transparency effects (requires restart)
                      </p>
                    </div>
                    <button className="relative w-16 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600">
                      <div className="absolute top-1 w-6 h-6 rounded-full bg-white translate-x-9 shadow-lg" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    Notifications
                  </h2>
                  <p className="text-sm text-gray-400">
                    Manage notification preferences
                  </p>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-8 border border-white/20 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Desktop Notifications</h3>
                      <p className="text-sm text-gray-400">
                        Show notifications for connection events
                      </p>
                    </div>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`relative w-16 h-8 rounded-full transition-all duration-200 ${showNotifications ? 'bg-gradient-to-r from-emerald-600 to-green-600' : 'bg-white/10'
                        }`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-200 ${showNotifications ? 'translate-x-9' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    'Incoming connection requests',
                    'Connection established',
                    'Connection ended',
                    'Quality warnings',
                  ].map((item) => (
                    <div
                      key={item}
                      className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-xl p-6 border border-white/20 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-all duration-200"
                    >
                      <span className="text-sm font-medium">{item}</span>
                      <button className="relative w-16 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600">
                        <div className="absolute top-1 w-6 h-6 rounded-full bg-white translate-x-9 shadow-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-10 pt-8 border-t border-white/10">
              <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-500 transition-all font-semibold flex items-center gap-2 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 duration-200">
                <Save className="w-5 h-5" />
                Save Changes
              </button>

              <button className="px-8 py-4 rounded-xl backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all font-semibold flex items-center gap-2 border-2 border-white/30 hover:border-white/40 hover:scale-105 duration-200">
                <RotateCcw className="w-5 h-5" />
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
