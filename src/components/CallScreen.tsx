import React, { useEffect, useRef, useState } from 'react';
import { CallSession } from '../types';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { CallService, CallState } from '../services/callService';

interface CallScreenProps {
  call: CallSession;
  isCaller: boolean;
  onEndCall: () => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({ call, isCaller, onEndCall }) => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(call.type === 'audio');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callServiceRef = useRef<CallService | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    if (!callServiceRef.current) {
      const service = new CallService(
        call.id,
        call.chatId,
        isCaller,
        call.type,
        {
          onStateChange: (state) => {
            if (isMounted.current) {
              setCallState(state);
            }
            if (state === 'ended' || state === 'error') {
              setTimeout(() => {
                if (isMounted.current) {
                  onEndCall();
                }
              }, 1500);
            }
          },
          onLocalStream: (stream) => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          },
          onRemoteStream: (stream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
            }
          },
          onError: (error) => {
            console.error('Call error:', error);
          }
        }
      );

      callServiceRef.current = service;
      service.start();
    }

    return () => {
      isMounted.current = false;
      if (callServiceRef.current) {
        callServiceRef.current.hangup();
        callServiceRef.current = null;
      }
    };
  }, [call.id, isCaller, call.type, onEndCall]);

  const handleHangup = () => {
    if (callServiceRef.current) {
      callServiceRef.current.hangup();
    } else {
      onEndCall();
    }
  };

  const toggleMute = () => {
    if (callServiceRef.current) {
      const muted = callServiceRef.current.toggleAudio();
      setIsMuted(muted);
    }
  };

  const toggleVideo = () => {
    if (callServiceRef.current) {
      const videoOff = callServiceRef.current.toggleVideo();
      setIsVideoOff(videoOff);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center">
      {call.type === 'video' ? (
        <div className="relative w-full h-full max-w-4xl max-h-[80vh] bg-black rounded-3xl overflow-hidden shadow-2xl">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 right-4 w-32 h-48 bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          </div>
          
          {callState !== 'connected' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-white text-xl mb-2">
                  {callState === 'calling' ? 'جاري الاتصال...' : 
                   callState === 'ringing' ? 'يرن...' : 
                   callState === 'ended' ? 'تم إنهاء المكالمة' : 
                   callState === 'error' ? 'حدث خطأ في الاتصال' : ''}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className={`w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center text-6xl shadow-xl ${callState !== 'connected' && callState !== 'ended' && callState !== 'error' ? 'animate-pulse' : ''}`}>
            {call.callerAvatar?.hairStyle === 'spiky' ? '👦' : '👧'}
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              {callState === 'calling' ? 'جاري الاتصال...' : 
               callState === 'ringing' ? 'يرن...' : 
               callState === 'connected' ? call.callerName :
               callState === 'ended' ? 'تم إنهاء المكالمة' : 
               callState === 'error' ? 'حدث خطأ في الاتصال' : call.callerName}
            </h2>
            <p className="text-slate-400">مكالمة صوتية</p>
          </div>
          <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />
        </div>
      )}

      <div className="absolute bottom-10 flex items-center gap-6 bg-slate-800/80 backdrop-blur-md px-8 py-4 rounded-full">
        <button 
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        
        {call.type === 'video' && (
          <button 
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        <button 
          onClick={handleHangup}
          className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg shadow-red-500/20"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
