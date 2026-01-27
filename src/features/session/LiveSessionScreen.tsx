import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { VideoPreview } from '../../components/VideoPreview';
import { webrtcService } from '../../services/webrtcService';
import { socketService } from '../../services/socketService';
import {
  Monitor,
  Volume2,
  VolumeX,
  MousePointer,
  Keyboard,
  PhoneOff,
  Activity,
  Wifi,
  Cast,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';

interface LiveSessionScreenProps {
  onDisconnect: () => void;
}

import { useWebRTC } from '../../hooks/useWebRTC';

export function LiveSessionScreen({ onDisconnect }: LiveSessionScreenProps) {
  useWebRTC(); // Initialize WebRTC signaling and handshake handling

  const showToolbar = true;

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mouseControl, setMouseControl] = useState(true);
  const [isControlEnabled, setIsControlEnabled] = useState(true);
  const [canControl, setCanControl] = useState(true);
  const [keyboardControl, setKeyboardControl] = useState(true);
  const [latency] = useState(24);
  const [fps] = useState(60);
  const [bandwidth] = useState(4.2);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { remoteDeviceId, isCaller } = useAppStore();

  useEffect(() => {
    socketService.onControlAction((action) => {
      if (isControlEnabled && window.electronAPI?.performControlAction) {
        window.electronAPI.performControlAction(action);
      }
    });

    socketService.onPermissionUpdate((allowed) => {
      setCanControl(allowed);
      if (!allowed) {
        toast.error('Remote control disabled by the host');
      } else {
        toast.success('Remote control enabled');
      }
    });

    webrtcService.onTrack((stream) => {
      setRemoteStream(stream);
    });

    const api = (window as any).electronAPI;
    if (api?.setFullscreen) {
      api.setFullscreen(true);
    }

    return () => {
      webrtcService.cleanup();
      socketService.offControlAction();
      socketService.offPermissionUpdate();
      setLocalStream(null);
      setRemoteStream(null);
      if (api?.setFullscreen) {
        api.setFullscreen(false);
      }
    };
  }, [isControlEnabled]);

  const handleStartShare = async () => {
    setError(null);
    try {
      const stream = await webrtcService.startScreenShare();
      setLocalStream(stream);

      // Add tracks to the peer connection
      const pc = webrtcService.getPeerConnection();
      if (pc) {
        console.log("Adding tracks to peer connection:", stream.getTracks().map(t => t.kind));
        stream.getTracks().forEach(track => {
          // Use addTransceiver for better control/compatibility if needed, but addTrack is standard
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

  const lastMouseTime = useRef(0);
  const lastScrollTime = useRef(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseControl || !remoteStream || !canControl) return;

    const now = Date.now();
    if (now - lastMouseTime.current < 16) return;
    lastMouseTime.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (remoteDeviceId) {
      socketService.sendControlAction(remoteDeviceId, { type: 'mousemove', x, y });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseControl || !remoteStream || !remoteDeviceId || !canControl) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    socketService.sendControlAction(remoteDeviceId, {
      type: 'mousedown',
      button: e.button === 0 ? 'left' : 'right',
      x,
      y
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseControl || !remoteStream || !remoteDeviceId || !canControl) return;

    // Capture position for robust clicking
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    socketService.sendControlAction(remoteDeviceId, {
      type: 'mouseup',
      button: e.button === 0 ? 'left' : 'right',
      x,
      y
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!mouseControl || !remoteStream || !remoteDeviceId || !canControl) return;

    const now = Date.now();
    if (now - lastScrollTime.current < 30) return;
    lastScrollTime.current = now;

    socketService.sendControlAction(remoteDeviceId, {
      type: 'scroll',
      dx: e.deltaX,
      dy: e.deltaY
    });
  };

  const getRobotJSKey = (key: string): string | null => {
    const map: { [key: string]: string } = {
      'Backspace': 'backspace',
      'Delete': 'delete',
      'Enter': 'enter',
      'Tab': 'tab',
      'Escape': 'escape',
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Home': 'home',
      'End': 'end',
      'PageUp': 'pageup',
      'PageDown': 'pagedown',
      ' ': 'space',
      'Control': 'control', // Modifier, usually handled separately but good to have
      'Alt': 'alt',
      'Shift': 'shift',
      'Meta': 'command'
    };

    if (map[key]) return map[key];
    if (key.length === 1) return key.toLowerCase();
    return null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!keyboardControl || !remoteStream || !canControl) return;

      const robotKey = getRobotJSKey(e.key);
      if (robotKey) {
        // Prevent default for handled keys to stop browser actions (like scrolling or tabbing)
        // But allow some like F12 or Refresh if strictly needed? For now, aggressively prevent.
        e.preventDefault();

        if (remoteDeviceId) {
          socketService.sendControlAction(remoteDeviceId, {
            type: 'keydown',
            key: robotKey,
            // No modifiers needed: we send them as individual key events
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!keyboardControl || !remoteStream || !canControl) return;

      const robotKey = getRobotJSKey(e.key);
      if (robotKey) {
        e.preventDefault();

        if (remoteDeviceId) {
          socketService.sendControlAction(remoteDeviceId, {
            type: 'keyup',
            key: robotKey,
          });
        }
      }
    };

    if (remoteStream) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyboardControl, remoteStream, remoteDeviceId]);


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
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
          >
            <VideoPreview
              stream={activeStream}
              className="w-full h-full object-contain pointer-events-none"
              muted={activeStream === localStream || !audioEnabled}
            />
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
                {/* Only show Start Sharing for Host */}
                {!isCaller ? (
                  <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                    <Cast className="w-12 h-12 text-blue-400/50 animate-pulse" />
                    <p className="text-gray-400 font-medium">Ready to share screen</p>
                    <p className="text-gray-600 text-sm">Use the toolbar controls to begin</p>
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

        {error && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/80 backdrop-blur-md rounded-lg border border-red-400/50 text-white text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-4">
            {error}
          </div>
        )}
      </div>

      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 ${showToolbar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-3xl"></div>

          <div className="relative px-6 py-4 backdrop-blur-2xl bg-black/60 rounded-3xl border-2 border-white/50 shadow-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => canControl && setMouseControl(!mouseControl)}
                disabled={!canControl}
                className={`p-3 rounded-xl transition-all duration-200 ${!canControl
                  ? 'bg-gray-800/50 text-gray-600 border border-gray-700/50 cursor-not-allowed'
                  : mouseControl
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white backdrop-blur-xl border border-white/10'
                  }`}
                title={canControl ? "Mouse Control" : "Control Disabled by Host"}
              >
                <MousePointer className="w-4 h-4" />
              </button>

              <button
                onClick={() => canControl && setKeyboardControl(!keyboardControl)}
                disabled={!canControl}
                className={`p-3 rounded-xl transition-all duration-200 ${!canControl
                  ? 'bg-gray-800/50 text-gray-600 border border-gray-700/50 cursor-not-allowed'
                  : keyboardControl
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white backdrop-blur-xl border border-white/10'
                  }`}
                title={canControl ? "Keyboard Control" : "Control Disabled by Host"}
              >
                <Keyboard className="w-4 h-4" />
              </button>

              <div className="w-1 h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent mx-1 rounded-full"></div>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-3 rounded-xl backdrop-blur-xl border border-white/10 transition-all duration-200 ${audioEnabled
                  ? 'bg-white/5 hover:bg-white/10 text-white'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-2 border-red-500/40'
                  }`}
                title="Audio"
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <div className="w-1 h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent mx-1 rounded-full"></div>

              {/* Host Control Toggle */}
              {!isCaller && (
                <button
                  onClick={() => {
                    const newState = !isControlEnabled;
                    setIsControlEnabled(newState);
                    if (remoteDeviceId) {
                      socketService.sendPermissionUpdate(remoteDeviceId, newState);
                    }
                  }}
                  className={`p-3 rounded-xl backdrop-blur-xl border border-white/10 transition-all duration-200 ${isControlEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-2 border-red-500/40'
                    }`}
                  title={isControlEnabled ? "Remote Control Allowed" : "View Only Mode"}
                >
                  {isControlEnabled ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              )}

              {/* Only show "Share Screen" button in toolbar if I am Host */}
              {!isCaller && (
                <button
                  onClick={handleStartShare}
                  className={`p-3 rounded-xl backdrop-blur-xl border-2 border-white/30 transition-all duration-200 ${localStream
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-white'
                    }`}
                  title={localStream ? "Sharing Screen" : "Start Sharing"}
                >
                  <Cast className="w-4 h-4" />
                </button>
              )}

              <div className="w-1 h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent mx-1 rounded-full"></div>

              <button
                onClick={onDisconnect}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all flex items-center gap-2 font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 duration-200"
                title="Disconnect"
              >
                <PhoneOff className="w-4 h-4" />
                <span className="text-sm">End</span>
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
