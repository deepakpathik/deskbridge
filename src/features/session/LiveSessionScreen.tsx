import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { VideoPreview } from '../../components/VideoPreview';
import { webrtcService } from '../../services/webrtcService';
import { socketService } from '../../services/socketService';
import {
  Monitor,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  MousePointer,
  Keyboard,
  PhoneOff,
  Activity,
  Wifi,
  Cast
} from 'lucide-react';

interface LiveSessionScreenProps {
  onDisconnect: () => void;
}

import { useWebRTC } from '../../hooks/useWebRTC';

export function LiveSessionScreen({ onDisconnect }: LiveSessionScreenProps) {
  useWebRTC(); // Initialize WebRTC signaling and handshake handling

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mouseControl, setMouseControl] = useState(true);
  const [keyboardControl, setKeyboardControl] = useState(true);
  const [latency, setLatency] = useState(24);
  const [fps, setFps] = useState(60);
  const [bandwidth, setBandwidth] = useState(4.2);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { remoteDeviceId, isCaller } = useAppStore();

  useEffect(() => {
    // Host Logic: Handle incoming control data
    webrtcService.onControlData((action) => {
      if (window.electronAPI?.performControlAction) {
        window.electronAPI.performControlAction(action);
      }
    });

    // Guest Logic: Handle incoming remote stream
    webrtcService.onTrack((stream) => {
      setRemoteStream(stream);
    });

    // Clean up
    return () => {
      webrtcService.cleanup();
      setLocalStream(null);
      setRemoteStream(null);
    };
  }, []);

  const handleStartShare = async () => {
    setError(null);
    try {
      const stream = await webrtcService.startScreenShare();
      setLocalStream(stream);

      // Add tracks to the peer connection
      const pc = webrtcService.getPeerConnection();
      if (pc) {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // Trigger Renegotiation manually by creating and sending a new offer
        console.log("Creating new offer for screen share...");
        const offer = await webrtcService.createOffer();
        if (remoteDeviceId) {
          socketService.sendOffer(remoteDeviceId, offer);
        }
      }
    } catch (err: any) {
      console.error("Failed to share screen", err);
      if (err.name === 'NotAllowedError') {
        setError('Permission denied. Please allow screen recording access.');
      } else {
        setError('Failed to start screen share. Please try again.');
      }
    }
  };

  const getQualityColor = () => {
    if (latency < 30 && fps > 55) return 'text-emerald-400';
    if (latency < 50 && fps > 45) return 'text-amber-400';
    return 'text-red-400';
  };

  // Remote Control Handlers (Guest Side)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseControl || !remoteStream) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    webrtcService.sendControlData({ type: 'mousemove', x, y });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseControl || !remoteStream) return;
    webrtcService.sendControlData({ type: 'mousedown', button: e.button === 0 ? 'left' : 'right' });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseControl || !remoteStream) return;
    webrtcService.sendControlData({ type: 'mouseup', button: e.button === 0 ? 'left' : 'right' });
  };

  // Keyboard listener could be global or on div with tabindex
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!keyboardControl || !remoteStream) return;
      // Basic mapping for now
      let key = e.key;
      if (key.length === 1) {
        webrtcService.sendControlData({ type: 'keydown', key, modifiers: [] });
      }
    };

    if (remoteStream) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyboardControl, remoteStream]);


  const activeStream = isCaller ? remoteStream : localStream;

  return (
    <div className="w-full h-full relative bg-black">
      <div className="w-full h-full relative overflow-hidden">
        {activeStream ? (
          <div
            className="w-full h-full flex items-center justify-center bg-black cursor-none"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onContextMenu={(e) => e.preventDefault()}
          >
            <VideoPreview stream={activeStream} className="w-full h-full object-contain pointer-events-none" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center">
            {/* ... Existing Placeholder for Host ... */}
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

              <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
                {/* Only show Start Sharing for Host */}
                {!isCaller ? (
                  <div className="p-8 rounded-3xl bg-white/5 border-2 border-white/30 backdrop-blur-xl text-center space-y-4 shadow-2xl">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                      <Cast className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Start Sharing</h2>
                      <p className="text-gray-400 mt-2">Share your screen with the connected device</p>
                    </div>
                    <button
                      onClick={handleStartShare}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                    >
                      Share Screen
                    </button>
                    {remoteDeviceId && <p className="text-xs text-gray-500 pt-2">Connected to: {remoteDeviceId}</p>}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-blue-400 font-medium">Waiting for video stream...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-6 left-6 flex items-center gap-3 px-5 py-3 backdrop-blur-2xl bg-red-500/20 rounded-2xl border-2 border-red-500/50 shadow-2xl shadow-red-500/20">
          <div className="relative flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full shadow-lg ${activeStream ? 'bg-red-500 animate-pulse shadow-red-500/50' : 'bg-gray-500'}`}></div>
            {activeStream && <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"></div>}
          </div>
          <span className="text-sm font-bold tracking-wide">{activeStream ? 'LIVE STREAM' : (isCaller ? 'WAITING' : 'READY TO SHARE')}</span>
        </div>

        {/* Existing Stats Panel ... */}
        <div className="absolute top-6 right-6 backdrop-blur-2xl bg-black/40 rounded-2xl border-2 border-white/30 shadow-2xl overflow-hidden">
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

              <div className="w-1 h-10 bg-white/30 rounded-full"></div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-400/30">
                  <Monitor className={`w-4 h-4 ${getQualityColor()}`} />
                </div>
                <div>
                  <div className="text-gray-400 text-[10px] uppercase tracking-wide">Frame Rate</div>
                  <div className={`font-mono font-bold ${getQualityColor()}`}>{fps} FPS</div>
                </div>
              </div>

              <div className="w-1 h-10 bg-white/30 rounded-full"></div>

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

          <div className="relative px-8 py-5 backdrop-blur-2xl bg-black/60 rounded-3xl border-2 border-white/50 shadow-2xl">
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

              <div className="w-1 h-10 bg-gradient-to-b from-transparent via-white/40 to-transparent mx-2 rounded-full"></div>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-4 rounded-xl backdrop-blur-xl border border-white/10 transition-all duration-200 ${audioEnabled
                  ? 'bg-white/5 hover:bg-white/10 text-white'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-2 border-red-500/40'
                  }`}
                title="Audio"
              >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all backdrop-blur-xl border-2 border-white/30 hover:border-white/50 hover:scale-105 duration-200"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>

              {/* Only show "Share Screen" button in toolbar if I am Host */}
              {!isCaller && (
                <button
                  onClick={handleStartShare}
                  className={`p-4 rounded-xl backdrop-blur-xl border-2 border-white/30 transition-all duration-200 ${localStream
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-white'
                    }`}
                  title={localStream ? "Sharing Screen" : "Start Sharing"}
                >
                  <Cast className="w-5 h-5" />
                </button>
              )}

              <div className="w-1 h-10 bg-gradient-to-b from-transparent via-white/40 to-transparent mx-2 rounded-full"></div>

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

      <div className="absolute bottom-8 left-8 px-5 py-3 backdrop-blur-2xl bg-black/40 rounded-2xl border-2 border-white/30 shadow-2xl">
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
