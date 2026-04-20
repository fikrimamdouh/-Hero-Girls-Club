import { db } from '../firebase';
import { doc, updateDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export class SignalingService {
  private callId: string;
  private chatId: string;
  private callDocRef: any;
  private offerCandidatesRef: any;
  private answerCandidatesRef: any;
  private unsubCall: (() => void) | null = null;
  private unsubCandidates: (() => void) | null = null;
  private isCleanedUp = false;

  constructor(callId: string, chatId: string) {
    this.callId = callId;
    this.chatId = chatId;
    this.callDocRef = doc(db, 'chats', chatId, 'calls', callId);
    this.offerCandidatesRef = collection(this.callDocRef, 'offerCandidates');
    this.answerCandidatesRef = collection(this.callDocRef, 'answerCandidates');
  }

  async updateCall(data: any) {
    if (this.isCleanedUp) return;
    try {
      await updateDoc(this.callDocRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chats/${this.chatId}/calls/${this.callId}`);
    }
  }

  async addCandidate(candidate: RTCIceCandidateInit, isCaller: boolean) {
    if (this.isCleanedUp) return;
    try {
      const collectionRef = isCaller ? this.offerCandidatesRef : this.answerCandidatesRef;
      await addDoc(collectionRef, candidate);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${this.chatId}/calls/${this.callId}/${isCaller ? 'offerCandidates' : 'answerCandidates'}`);
    }
  }

  listenToCall(onUpdate: (data: any, exists: boolean) => void) {
    if (this.unsubCall || this.isCleanedUp) return;
    
    this.unsubCall = onSnapshot(this.callDocRef, (snapshot) => {
      onUpdate(snapshot.data(), snapshot.exists());
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `chats/${this.chatId}/calls/${this.callId}`);
    });
  }

  listenToCandidates(isCaller: boolean, onCandidateAdded: (candidate: RTCIceCandidateInit) => void) {
    if (this.unsubCandidates || this.isCleanedUp) return;

    const collectionRef = isCaller ? this.answerCandidatesRef : this.offerCandidatesRef;
    
    this.unsubCandidates = onSnapshot(collectionRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          onCandidateAdded(change.doc.data() as RTCIceCandidateInit);
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `chats/${this.chatId}/calls/${this.callId}/${isCaller ? 'answerCandidates' : 'offerCandidates'}`);
    });
  }

  async endCall() {
    if (this.isCleanedUp) return;
    try {
      await updateDoc(this.callDocRef, {
        status: 'ended',
        endedAt: Date.now()
      });
    } catch (error) {
      console.error('Error ending call in signaling:', error);
    } finally {
      this.cleanup();
    }
  }

  cleanup() {
    this.isCleanedUp = true;
    if (this.unsubCall) {
      this.unsubCall();
      this.unsubCall = null;
    }
    if (this.unsubCandidates) {
      this.unsubCandidates();
      this.unsubCandidates = null;
    }
  }
}
