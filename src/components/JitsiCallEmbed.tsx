import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Video, PhoneOff, Maximize2, Minimize2 } from 'lucide-react';

/* ── Jitsi IFrame API types ── */
declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: JitsiOptions) => JitsiAPI;
  }
}
interface JitsiOptions {
  roomName: string;
  parentNode: HTMLElement;
  userInfo?: { displayName: string; email?: string };
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
  width?: string | number;
  height?: string | number;
}
interface JitsiAPI {
  dispose: () => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
  addListener: (event: string, listener: (...args: unknown[]) => void) => void;
  getNumberOfParticipants: () => number;
}

/* Load the Jitsi external API script once */
let scriptLoadPromise: Promise<void> | null = null;
function loadJitsiScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { scriptLoadPromise = null; reject(new Error('Failed to load Jitsi')); };
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

interface JitsiCallEmbedProps {
  roomId: string;
  displayName: string;
  callType?: 'audio' | 'video';
  title?: string;
  onClose: () => void;
  /** When true the embed fills a fixed overlay; when false it fills its parent */
  compact?: boolean;
  /** Controlled minimized state — only used when compact=true */
  minimized?: boolean;
  onMinimize?: () => void;
  onExpand?: () => void;
}

export default function JitsiCallEmbed({
  roomId, displayName, callType = 'video', title,
  onClose, compact = false,
  minimized = false, onMinimize, onExpand,
}: JitsiCallEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiAPI | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadJitsiScript().then(() => {
      if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;
      try {
        apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName: `NadiBatlat-${roomId}`,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: callType === 'audio',
            disableDeepLinking: true,
            enableNoisyMicDetection: false,
            hideConferenceSubject: true,
          },
          interfaceConfigOverwrite: {
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            TOOLBAR_BUTTONS: callType === 'video'
              ? ['microphone', 'camera', 'hangup', 'fullscreen', 'tileview']
              : ['microphone', 'hangup'],
            MOBILE_APP_PROMO: false,
          },
        });
        apiRef.current.addListener('readyToClose', () => {
          if (!cancelled) onClose();
        });
      } catch (e) {
        console.error('Jitsi init error:', e);
      }
    }).catch(e => console.error('Jitsi script error:', e));

    return () => {
      cancelled = true;
      try { apiRef.current?.dispose(); } catch { /* ignore */ }
      apiRef.current = null;
    };
  }, [roomId, displayName, callType]);

  /* ── Minimised floating bar (compact mode only) ── */
  if (compact && minimized) {
    return (
      <motion.div
        key="pip-bar"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2
                   bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10"
        style={{ direction: 'rtl' }}
      >
        <div className="flex items-center gap-2">
          {callType === 'video'
            ? <Video className="w-4 h-4 text-emerald-400 animate-pulse" />
            : <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />}
          <span className="text-sm font-bold">
            {title || (callType === 'video' ? 'مكالمة فيديو' : 'مكالمة صوتية')}
          </span>
          <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-black">نشطة</span>
        </div>
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={onExpand}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="توسيع"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            title="إنهاء"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Hidden but still mounted so call continues */}
        <div ref={containerRef} className="sr-only w-0 h-0 overflow-hidden pointer-events-none" />
      </motion.div>
    );
  }

  /* ── Compact expanded overlay ── */
  if (compact) {
    return (
      <motion.div
        key="call-overlay"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 z-[110] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 flex-shrink-0">
          <div className="flex items-center gap-2 text-white" style={{ direction: 'rtl' }}>
            {callType === 'video'
              ? <Video className="w-4 h-4 text-emerald-400" />
              : <Mic className="w-4 h-4 text-emerald-400" />}
            <span className="font-bold text-sm">{title || (callType === 'video' ? 'مكالمة فيديو' : 'مكالمة صوتية')}</span>
          </div>
          <div className="flex items-center gap-2">
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="flex items-center gap-1 bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
              >
                <Minimize2 className="w-3 h-3" />
                تصغير
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              إنهاء
            </button>
          </div>
        </div>
        <div ref={containerRef} className="flex-1 w-full" />
      </motion.div>
    );
  }

  /* ── Full-screen (non-compact) ── */
  return (
    <motion.div
      key="call-fullscreen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 flex-shrink-0" style={{ direction: 'rtl' }}>
        <div className="flex items-center gap-2 text-white">
          {callType === 'video'
            ? <Video className="w-5 h-5 text-emerald-400" />
            : <Mic className="w-5 h-5 text-emerald-400" />}
          <span className="font-bold">{title || (callType === 'video' ? 'مكالمة فيديو' : 'مكالمة صوتية')}</span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-full transition-colors"
        >
          <PhoneOff className="w-4 h-4" />
          إنهاء المكالمة
        </button>
      </div>
      <div ref={containerRef} className="flex-1 w-full" />
    </motion.div>
  );
}
