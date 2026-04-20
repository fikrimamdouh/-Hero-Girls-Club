import { SignalingService } from './signalingService';

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'error';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export class CallService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private signaling: SignalingService;
  private isCaller: boolean;
  private callType: 'audio' | 'video';
  
  private onStateChange: (state: CallState) => void;
  private onLocalStream: (stream: MediaStream) => void;
  private onRemoteStream: (stream: MediaStream) => void;
  private onError: (error: Error) => void;
  
  private state: CallState = 'idle';
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly CALL_TIMEOUT_MS = 30000; // 30 seconds to answer
  private isStarted = false;
  private pendingCandidates: RTCIceCandidateInit[] = [];

  constructor(
    callId: string,
    chatId: string,
    isCaller: boolean,
    callType: 'audio' | 'video',
    callbacks: {
      onStateChange: (state: CallState) => void;
      onLocalStream: (stream: MediaStream) => void;
      onRemoteStream: (stream: MediaStream) => void;
      onError: (error: Error) => void;
    }
  ) {
    this.signaling = new SignalingService(callId, chatId);
    this.isCaller = isCaller;
    this.callType = callType;
    this.onStateChange = callbacks.onStateChange;
    this.onLocalStream = callbacks.onLocalStream;
    this.onRemoteStream = callbacks.onRemoteStream;
    this.onError = callbacks.onError;
  }

  private setState(newState: CallState) {
    const validTransitions: Record<CallState, CallState[]> = {
      'idle': ['calling', 'ringing', 'ended', 'error'],
      'calling': ['connected', 'ended', 'error'],
      'ringing': ['connected', 'ended', 'error'],
      'connected': ['ended', 'error'],
      'ended': [],
      'error': ['ended']
    };

    if (!validTransitions[this.state].includes(newState)) {
      console.warn(`Invalid state transition from ${this.state} to ${newState}`);
      return;
    }

    this.state = newState;
    this.onStateChange(newState);
  }

  async start() {
    if (this.isStarted) return;
    this.isStarted = true;

    try {
      this.setState(this.isCaller ? 'calling' : 'ringing');
      
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: this.callType === 'video',
        audio: true,
      });

      if (this.state === 'ended' || this.state === 'error') {
        this.cleanupMedia();
        return;
      }

      this.onLocalStream(this.localStream);

      this.pc = new RTCPeerConnection(servers);
      this.remoteStream = new MediaStream();
      this.onRemoteStream(this.remoteStream);

      this.localStream.getTracks().forEach((track) => {
        this.pc?.addTrack(track, this.localStream!);
      });

      this.pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          this.remoteStream?.addTrack(track);
        });
      };

      this.pc.onicecandidate = (event) => {
        if (event.candidate && this.state !== 'ended' && this.state !== 'error') {
          this.signaling.addCandidate(event.candidate.toJSON(), this.isCaller);
        }
      };

      this.pc.onconnectionstatechange = () => {
        if (this.pc?.connectionState === 'connected') {
          this.setState('connected');
          this.clearCallTimeout();
        } else if (this.pc?.connectionState === 'disconnected' || this.pc?.connectionState === 'failed' || this.pc?.connectionState === 'closed') {
          this.hangup();
        }
      };

      if (this.isCaller) {
        await this.setupCaller();
        this.startCallTimeout();
      } else {
        await this.setupCallee();
      }

      this.setupSignalingListeners();

    } catch (error) {
      console.error('Error starting call:', error);
      this.setState('error');
      this.onError(error instanceof Error ? error : new Error('Failed to start call'));
      this.hangup();
    }
  }

  private async setupCaller() {
    if (!this.pc || this.state === 'ended' || this.state === 'error') return;
    const offerDescription = await this.pc.createOffer();
    await this.pc.setLocalDescription(offerDescription);

    await this.signaling.updateCall({
      offer: {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      }
    });
  }

  private async setupCallee() {
    // Callee waits for offer in signaling listener
  }

  private setupSignalingListeners() {
    this.signaling.listenToCall(async (data, exists) => {
      if (this.state === 'ended' || this.state === 'error') return;

      if (!exists || !data) {
        this.hangup();
        return;
      }

      if (data.status === 'ended' || data.status === 'rejected') {
        this.hangup();
        return;
      }

      if (!this.pc) return;

      try {
        if (this.isCaller && data.answer && !this.pc.currentRemoteDescription) {
          const answerDescription = new RTCSessionDescription(data.answer);
          await this.pc.setRemoteDescription(answerDescription);
          this.processPendingCandidates();
        } else if (!this.isCaller && data.offer && !this.pc.currentRemoteDescription) {
          const offerDescription = new RTCSessionDescription(data.offer);
          await this.pc.setRemoteDescription(offerDescription);

          const answerDescription = await this.pc.createAnswer();
          await this.pc.setLocalDescription(answerDescription);

          await this.signaling.updateCall({
            answer: {
              type: answerDescription.type,
              sdp: answerDescription.sdp,
            }
          });
          this.processPendingCandidates();
        }
      } catch (error) {
        console.error('Error handling signaling data:', error);
        this.setState('error');
        this.hangup();
      }
    });

    this.signaling.listenToCandidates(this.isCaller, (candidateInit) => {
      if (this.state === 'ended' || this.state === 'error') return;
      
      if (this.pc && this.pc.remoteDescription) {
        const candidate = new RTCIceCandidate(candidateInit);
        this.pc.addIceCandidate(candidate).catch(e => console.error('Error adding ice candidate', e));
      } else {
        this.pendingCandidates.push(candidateInit);
      }
    });
  }

  private processPendingCandidates() {
    if (!this.pc || !this.pc.remoteDescription) return;
    this.pendingCandidates.forEach(candidateInit => {
      const candidate = new RTCIceCandidate(candidateInit);
      this.pc!.addIceCandidate(candidate).catch(e => console.error('Error adding pending ice candidate', e));
    });
    this.pendingCandidates = [];
  }

  private startCallTimeout() {
    this.clearCallTimeout();
    this.timeoutId = setTimeout(() => {
      if (this.state !== 'connected' && this.state !== 'ended' && this.state !== 'error') {
        console.log('Call timeout reached, hanging up');
        this.hangup();
      }
    }, this.CALL_TIMEOUT_MS);
  }

  private clearCallTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  toggleAudio(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled;
    }
    return false;
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return !videoTrack.enabled;
    }
    return false;
  }

  private cleanupMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      this.localStream = null;
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      this.remoteStream = null;
    }
  }

  async hangup() {
    if (this.state === 'ended') return;
    
    if (this.state !== 'error') {
      this.setState('ended');
    }

    this.clearCallTimeout();
    this.cleanupMedia();

    if (this.pc) {
      this.pc.onicecandidate = null;
      this.pc.ontrack = null;
      this.pc.onconnectionstatechange = null;
      this.pc.close();
      this.pc = null;
    }

    this.pendingCandidates = [];
    this.isStarted = false;
    
    await this.signaling.endCall();
  }
}
