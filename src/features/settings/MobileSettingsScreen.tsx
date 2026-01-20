import { useState } from 'react';
import {
    X,
    Monitor,
    Video,
    Lock,
    Palette,
    Bell,
    Save,
    ChevronRight,
    Sparkles,
    Shield,
    Activity,
    Wifi
} from 'lucide-react';

interface MobileSettingsScreenProps {
    onClose: () => void;
}

type SettingsSection = 'main' | 'streaming' | 'security' | 'appearance' | 'notifications';

export function MobileSettingsScreen({ onClose }: MobileSettingsScreenProps) {
    const [currentSection, setCurrentSection] = useState<SettingsSection>('main');
    const [resolution, setResolution] = useState('1920x1080');
    const [fps, setFps] = useState('60');
    const [codec, setCodec] = useState('H.264');
    const [bitrate, setBitrate] = useState('8');
    const [theme, setTheme] = useState('dark');
    const [requirePassword, setRequirePassword] = useState(false);
    const [showNotifications, setShowNotifications] = useState(true);

    const menuItems = [
        { id: 'streaming' as const, label: 'Streaming Quality', icon: Video, color: 'from-blue-500 to-cyan-500' },
        { id: 'security' as const, label: 'Security & Privacy', icon: Lock, color: 'from-purple-500 to-pink-500' },
        { id: 'appearance' as const, label: 'Appearance', icon: Palette, color: 'from-orange-500 to-amber-500' },
        { id: 'notifications' as const, label: 'Notifications', icon: Bell, color: 'from-emerald-500 to-green-500' },
    ];

    if (currentSection === 'main') {
        return (
            <div className="w-full h-full flex flex-col">
                <header className="flex items-center justify-between px-5 py-4 backdrop-blur-2xl bg-white/[0.02] border-b border-white/10 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Monitor className="w-5 h-5" />
                            <Sparkles className="w-2.5 h-2.5 text-yellow-400 absolute -top-0.5 -right-0.5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Settings
                            </h1>
                            <p className="text-[10px] text-gray-400 font-medium">Configure DeskBridge</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-all backdrop-blur-xl bg-white/[0.03] border border-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-auto px-5 py-6">
                    <div className="space-y-3">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentSection(item.id)}
                                    className="w-full p-5 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/20 rounded-2xl shadow-xl active:scale-95 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} bg-opacity-20 backdrop-blur-xl flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-semibold">{item.label}</div>
                                            <div className="text-xs text-gray-400">Configure settings</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 p-5 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/30">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-sm font-semibold text-white mb-1">Secure Connection</div>
                                <div className="text-xs text-gray-400 leading-relaxed">
                                    All connections use end-to-end encryption via WebRTC DTLS-SRTP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <header className="flex items-center gap-3 px-5 py-4 backdrop-blur-2xl bg-white/[0.02] border-b border-white/10 shadow-lg">
                <button
                    onClick={() => setCurrentSection('main')}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all backdrop-blur-xl bg-white/[0.03] border border-white/10"
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold">
                        {menuItems.find(item => item.id === currentSection)?.label}
                    </h1>
                    <p className="text-xs text-gray-400">Adjust your preferences</p>
                </div>
            </header>

            <div className="flex-1 overflow-auto px-5 py-6">
                {currentSection === 'streaming' && (
                    <div className="space-y-5">
                        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-5 border border-white/20 shadow-xl">
                            <label className="block font-semibold mb-4 flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-blue-400" />
                                Resolution
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {['1920x1080', '1680x1050', '1440x900', '1280x720'].map((res) => (
                                    <button
                                        key={res}
                                        onClick={() => setResolution(res)}
                                        className={`py-3 px-3 rounded-xl text-xs font-semibold transition-all ${resolution === res
                                            ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg'
                                            : 'backdrop-blur-xl bg-white/5 text-gray-400 border border-white/10'
                                            }`}
                                    >
                                        {res}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-5 border border-white/20 shadow-xl">
                            <label className="block font-semibold mb-4 flex items-center gap-2">
                                <Video className="w-4 h-4 text-purple-400" />
                                Frame Rate (FPS)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['30', '60', '120'].map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() => setFps(rate)}
                                        className={`py-3 rounded-xl text-xs font-semibold transition-all ${fps === rate
                                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg'
                                            : 'backdrop-blur-xl bg-white/5 text-gray-400 border border-white/10'
                                            }`}
                                    >
                                        {rate}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-5 border border-white/20 shadow-xl">
                            <label className="block font-semibold mb-4">Video Codec</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['VP8', 'VP9', 'H.264'].map((codecOption) => (
                                    <button
                                        key={codecOption}
                                        onClick={() => setCodec(codecOption)}
                                        className={`py-3 rounded-xl text-xs font-semibold transition-all ${codec === codecOption
                                            ? 'bg-gradient-to-br from-emerald-600 to-cyan-600 text-white shadow-lg'
                                            : 'backdrop-blur-xl bg-white/5 text-gray-400 border border-white/10'
                                            }`}
                                    >
                                        {codecOption}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-5 border border-white/20 shadow-xl">
                            <label className="block font-semibold mb-4">
                                Bitrate: <span className="text-cyan-400">{bitrate} Mbps</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={bitrate}
                                onChange={(e) => setBitrate(e.target.value)}
                                className="w-full h-2 rounded-full appearance-none"
                                style={{
                                    background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(parseInt(bitrate) - 1) / 19 * 100}%, rgba(255,255,255,0.1) ${(parseInt(bitrate) - 1) / 19 * 100}%, rgba(255,255,255,0.1) 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>1 Mbps</span>
                                <span>20 Mbps</span>
                            </div>
                        </div>
                    </div>
                )}

                {currentSection === 'security' && (
                    <div className="space-y-5">
                        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-5 border border-white/20 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1">Require Password</h3>
                                    <p className="text-xs text-gray-400">Password for connections</p>
                                </div>
                                <button
                                    onClick={() => setRequirePassword(!requirePassword)}
                                    className={`relative w-14 h-7 rounded-full transition-all ${requirePassword ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-white/10'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${requirePassword ? 'translate-x-8' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl p-5 border border-emerald-500/30 shadow-xl">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-400/30 flex-shrink-0">
                                    <Lock className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1">End-to-End Encryption</h3>
                                    <p className="text-xs text-gray-400 mb-3">All connections are encrypted</p>
                                    <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 w-fit">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                        <span className="text-emerald-400 font-semibold">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-5 border border-white/20 shadow-xl">
                            <h3 className="font-semibold mb-3">Auto Disconnect</h3>
                            <select className="w-full px-4 py-3 backdrop-blur-xl bg-black/30 border border-white/20 rounded-xl text-sm">
                                <option>Never</option>
                                <option>15 minutes</option>
                                <option>30 minutes</option>
                                <option>1 hour</option>
                            </select>
                        </div>
                    </div>
                )}

                {currentSection === 'appearance' && (
                    <div className="space-y-5">
                        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-5 border border-white/20 shadow-xl">
                            <label className="block font-semibold mb-4">Theme</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'light', label: 'Light', preview: 'bg-gradient-to-br from-gray-100 to-gray-200' },
                                    { id: 'dark', label: 'Dark', preview: 'bg-gradient-to-br from-gray-900 to-black' },
                                    { id: 'auto', label: 'Auto', preview: 'bg-gradient-to-br from-gray-100 via-gray-500 to-gray-900' },
                                ].map((themeOption) => (
                                    <button
                                        key={themeOption.id}
                                        onClick={() => setTheme(themeOption.id)}
                                        className={`p-3 rounded-xl border-2 transition-all ${theme === themeOption.id
                                            ? 'border-blue-500 bg-blue-500/10 scale-105'
                                            : 'border-white/10 bg-white/5'
                                            }`}
                                    >
                                        <div className={`w-full h-16 rounded-lg mb-2 ${themeOption.preview}`}></div>
                                        <div className="text-xs font-semibold">{themeOption.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-5 border border-white/20 shadow-xl">
                            <label className="block font-semibold mb-4">UI Scale</label>
                            <input
                                type="range"
                                min="80"
                                max="120"
                                defaultValue="100"
                                className="w-full h-2 rounded-full appearance-none"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>80%</span>
                                <span>100%</span>
                                <span>120%</span>
                            </div>
                        </div>
                    </div>
                )}

                {currentSection === 'notifications' && (
                    <div className="space-y-5">
                        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-5 border border-white/20 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1">Desktop Notifications</h3>
                                    <p className="text-xs text-gray-400">Show connection events</p>
                                </div>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`relative w-14 h-7 rounded-full transition-all ${showNotifications ? 'bg-gradient-to-r from-emerald-600 to-green-600' : 'bg-white/10'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${showNotifications ? 'translate-x-8' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {[
                                'Connection requests',
                                'Connection established',
                                'Connection ended',
                                'Quality warnings',
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-xl p-4 border border-white/20 flex items-center justify-between"
                                >
                                    <span className="text-sm">{item}</span>
                                    <button className="relative w-14 h-7 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600">
                                        <div className="absolute top-1 w-5 h-5 rounded-full bg-white translate-x-8 shadow-lg" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 p-5">
                <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 active:scale-95 transition-all font-semibold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30">
                    <Save className="w-5 h-5" />
                    Save Changes
                </button>
            </div>
        </div>
    );
}
