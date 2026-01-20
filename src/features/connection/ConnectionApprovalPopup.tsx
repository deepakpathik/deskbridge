import { AlertTriangle, Shield, Check, X, Lock } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ConnectionApprovalPopupProps {
  deviceName: string;
  onApprove: () => void;
  onDeny: () => void;
}

export function ConnectionApprovalPopup({ deviceName, onApprove, onDeny }: ConnectionApprovalPopupProps) {
  const isMobile = useIsMobile();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 animate-in fade-in duration-300 px-4">
      {/* Glow effect behind card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`${isMobile ? 'w-72 h-72' : 'w-[500px] h-[500px]'} bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 blur-[100px] rounded-full`}></div>
      </div>

      <div className={`relative backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/[0.03] rounded-3xl border border-white/30 shadow-2xl w-full ${isMobile ? 'max-w-sm' : 'max-w-lg'} overflow-hidden animate-in zoom-in-95 duration-300`}>
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>

        {/* Header */}
        <div className={`relative backdrop-blur-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-b border-amber-500/20 ${isMobile ? 'px-5 py-5' : 'px-8 py-6'}`}>
          <div className="flex items-center gap-4">
            <div className={`relative ${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl flex items-center justify-center border border-amber-400/30 shadow-lg shadow-amber-500/20`}>
              <AlertTriangle className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} text-amber-400`} />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-transparent rounded-2xl animate-pulse"></div>
            </div>
            <div>
              <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold mb-1`}>Incoming Connection</h3>
              <p className="text-xs text-gray-400">Authorization Required</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`${isMobile ? 'p-5' : 'p-8'} space-y-5`}>
          {/* Device Info - Glass Card */}
          <div className={`backdrop-blur-xl bg-black/30 rounded-2xl ${isMobile ? 'p-4' : 'p-6'} border border-white/10 shadow-inner`}>
            <div className="text-sm text-gray-400 mb-2">Requesting Device:</div>
            <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-3`}>{deviceName}</div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <div className={`${isMobile ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-lg bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 text-blue-400 font-semibold`}>
                WebRTC P2P
              </div>
              <div className={`${isMobile ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-lg bg-purple-500/20 backdrop-blur-xl border border-purple-400/30 text-purple-400 font-semibold`}>
                Live Stream
              </div>
            </div>
          </div>

          {/* Security Notice - Glass Card */}
          <div className={`backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl ${isMobile ? 'p-4' : 'p-5'} shadow-lg`}>
            <div className="flex gap-4">
              <div className={`${isMobile ? 'w-9 h-9' : 'w-10 h-10'} rounded-xl bg-red-500/20 backdrop-blur-xl flex items-center justify-center border border-red-400/30 flex-shrink-0 shadow-lg shadow-red-500/20`}>
                <Shield className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-400`} />
              </div>
              <div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-red-300 mb-2`}>Security Warning</div>
                <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-300 leading-relaxed`}>
                  The remote user will have <span className="font-semibold text-white">full control</span> of your desktop, including keyboard and mouse.
                  Only accept if you trust this device.
                </div>
              </div>
            </div>
          </div>

          {/* Permissions - Glass Card */}
          <div className={`backdrop-blur-xl bg-white/[0.03] rounded-2xl ${isMobile ? 'p-4' : 'p-6'} border border-white/10`}>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-blue-400" />
              <div className="text-sm font-semibold text-gray-300">This connection will grant:</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm group">
                <div className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 flex-shrink-0 mt-0.5`}>
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 group-hover:text-white transition-colors`}>Real-time screen streaming via WebRTC</span>
              </div>

              <div className="flex items-start gap-3 text-sm group">
                <div className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 flex-shrink-0 mt-0.5`}>
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 group-hover:text-white transition-colors`}>Remote mouse and keyboard control</span>
              </div>

              <div className="flex items-start gap-3 text-sm group">
                <div className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 flex-shrink-0 mt-0.5`}>
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 group-hover:text-white transition-colors`}>Audio transmission (optional)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`border-t border-white/10 ${isMobile ? 'px-5 py-5' : 'px-8 py-6'} backdrop-blur-xl bg-black/20`}>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3`}>
            <button
              onClick={onDeny}
              className={`${isMobile ? 'w-full' : 'flex-1'} px-6 py-4 rounded-xl backdrop-blur-xl bg-white/[0.05] active:bg-white/10 border border-white/20 hover:border-white/30 transition-all font-semibold flex items-center justify-center gap-2 ${isMobile ? 'active:scale-95' : 'hover:scale-[1.02]'} duration-200 shadow-lg`}
            >
              <X className="w-5 h-5" />
              Deny Access
            </button>

            <button
              onClick={onApprove}
              className={`${isMobile ? 'w-full' : 'flex-1'} px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-500 hover:via-green-500 hover:to-emerald-500 transition-all font-semibold flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 ${isMobile ? 'active:scale-95' : 'hover:scale-[1.02]'} duration-200`}
            >
              <Check className="w-5 h-5" />
              Allow Connection
            </button>
          </div>

          <div className="text-center mt-4">
            <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500`}>
              You can disconnect at any time • Connection is encrypted end-to-end
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}