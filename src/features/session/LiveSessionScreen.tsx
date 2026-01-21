import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Monitor,
  Maximize,
  Minimize,
  Settings,
  Volume2,
  VolumeX,
  MousePointer,
  Keyboard,
  PhoneOff,
  Activity,
  Wifi,
  Signal
} from 'lucide-react';

interface LiveSessionScreenProps {
  onDisconnect: () => void;
}

export function LiveSessionScreen({ onDisconnect }: LiveSessionScreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mouseControl, setMouseControl] = useState(true);
  const [keyboardControl, setKeyboardControl] = useState(true);
  const [latency, setLatency] = useState(24);
  const [fps, setFps] = useState(60);
  const [bandwidth, setBandwidth] = useState(4.2);

  const { remoteDeviceId } = useAppStore();


  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(20 + Math.random() * 10));
      setFps(Math.floor(58 + Math.random() * 4));
      setBandwidth(3.8 + Math.random() * 0.8);
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowToolbar(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!isFullscreen) return;
        setShowToolbar(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isFullscreen]);

  const getQualityColor = () => {
    if (latency < 30 && fps > 55) return 'text-emerald-400';
    if (latency < 50 && fps > 45) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="w-full h-full relative bg-black">
      <div className="w-full h-full relative overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="w-full h-full p-8 relative">
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(100, 149, 237, 0.15) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(100, 149, 237, 0.15) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />

            <div className="relative w-full h-full">
              <div className="absolute top-12 left-12 w-[600px] h-[400px] bg-[#1e1e1e] rounded-lg shadow-2xl border border-white/10 overflow-hidden">
                <div className="h-8 bg-[#2d2d2d] flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">main.tsx</span>
                </div>
                <div className="p-4 font-mono text-xs text-gray-300 space-y-1">
                  <div><span className="text-purple-400">import</span> <span className="text-blue-400">React</span> <span className="text-purple-400">from</span> <span className="text-green-400">'react'</span>;</div>
                  <div><span className="text-purple-400">import</span> {'{ WebRTC }'} <span className="text-purple-400">from</span> <span className="text-green-400">'./webrtc'</span>;</div>
                  <div className="h-2"></div>
                  <div><span className="text-purple-400">function</span> <span className="text-yellow-400">App</span>() {'{'}</div>
                  <div className="pl-4"><span className="text-purple-400">const</span> [stream, setStream] = <span className="text-blue-400">useState</span>(<span className="text-orange-400">null</span>);</div>
                  <div className="pl-4"><span className="text-purple-400">return</span> {'<'}<span className="text-blue-400">VideoStream</span> stream={'{stream}'} /{'>'}</div>
                  <div>{'}'}</div>
                </div>
              </div>

              <div className="absolute top-32 right-24 w-[500px] h-[350px] bg-white rounded-lg shadow-2xl border border-white/10 overflow-hidden">
                <div className="h-10 bg-gray-100 flex items-center px-4 gap-2 border-b border-gray-200">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="flex-1 mx-4 bg-white rounded px-3 py-1 text-xs text-gray-600 border border-gray-200">
                    deskbridge.app/dashboard
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="space-y-3">
                    <div className="h-8 bg-white rounded shadow-sm"></div>
                    <div className="h-32 bg-white rounded shadow-sm"></div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-24 bg-white rounded shadow-sm"></div>
                      <div className="h-24 bg-white rounded shadow-sm"></div>
                      <div className="h-24 bg-white rounded shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-12 left-24 w-[550px] h-[200px] bg-black/90 rounded-lg shadow-2xl border border-emerald-500/30 overflow-hidden">
                <div className="h-7 bg-gray-900 flex items-center px-4 gap-2 border-b border-emerald-500/20">
                  <span className="text-xs text-emerald-400">terminal</span>
                </div>
                <div className="p-4 font-mono text-xs text-emerald-400 space-y-1">
                  <div>$ npm run dev</div>
                  <div className="text-gray-500">Starting development server...</div>
                  <div className="text-gray-500">WebRTC connection established</div>
                  <div className="text-gray-500">Stream active: 1920x1080 @ 60fps</div>
                  <div className="flex">
                    <span>$ </span>
                    <span className="animate-pulse">_</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-6 left-6 flex items-center gap-3 px-5 py-3 backdrop-blur-2xl bg-red-500/20 rounded-2xl border border-red-500/50 shadow-2xl shadow-red-500/20">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
            <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <span className="text-sm font-bold tracking-wide">LIVE STREAM</span>
        </div>

        <div className="absolute top-6 right-6 backdrop-blur-2xl bg-black/40 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center gap-5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-400/30">
                  <Activity className={`w-4 h-4 ${getQualityColor()}`} />
                </div>
                <div>
                  <div className="text-gray-400 text-[10px] uppercase tracking-wide">Latency</div>
                  <div className={`font-mono font-bold ${getQualityColor()}`}>{latency}ms</div>
                </div>
              </div>

              <div className="w-px h-10 bg-white/10"></div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-400/30">
                  <Monitor className={`w-4 h-4 ${getQualityColor()}`} />
                </div>
                <div>
                  <div className="text-gray-400 text-[10px] uppercase tracking-wide">Frame Rate</div>
                  <div className={`font-mono font-bold ${getQualityColor()}`}>{fps} FPS</div>
                </div>
              </div>

              <div className="w-px h-10 bg-white/10"></div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-400/30">
                  <Wifi className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="text-gray-400 text-[10px] uppercase tracking-wide">Bandwidth</div>
                  <div className="font-mono font-bold text-cyan-400">{bandwidth.toFixed(1)} Mbps</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 ${showToolbar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-3xl"></div>

          <div className="relative px-8 py-5 backdrop-blur-2xl bg-black/60 rounded-3xl border border-white/30 shadow-2xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMouseControl(!mouseControl)}
                className={`p-4 rounded-xl transition-all duration-200 ${mouseControl
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white backdrop-blur-xl border border-white/10'
                  }`}
                title="Mouse Control"
              >
                <MousePointer className="w-5 h-5" />
              </button>

              <button
                onClick={() => setKeyboardControl(!keyboardControl)}
                className={`p-4 rounded-xl transition-all duration-200 ${keyboardControl
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white backdrop-blur-xl border border-white/10'
                  }`}
                title="Keyboard Control"
              >
                <Keyboard className="w-5 h-5" />
              </button>

              <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-2"></div>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-4 rounded-xl backdrop-blur-xl border border-white/10 transition-all duration-200 ${audioEnabled
                  ? 'bg-white/5 hover:bg-white/10 text-white'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30'
                  }`}
                title="Audio"
              >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all backdrop-blur-xl border border-white/10 hover:border-white/20 hover:scale-105 duration-200"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>

              <button
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all backdrop-blur-xl border border-white/10 hover:border-white/20 hover:scale-105 duration-200"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-2"></div>

              <button
                onClick={onDisconnect}
                className="px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all flex items-center gap-2 font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 duration-200"
                title="Disconnect"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Session</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 px-5 py-3 backdrop-blur-2xl bg-black/40 rounded-2xl border border-white/20 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
          <div className="text-xs">
            <span className="text-gray-400">Connected to:</span>
            <span className="text-white font-semibold ml-2">{remoteDeviceId || 'Unknown Device'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
