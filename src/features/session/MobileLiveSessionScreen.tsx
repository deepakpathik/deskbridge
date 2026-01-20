import { useState, useEffect } from 'react';
import { 
  Monitor, 
  Maximize2, 
  Volume2, 
  VolumeX,
  MousePointer,
  Keyboard,
  PhoneOff,
  Activity,
  Wifi,
  MoreVertical,
  ChevronDown,
  Settings
} from 'lucide-react';

interface MobileLiveSessionScreenProps {
  onDisconnect: () => void;
}

export function MobileLiveSessionScreen({ onDisconnect }: MobileLiveSessionScreenProps) {
  const [showControls, setShowControls] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mouseControl, setMouseControl] = useState(true);
  const [keyboardControl, setKeyboardControl] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [latency, setLatency] = useState(24);
  const [fps, setFps] = useState(60);
  const [bandwidth, setBandwidth] = useState(4.2);

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(20 + Math.random() * 10));
      setFps(Math.floor(58 + Math.random() * 4));
      setBandwidth(3.8 + Math.random() * 0.8);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getQualityColor = () => {
    if (latency < 30 && fps > 55) return 'text-emerald-400';
    if (latency < 50 && fps > 45) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="w-full h-full relative bg-black flex flex-col">
      {/* Mobile Header - Collapsible */}
      <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}>
        {/* Top Bar */}
        <div className="backdrop-blur-2xl bg-black/60 border-b border-white/10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowControls(false)}
                className="p-2 rounded-lg backdrop-blur-xl bg-white/5 active:bg-white/10 transition-all"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <div>
                <div className="text-xs font-semibold">MacBook Pro - Design</div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  Connected
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 rounded-lg backdrop-blur-xl bg-white/5 active:bg-white/10 transition-all"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Bar */}
          {showStats && (
            <div className="px-4 pb-3 grid grid-cols-3 gap-2">
              <div className="backdrop-blur-xl bg-black/40 rounded-xl p-3 border border-white/10">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Latency</div>
                <div className={`text-sm font-bold font-mono ${getQualityColor()}`}>{latency}ms</div>
              </div>
              <div className="backdrop-blur-xl bg-black/40 rounded-xl p-3 border border-white/10">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">FPS</div>
                <div className={`text-sm font-bold font-mono ${getQualityColor()}`}>{fps}</div>
              </div>
              <div className="backdrop-blur-xl bg-black/40 rounded-xl p-3 border border-white/10">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Speed</div>
                <div className="text-sm font-bold font-mono text-cyan-400">{bandwidth.toFixed(1)}MB</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Video Stream Container */}
      <div className="flex-1 relative overflow-hidden" onClick={() => setShowControls(!showControls)}>
        {/* Simulated Remote Desktop Stream */}
        <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center">
          {/* Mobile Desktop Simulation */}
          <div className="w-full h-full p-4 relative">
            {/* Fake desktop wallpaper with grid pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(100, 149, 237, 0.15) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(100, 149, 237, 0.15) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px'
              }}
            />
            
            {/* Simulated windows - scaled for mobile */}
            <div className="relative w-full h-full">
              {/* Window 1 - Code Editor */}
              <div className="absolute top-6 left-4 right-4 h-48 bg-[#1e1e1e] rounded-lg shadow-2xl border border-white/10 overflow-hidden">
                <div className="h-6 bg-[#2d2d2d] flex items-center px-3 gap-1.5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 ml-2">main.tsx</span>
                </div>
                <div className="p-3 font-mono text-[10px] text-gray-300 space-y-0.5">
                  <div><span className="text-purple-400">import</span> <span className="text-blue-400">React</span></div>
                  <div><span className="text-purple-400">function</span> <span className="text-yellow-400">App</span>()</div>
                  <div className="pl-2"><span className="text-purple-400">return</span> {'<div>Hello</div>'}</div>
                </div>
              </div>

              {/* Window 2 - Browser */}
              <div className="absolute bottom-24 left-4 right-4 h-56 bg-white rounded-lg shadow-2xl overflow-hidden">
                <div className="h-8 bg-gray-100 flex items-center px-3 gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="flex-1 mx-2 bg-white rounded px-2 py-1 text-[10px] text-gray-600 border">
                    deskbridge.app
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="space-y-2">
                    <div className="h-6 bg-white rounded shadow-sm"></div>
                    <div className="h-20 bg-white rounded shadow-sm"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-16 bg-white rounded shadow-sm"></div>
                      <div className="h-16 bg-white rounded shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Stream Indicator */}
        <div className="absolute top-20 left-4 flex items-center gap-2 px-3 py-2 backdrop-blur-2xl bg-red-500/20 rounded-xl border border-red-500/50 shadow-lg">
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <span className="text-[10px] font-bold tracking-wide">LIVE</span>
        </div>

        {/* Tap to show controls hint */}
        {!showControls && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-xl bg-black/60 px-6 py-3 rounded-full border border-white/20 animate-pulse">
            <p className="text-xs text-gray-300">Tap to show controls</p>
          </div>
        )}
      </div>

      {/* Bottom Control Bar - Floating */}
      <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="p-4">
          <div className="backdrop-blur-2xl bg-black/60 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Control Buttons */}
            <div className="p-4">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {/* Mouse Control */}
                <button
                  onClick={() => setMouseControl(!mouseControl)}
                  className={`aspect-square rounded-2xl transition-all ${
                    mouseControl 
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/30' 
                      : 'bg-white/5 border border-white/10'
                  } flex flex-col items-center justify-center gap-1 active:scale-95`}
                >
                  <MousePointer className="w-5 h-5" />
                  <span className="text-[10px]">Mouse</span>
                </button>

                {/* Keyboard Control */}
                <button
                  onClick={() => setKeyboardControl(!keyboardControl)}
                  className={`aspect-square rounded-2xl transition-all ${
                    keyboardControl 
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/30' 
                      : 'bg-white/5 border border-white/10'
                  } flex flex-col items-center justify-center gap-1 active:scale-95`}
                >
                  <Keyboard className="w-5 h-5" />
                  <span className="text-[10px]">Keyboard</span>
                </button>

                {/* Audio */}
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`aspect-square rounded-2xl transition-all ${
                    audioEnabled 
                      ? 'bg-white/5 border border-white/10' 
                      : 'bg-red-500/20 border border-red-500/30'
                  } flex flex-col items-center justify-center gap-1 active:scale-95`}
                >
                  {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-400" />}
                  <span className="text-[10px]">Audio</span>
                </button>

                {/* Settings */}
                <button
                  className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-[10px]">Settings</span>
                </button>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={onDisconnect}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 active:scale-95 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-red-500/30"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Safe area padding for mobile notches */}
        <div className="h-safe-area-inset-bottom"></div>
      </div>
    </div>
  );
}
