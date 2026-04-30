import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Room, RoomEvent, Track, type RemoteParticipant, type LocalParticipant } from 'livekit-client';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { CallSession } from '../types';


interface Props {
  call: CallSession;
  isCaller: boolean;
  onEndCall: () => void;
}

type UiState = 'calling' | 'ringing' | 'connected' | 'ended';

export const CallScreen: React.FC<Props> = ({ call, onEndCall }) => {
  const activeChild = useMemo(() => JSON.parse(localStorage.getItem('active_child') || 'null'), []);
  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [uiState, setUiState] = useState<UiState>(call.status === 'accepted' ? 'connected' : 'calling');
  const [audioOff, setAudioOff] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [participants, setParticipants] = useState<(RemoteParticipant | LocalParticipant)[]>([]);

  useEffect(() => {
   let mounted = true;
    const connect = async () => {
      const room = new Room();
      roomRef.current = room;

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

   room.on(RoomEvent.Connected, () => mounted && setUiState('connected'));
      room.on(RoomEvent.Disconnected, () => {
        if (!mounted) return;
        setUiState('ended');
        onEndCall();
      });
      const sync = () => {
        const remotes = Array.from(room.remoteParticipants.values());
        setParticipants([room.localParticipant, ...remotes]);
      };
      room.on(RoomEvent.ParticipantConnected, sync);
      room.on(RoomEvent.ParticipantDisconnected, sync);
      room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
        if (track.kind === Track.Kind.Video) {
          const el = track.attach();
          el.className = 'w-full h-full object-cover rounded-xl';
          const slot = document.getElementById(`video-${participant.identity}`);
          slot?.replaceChildren(el);
        }
      });
      room.on(RoomEvent.LocalTrackPublished, () => {
        const localTrack = room.localParticipant.getTrackPublication(Track.Source.Camera)?.track;
        if (localTrack && localVideoRef.current) {
          const el = localTrack.attach();
          el.className = 'w-full h-full object-cover rounded-xl';
          localVideoRef.current.replaceWith(el as HTMLVideoElement);
        }
      });

   const roomName = `call_${call.chatId}_${call.id}`;
      const resp = await fetch('/api/livekit-token', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, participantName: activeChild?.name || 'Hero', participantId: activeChild?.uid || crypto.randomUUID() })
      });
      const data = await resp.json();
      await room.connect(data.url, data.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      await room.localParticipant.setCameraEnabled(call.type === 'video');
      sync();
    };


   connect().catch(() => { setUiState('ended'); onEndCall(); });
    return () => { mounted = false; roomRef.current?.disconnect(); };
  }, [activeChild, call.chatId, call.id, call.type, onEndCall]);


const toggleAudio = async () => {
    if (!roomRef.current) return;
    await roomRef.current.localParticipant.setMicrophoneEnabled(audioOff);
    setAudioOff(!audioOff);
  };

  const toggleVideo = async () => {
    if (!roomRef.current) return;
    await roomRef.current.localParticipant.setCameraEnabled(videoOff);
    setVideoOff(!videoOff);
  };

 return <div className="fixed inset-0 z-50 bg-slate-900 p-4">
    <div className="text-white text-center mb-3">{uiState}</div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-[78vh]">
      <div className="bg-slate-800 rounded-xl overflow-hidden" id="video-local"><video ref={localVideoRef} autoPlay muted playsInline className='w-full h-full object-cover rounded-xl'/></div>
      {participants.slice(1).map((p) => <div key={p.identity} id={`video-${p.identity}`} className="bg-slate-800 rounded-xl" />)}
    </div>
    <div className="flex justify-center gap-3 mt-4">
      <button onClick={toggleAudio} className="p-3 rounded-full bg-slate-700 text-white">{audioOff ? <MicOff/> : <Mic/>}</button>
      {call.type === 'video' && <button onClick={toggleVideo} className="p-3 rounded-full bg-slate-700 text-white">{videoOff ? <VideoOff/> : <Video/>}</button>}
      <button onClick={() => { roomRef.current?.disconnect(); onEndCall(); }} className="p-3 rounded-full bg-red-500 text-white"><PhoneOff/></button>
    </div>
    </div>
  </div>;
};
