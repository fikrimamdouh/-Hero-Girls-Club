import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Users, MessageCircle, UserPlus, Check, X, Send, Sparkles,
  Search, Phone, Video, Info, Paperclip, Smile, Mic, MoreVertical, CheckCheck, Reply, Image as ImageIcon,
  Settings, Palette, ChevronLeft, Trash2, Square
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db, storage } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, orderBy, getDocs, setDoc, limit, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ChildProfile, FriendRequest, DirectMessage, ChatSession, OnlineStatus, CallSession } from '../types';
import { CallScreen } from '../components/CallScreen';
import { IncomingCallModal } from '../components/IncomingCallModal';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { useNotifications } from '../hooks/useNotifications';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const CHAT_THEMES = {
  default: { bg: 'bg-white', bubble: 'bg-blue-500', name: 'الافتراضي (أزرق)' },
  love: { bg: 'bg-pink-50', bubble: 'bg-pink-500', name: 'حب (وردي)' },
  forest: { bg: 'bg-green-50', bubble: 'bg-green-500', name: 'غابة (أخضر)' },
  ocean: { bg: 'bg-cyan-50', bubble: 'bg-cyan-500', name: 'محيط (سماوي)' },
  night: { bg: 'bg-slate-900', bubble: 'bg-indigo-500', name: 'ليلي (بنفسجي داكن)' }
};

function isChildProfile(obj: any): obj is ChildProfile {
  return obj && 'uid' in obj && !('participants' in obj);
}

function isChatSession(obj: any): obj is ChatSession {
  return obj && 'participants' in obj;
}

export default function FriendsChat() {
  const navigate = useNavigate();
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [allChildren, setAllChildren] = useState<ChildProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<ChildProfile[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChildProfile | ChatSession | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'find'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Features State
  const [messageLimit, setMessageLimit] = useState(50);
  const [replyingTo, setReplyingTo] = useState<DirectMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modals & Sidebars
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [customStatusInput, setCustomStatusInput] = useState('');
  const [onlineStatuses, setOnlineStatuses] = useState<Record<string, OnlineStatus>>({});
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);

  const { playMessageSound, playCallSound } = useNotifications(activeChild?.uid);
  const callAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!activeChild || chats.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    chats.forEach(chat => {
      const qCalls = query(
        collection(db, 'chats', chat.id, 'calls'),
        where('calleeId', '==', activeChild.uid),
        where('status', '==', 'ringing')
      );

      const unsub = onSnapshot(qCalls, (snapshot) => {
        if (!snapshot.empty) {
          const callData = snapshot.docs[0].data() as CallSession;
          setIncomingCall({ ...callData, id: snapshot.docs[0].id });
          if (!callAudioRef.current) {
            const audio = playCallSound();
            callAudioRef.current = audio;
          }
        } else {
          // Only clear if this was the active incoming call
          setIncomingCall(prev => {
            if (prev && prev.chatId === chat.id) {
              if (callAudioRef.current) {
                callAudioRef.current.pause();
                callAudioRef.current.currentTime = 0;
                callAudioRef.current = null;
              }
              return null;
            }
            return prev;
          });
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, `chats/${chat.id}/calls`));
      
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
      if (callAudioRef.current) {
        callAudioRef.current.pause();
        callAudioRef.current.currentTime = 0;
        callAudioRef.current = null;
      }
    };
  }, [activeChild, chats, playCallSound]);

  useEffect(() => {
    // Fetch online statuses for all children
    const unsubscribe = onSnapshot(collection(db, 'online_status'), (snapshot) => {
      const statuses: Record<string, OnlineStatus> = {};
      snapshot.docs.forEach(doc => {
        statuses[doc.id] = doc.data() as OnlineStatus;
      });
      setOnlineStatuses(statuses);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'online_status'));

    return () => unsubscribe();
  }, []);

  const getStatusText = (uid: string) => {
    const status = onlineStatuses[uid];
    if (!status) return 'غير متصل';
    
    // Consider online if active in the last 2 minutes
    const isOnline = status.isOnline && (Date.now() - status.lastActive < 2 * 60 * 1000);
    
    if (isOnline) return 'نشط الآن';
    
    const diffInMinutes = Math.floor((Date.now() - status.lastActive) / 60000);
    if (diffInMinutes < 60) return `آخر ظهور منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `آخر ظهور منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `آخر ظهور منذ ${diffInDays} يوم`;
  };

  useEffect(() => {
    const childStr = localStorage.getItem('active_child');
    if (!childStr) {
      navigate('/');
      return;
    }
    const child = JSON.parse(childStr) as ChildProfile;
    setActiveChild(child);
    setCustomStatusInput(child.customStatus || '');

    // Fetch all children
    const unsubscribeChildren = onSnapshot(collection(db, 'children_profiles'), (snapshot) => {
      const children = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as ChildProfile));
      setAllChildren(children.filter(c => c.uid !== child.uid && c.status === 'approved'));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'children_profiles'));

    // Fetch friend requests
    const qRequests = query(collection(db, 'friend_requests'));
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
      const myRequests = requests.filter(r => r.fromId === child.uid || r.toId === child.uid);
      setFriendRequests(myRequests);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'friend_requests'));

    // Fetch chats
    const qChats = query(collection(db, 'chats'), where('participants', 'array-contains', child.uid));
    const unsubscribeChats = onSnapshot(qChats, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified' || change.type === 'added') {
          const chatData = change.doc.data() as ChatSession;
          const lastMsg = chatData.lastMessage;
          const readBy = (chatData as any).readBy || [];
          if (lastMsg && lastMsg.senderId !== child.uid && !readBy.includes(child.uid)) {
            // Only play sound if it's a recent message (within last 10 seconds) to avoid playing on initial load for old unread messages
            if (Date.now() - lastMsg.timestamp < 10000) {
              playMessageSound();
            }
          }
        }
      });

      const fetchedChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
      setChats(fetchedChats.sort((a, b) => b.updatedAt - a.updatedAt));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'chats'));

    return () => {
      unsubscribeChildren();
      unsubscribeRequests();
      unsubscribeChats();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [navigate, playMessageSound]);

  useEffect(() => {
    if (!activeChild || !allChildren.length) return;
    const acceptedIds = new Set<string>();
    friendRequests.forEach(req => {
      if (req.status === 'accepted') {
        if (req.fromId === activeChild.uid) acceptedIds.add(req.toId);
        if (req.toId === activeChild.uid) acceptedIds.add(req.fromId);
      }
    });
    setFriends(allChildren.filter(c => acceptedIds.has(c.uid)));
  }, [friendRequests, activeChild, allChildren]);

  useEffect(() => {
    if (!activeChild || !activeChat) return;

    let chatId = '';
    if (isChatSession(activeChat)) {
      chatId = activeChat.id;
    } else {
      chatId = [activeChild.uid, activeChat.uid].sort().join('_');
    }

    const qMessages = query(
      collection(db, 'direct_messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'desc'),
      limit(messageLimit)
    );

    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectMessage));
      // Reverse to show oldest at top, newest at bottom
      setMessages(fetchedMessages.reverse());
      
      // Mark as read
      const unreadMessages = fetchedMessages.filter(m => m.senderId !== activeChild.uid && (!m.readBy || !m.readBy.includes(activeChild.uid)));
      
      if (unreadMessages.length > 0) {
        unreadMessages.forEach(async (msg) => {
          try {
            await updateDoc(doc(db, 'direct_messages', msg.id), {
              readBy: arrayUnion(activeChild.uid)
            });
          } catch (e) {
            console.error("Error marking read", e);
          }
        });

        // Also mark the chat as read
        updateDoc(doc(db, 'chats', chatId), {
          readBy: arrayUnion(activeChild.uid)
        }).catch(e => {
          console.error("Error marking chat read", e);
        });
      }

      // Only scroll to bottom if we are near the bottom or it's initial load
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        if (isNearBottom || fetchedMessages.length <= 50) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'direct_messages'));

    return () => unsubscribeMessages();
  }, [activeChat, activeChild, messageLimit]);

  useEffect(() => {
    return () => {
      if (activeChild && activeChat) {
        let chatId = '';
        if (isChatSession(activeChat)) {
          chatId = activeChat.id;
        } else {
          chatId = [activeChild.uid, activeChat.uid].sort().join('_');
        }
        setDoc(doc(db, 'chats', chatId), { typing: arrayRemove(activeChild.uid) }, { merge: true }).catch(() => {});
      }
    };
  }, [activeChild, activeChat]);

  if (!activeChild) return null;

  const handleSendRequest = async (toChild: ChildProfile) => {
    try {
      await addDoc(collection(db, 'friend_requests'), {
        fromId: activeChild.uid,
        fromName: activeChild.name,
        fromHeroName: activeChild.heroName,
        toId: toChild.uid,
        toName: toChild.name,
        status: 'pending',
        timestamp: Date.now()
      });
      toast.success(`تم إرسال طلب الصداقة إلى ${toChild.name}!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'friend_requests');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'friend_requests', requestId), { status: 'accepted' });
      toast.success('تم قبول طلب الصداقة!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'friend_requests');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'friend_requests', requestId), { status: 'declined' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'friend_requests');
    }
  };

  const sendMessage = async (text: string, type: 'text' | 'image' | 'voice' | 'system' = 'text', mediaUrl?: string) => {
    if (!activeChat) return;
    
    let chatId = '';
    let participants: string[] = [];
    let chatType: 'direct' | 'group' = 'direct';

    if (isChatSession(activeChat) && activeChat.type === 'group') {
      chatId = activeChat.id;
      participants = activeChat.participants;
      chatType = 'group';
    } else {
      const otherId = isChatSession(activeChat) 
        ? activeChat.participants.find(p => p !== activeChild.uid) 
        : activeChat.uid;
      
      if (!otherId) return;
      
      chatId = [activeChild.uid, otherId].sort().join('_');
      participants = [activeChild.uid, otherId];
    }

    const now = Date.now();

    const messageData: any = {
      chatId,
      senderId: activeChild.uid,
      senderName: activeChild.name,
      text,
      type,
      timestamp: now,
      readBy: [activeChild.uid]
    };

    if (mediaUrl) {
      if (type === 'image') messageData.imageUrl = mediaUrl;
      if (type === 'voice') messageData.voiceUrl = mediaUrl;
    }

    if (replyingTo) {
      messageData.replyTo = replyingTo.id;
    }

    try {
      await addDoc(collection(db, 'direct_messages'), messageData);
      
      const chatUpdateData: any = {
        participants,
        lastMessage: {
          text: type === 'text' ? text : type === 'image' ? 'أرسل صورة 📷' : type === 'voice' ? 'أرسل تسجيلاً صوتياً 🎤' : text,
          timestamp: now,
          senderId: activeChild.uid,
          type
        },
        updatedAt: now,
        type: chatType
      };

      if (isChatSession(activeChat) && activeChat.type === 'group') {
        chatUpdateData.name = activeChat.name;
        chatUpdateData.admins = activeChat.admins;
        chatUpdateData.createdBy = activeChat.createdBy;
      }

      await setDoc(doc(db, 'chats', chatId), chatUpdateData, { merge: true });

      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'direct_messages');
    }
  };

  const handleStartCall = async (type: 'audio' | 'video') => {
    if (!activeChild || !activeChat) return;
    
    // Prevent starting a new call if already in one or receiving one
    if (activeCall || incomingCall) {
      toast.error('أنت في مكالمة بالفعل');
      return;
    }

    try {
      // Check if the other user is already in a call (Busy state)
      // Since we are using path-based isolation, we can only check if they are busy in the current chat
      const otherId = isChatSession(activeChat) 
        ? activeChat.participants.find(p => p !== activeChild.uid) 
        : activeChat.uid;
        
      if (!otherId) return;

      const chatId = [activeChild.uid, otherId].sort().join('_');
      const qCalls = query(
        collection(db, 'chats', chatId, 'calls'),
        where('calleeId', '==', otherId),
        where('status', 'in', ['ringing', 'accepted', 'connected'])
      );
      const activeCallsSnapshot = await getDocs(qCalls);
      
      if (!activeCallsSnapshot.empty) {
        toast.error('الخط مشغول حالياً');
        return;
      }

      const callDoc = await addDoc(collection(db, 'chats', chatId, 'calls'), {
        chatId,
        callerId: activeChild.uid,
        callerName: activeChild.name,
        callerAvatar: activeChild.avatar || null,
        calleeId: otherId,
        type,
        status: 'ringing',
        createdAt: Date.now()
      });
      
      setActiveCall({
        id: callDoc.id,
        chatId,
        callerId: activeChild.uid,
        callerName: activeChild.name,
        callerAvatar: activeChild.avatar,
        calleeId: otherId,
        type,
        status: 'ringing',
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'calls');
      toast.error('حدث خطأ أثناء بدء المكالمة');
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    try {
      await updateDoc(doc(db, 'chats', incomingCall.chatId, 'calls', incomingCall.id), {
        status: 'accepted',
        acceptedAt: Date.now()
      });
      setActiveCall({ ...incomingCall, status: 'accepted' });
      setIncomingCall(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chats/${incomingCall.chatId}/calls/${incomingCall.id}`);
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCall) return;
    try {
      await updateDoc(doc(db, 'chats', incomingCall.chatId, 'calls', incomingCall.id), {
        status: 'rejected',
        endedAt: Date.now()
      });
      setIncomingCall(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chats/${incomingCall.chatId}/calls/${incomingCall.id}`);
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim(), 'text');
  };

  const handleTyping = () => {
    if (!activeChat || !activeChild) return;
    
    let chatId = '';
    if (isChatSession(activeChat)) {
      chatId = activeChat.id;
    } else {
      chatId = [activeChild.uid, activeChat.uid].sort().join('_');
    }
    
    const chatRef = doc(db, 'chats', chatId);
    setDoc(chatRef, { typing: arrayUnion(activeChild.uid) }, { merge: true }).catch(() => {});

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setDoc(chatRef, { typing: arrayRemove(activeChild.uid) }, { merge: true }).catch(() => {});
    }, 2000);
  };

  const handleReact = async (messageId: string, emoji: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;

    const currentReactions = msg.reactions || {};
    const usersWhoReactedWithEmoji = currentReactions[emoji] || [];
    
    let newReactions = { ...currentReactions };
    
    if (usersWhoReactedWithEmoji.includes(activeChild.uid)) {
      newReactions[emoji] = usersWhoReactedWithEmoji.filter(id => id !== activeChild.uid);
      if (newReactions[emoji].length === 0) delete newReactions[emoji];
    } else {
      newReactions[emoji] = [...usersWhoReactedWithEmoji, activeChild.uid];
    }

    try {
      await updateDoc(doc(db, 'direct_messages', messageId), { reactions: newReactions });
      setShowEmojiPicker(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'direct_messages');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      try {
        await updateDoc(doc(db, 'direct_messages', messageId), {
          text: 'تم حذف هذه الرسالة',
          type: 'system',
          imageUrl: null,
          voiceUrl: null
        });
        toast.success('تم حذف الرسالة');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'direct_messages');
        toast.error('حدث خطأ أثناء الحذف');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChild || !activeChat) return;

    setIsUploading(true);
    try {
      // Create a reference to the file in Firebase Storage
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `chat_images/${activeChild.uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);


      // Send the message with the image URL
      await sendMessage('صورة', 'image', downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);

        setIsUploading(true);
        try {
          const fileName = `chat_voice/${activeChild?.uid}_${Date.now()}.webm`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, audioBlob);
          const downloadURL = await getDownloadURL(storageRef);
          await sendMessage('تسجيل صوتي', 'voice', downloadURL);
        } catch (error) {
          console.error('Error uploading voice message:', error);
          toast.error('حدث خطأ أثناء رفع التسجيل الصوتي');
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error('لم نتمكن من الوصول إلى الميكروفون');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0) {
      setMessageLimit(prev => prev + 50);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await updateDoc(doc(db, 'children_profiles', activeChild.uid), {
        customStatus: customStatusInput
      });
      toast.success('تم تحديث حالتك!');
      setIsProfileModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'children_profiles');
    }
  };

  const handleChangeTheme = async (themeKey: string) => {
    if (!activeChat || !activeChild) return;
    
    let chatId = '';
    if (isChatSession(activeChat)) {
      chatId = activeChat.id;
    } else {
      chatId = [activeChild.uid, activeChat.uid].sort().join('_');
    }

    try {
      await setDoc(doc(db, 'chats', chatId), {
        theme: themeKey
      }, { merge: true });
      
      const themeName = CHAT_THEMES[themeKey as keyof typeof CHAT_THEMES].name;
      await sendMessage(`قام ${activeChild.name} بتغيير لون الدردشة إلى ${themeName}`, 'system');
      
      toast.success('تم تغيير خلفية الدردشة!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'chats');
    }
  };

  const pendingReceived = friendRequests.filter(r => r.toId === activeChild.uid && r.status === 'pending');
  const pendingSent = friendRequests.filter(r => r.fromId === activeChild.uid && r.status === 'pending');

  const filteredFriends = friends.filter(f => f.name.includes(searchQuery) || f.heroName.includes(searchQuery));

  const currentChatId = activeChat ? (isChatSession(activeChat) ? activeChat.id : [activeChild.uid, activeChat.uid].sort().join('_')) : null;
  const currentChatSession = chats.find(c => c.id === currentChatId);
  const currentThemeKey = currentChatSession?.theme || 'default';
  const currentTheme = CHAT_THEMES[currentThemeKey as keyof typeof CHAT_THEMES] || CHAT_THEMES.default;

  return (
    <div className="min-h-screen bg-slate-100 font-arabic flex flex-col" dir="rtl">
      {/* Messenger Header */}
      <header className="bg-white border-b border-slate-200 p-3 shadow-sm z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/child')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowRight className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">ماسنجر الأبطال</h1>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-full">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 text-sm ${activeTab === 'chat' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              <MessageCircle className="w-4 h-4" />
              الدردشات
            </button>
            <button
              onClick={() => setActiveTab('find')}
              className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 text-sm ${activeTab === 'find' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              <UserPlus className="w-4 h-4" />
              الأصدقاء
              {pendingReceived.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {pendingReceived.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 h-[calc(100vh-70px)]">
        {activeTab === 'find' ? (
          <div className="grid md:grid-cols-2 gap-6 h-full overflow-y-auto pb-20">
            {/* Pending Requests */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                طلبات الصداقة
              </h2>
              
              {pendingReceived.length === 0 && pendingSent.length === 0 && (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
                  <p className="text-slate-500">لا توجد طلبات صداقة معلقة</p>
                </div>
              )}

              {pendingReceived.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{req.fromName}</p>
                    <p className="text-sm text-blue-600">{req.fromHeroName}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAcceptRequest(req.id)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeclineRequest(req.id)} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {pendingSent.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between opacity-70 shadow-sm">
                  <div>
                    <p className="font-bold text-slate-800">طلب مرسل إلى {req.toName}</p>
                    <p className="text-sm text-slate-500">في انتظار الموافقة...</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Find Friends */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                أبطال يمكنك مصادقتهم
              </h2>
              <div className="grid gap-4">
                {allChildren.filter(c => 
                  !friends.find(f => f.uid === c.uid) && 
                  !pendingSent.find(r => r.toId === c.uid) &&
                  !pendingReceived.find(r => r.fromId === c.uid)
                ).map(child => (
                  <div key={child.uid} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 border shadow-inner">
                        <AvatarFallback className="text-2xl mt-2 bg-transparent">
                          {child.avatar?.hairStyle === 'spiky' ? '👦' : '👧'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-800">{child.name}</p>
                        <p className="text-sm text-blue-600">{child.heroName}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSendRequest(child)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      إضافة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 h-full flex overflow-hidden">
            {/* Messenger Sidebar */}
            <div className="w-full md:w-80 border-l border-slate-200 bg-white flex flex-col">
              {/* User Profile Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors" onClick={() => setIsProfileModalOpen(true)}>
                  <div className="relative">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 shadow-sm border border-slate-200">
                      <AvatarFallback className="text-2xl mt-2 bg-transparent">
                        {activeChild.avatar?.hairStyle === 'spiky' ? '👦' : '👧'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">{activeChild.name}</h2>
                    <p className="text-xs text-slate-500 truncate max-w-[120px]">{activeChild.customStatus || 'تعيين حالة...'}</p>
                  </div>
                </div>
                <button onClick={() => setIsProfileModalOpen(true)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="ابحث في ماسنجر..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 rounded-full py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  onClick={() => setIsCreateGroupModalOpen(true)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                  title="إنشاء مجموعة جديدة"
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {chats.map(chat => {
                  const isGroup = chat.type === 'group';
                  let chatName = '';
                  let chatAvatar = null;
                  let chatUid = '';
                  let isOnline = false;

                  if (isGroup) {
                    chatName = chat.name || 'مجموعة بدون اسم';
                    chatAvatar = chat.photoURL ? (
                      <img src={chat.photoURL} alt="Group" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <Users className="w-6 h-6 text-slate-500" />
                    );
                    chatUid = chat.id;
                  } else {
                    const friendId = chat.participants.find(id => id !== activeChild.uid);
                    const friend = friends.find(f => f.uid === friendId);
                    if (!friend) return null; // Don't render if friend is not in friends list
                    
                    // Filter by search query
                    if (searchQuery && !friend.name.includes(searchQuery) && !friend.heroName.includes(searchQuery)) return null;

                    chatName = friend.name;
                    chatAvatar = friend.avatar?.hairStyle === 'spiky' ? '👦' : '👧';
                    chatUid = friend.uid;
                    isOnline = getStatusText(friend.uid) === 'نشط الآن';
                  }

                  // Filter groups by search query
                  if (isGroup && searchQuery && !chatName.includes(searchQuery)) return null;

                  const lastMsg = chat.lastMessage;
                  const isUnread = lastMsg && lastMsg.senderId !== activeChild.uid && (!chat.readBy || !chat.readBy.includes(activeChild.uid));

                  const isActive = activeChat && ('type' in activeChat ? activeChat.id === chat.id : activeChat.uid === chatUid);

                  return (
                    <button
                      key={chat.id}
                      onClick={() => {
                        if (isGroup) {
                          setActiveChat(chat);
                        } else {
                          const friendId = chat.participants.find(id => id !== activeChild.uid);
                          const friend = friends.find(f => f.uid === friendId);
                          if (friend) setActiveChat(friend);
                        }
                      }}
                      className={`w-full text-right p-3 transition-colors flex items-center gap-3 hover:bg-slate-50 ${
                        isActive ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm border border-slate-200">
                          <AvatarFallback className="text-2xl mt-2 bg-transparent">
                            {chatAvatar}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online Indicator for direct chats */}
                        {!isGroup && (
                          <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <p className={`font-semibold truncate ${isUnread ? 'text-slate-900' : 'text-slate-800'}`}>{chatName}</p>
                          {lastMsg && (
                            <span className="text-[11px] text-slate-500 whitespace-nowrap mr-2">
                              {new Date(lastMsg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm truncate ${isUnread ? 'font-bold text-blue-600' : 'text-slate-500'}`}>
                          {lastMsg ? (lastMsg.senderId === activeChild.uid ? `أنت: ${lastMsg.text}` : lastMsg.text) : 'ابدأ الدردشة الآن!'}
                        </p>
                      </div>
                      {isUnread && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}

                {/* Render friends without active chats */}
                {filteredFriends.filter(f => !chats.find(c => c.type === 'direct' && c.participants.includes(f.uid))).map(friend => (
                  <button
                    key={friend.uid}
                    onClick={() => setActiveChat(friend)}
                    className={`w-full text-right p-3 transition-colors flex items-center gap-3 hover:bg-slate-50 ${
                      activeChat && !('type' in activeChat) && activeChat.uid === friend.uid ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm border border-slate-200">
                        <AvatarFallback className="text-2xl mt-2 bg-transparent">
                          {friend.avatar?.hairStyle === 'spiky' ? '👦' : '👧'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${getStatusText(friend.uid) === 'نشط الآن' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="font-semibold truncate text-slate-800">{friend.name}</p>
                      </div>
                      <p className="text-sm truncate text-slate-500">
                        ابدأ الدردشة الآن!
                      </p>
                    </div>
                  </button>
                ))}

                {chats.length === 0 && filteredFriends.length === 0 && (
                  <div className="text-center p-8 text-slate-500 text-sm">
                    لا توجد محادثات.
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col relative ${currentTheme.bg}`}>
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm">
                          <AvatarFallback className="text-xl mt-2 bg-transparent">
                            {'type' in activeChat && activeChat.type === 'group' ? (
                              <Users className="w-5 h-5 text-slate-500" />
                            ) : (
                              !('type' in activeChat) && activeChat.avatar?.hairStyle === 'spiky' ? '👦' : '👧'
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {!('type' in activeChat) && (
                          <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${getStatusText(activeChat.uid) === 'نشط الآن' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">
                          {'type' in activeChat ? activeChat.name || 'مجموعة' : activeChat.name}
                        </h3>
                        {!('type' in activeChat) && (
                          <p className={`text-xs font-medium ${getStatusText(activeChat.uid) === 'نشط الآن' ? 'text-green-500' : 'text-slate-500'}`}>{getStatusText(activeChat.uid)}</p>
                        )}
                        {'type' in activeChat && activeChat.type === 'group' && (
                          <p className="text-xs text-slate-500">{activeChat.participants.length} أعضاء</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-blue-500">
                      <button onClick={() => handleStartCall('audio')} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
                      <button onClick={() => handleStartCall('video')} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Video className="w-6 h-6" /></button>
                      <button 
                        onClick={() => setIsChatInfoOpen(!isChatInfoOpen)}
                        className={`p-2 rounded-full transition-colors ${isChatInfoOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100'}`}
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex overflow-hidden">
                    {/* Messages */}
                    <div 
                      ref={chatContainerRef}
                      onScroll={handleScroll}
                      className="flex-1 overflow-y-auto p-4 space-y-2"
                    >
                      {/* Welcome Message */}
                      {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-sm">
                            {'type' in activeChat && activeChat.type === 'group' ? (
                              <Users className="w-12 h-12 text-slate-500" />
                            ) : (
                              !('type' in activeChat) && activeChat.avatar?.hairStyle === 'spiky' ? '👦' : '👧'
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-slate-700">
                            {'type' in activeChat ? activeChat.name || 'مجموعة' : activeChat.name}
                          </h3>
                          <p>{'type' in activeChat ? 'ابدأ الدردشة مع أصدقائك!' : (activeChat.customStatus || 'أنتما الآن صديقان على ماسنجر الأبطال!')}</p>
                        </div>
                      )}

                      {messages.map((msg, index) => {
                        if (msg.type === 'system') {
                          return (
                            <div key={msg.id} className="flex justify-center my-4">
                              <div className="bg-slate-200/50 text-slate-500 text-xs px-4 py-1.5 rounded-full">
                                {msg.text}
                              </div>
                            </div>
                          );
                        }

                        const isMe = msg.senderId === activeChild.uid;
                        const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1].senderId !== msg.senderId);
                        
                        // Check if read by anyone else in the chat (for groups) or the specific friend (for direct)
                        const isRead = 'type' in activeChat 
                          ? msg.readBy && msg.readBy.length > 1 // Read by someone other than sender
                          : msg.readBy && msg.readBy.includes(activeChat.uid);
                          
                        const isLastMyMessage = isMe && (index === messages.length - 1 || messages[index + 1].senderId !== activeChild.uid);

                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'} group`}>
                            {!isMe && (
                              <div className="w-8 h-8 mr-2 flex-shrink-0 flex items-end">
                                {showAvatar && (
                                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow-sm" title={msg.senderName}>
                                    {/* Try to find friend avatar, otherwise fallback */}
                                    {friends.find(f => f.uid === msg.senderId)?.avatar?.hairStyle === 'spiky' ? '👦' : '👧'}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} max-w-[70%] relative`}>
                              {!isMe && 'type' in activeChat && activeChat.type === 'group' && showAvatar && (
                                <span className="text-[10px] text-slate-500 mb-1 ml-2">{msg.senderName}</span>
                              )}
                              <div className="flex items-center gap-2">
                                {/* Hover Actions (Reply, React) */}
                                {isMe && (
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 relative">
                                    <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 text-slate-400 hover:bg-white/50 rounded-full" title="حذف الرسالة"><Trash2 className="w-4 h-4" /></button>
                                    <button onClick={() => setReplyingTo(msg)} className="p-1.5 text-slate-400 hover:bg-white/50 rounded-full"><Reply className="w-4 h-4" /></button>
                                    <button onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)} className="p-1.5 text-slate-400 hover:bg-white/50 rounded-full"><Smile className="w-4 h-4" /></button>
                                    
                                    {showEmojiPicker === msg.id && (
                                      <div className="absolute top-full mt-1 right-0 w-max bg-white border border-slate-200 rounded-full shadow-lg p-1 flex gap-1 z-20">
                                        {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                                          <button key={emoji} onClick={() => handleReact(msg.id, emoji)} className="hover:bg-slate-100 p-1 rounded-full text-lg">
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className={`px-4 py-2 text-[15px] ${
                                  isMe 
                                    ? `${currentTheme.bubble} text-white rounded-2xl rounded-tr-sm shadow-sm` 
                                    : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm shadow-sm'
                                }`}>
                                  {msg.replyTo && (
                                    <div className={`text-xs mb-2 p-2 rounded-lg opacity-90 ${isMe ? 'bg-white/20' : 'bg-slate-100 border border-slate-200'}`}>
                                      <span className="font-bold block mb-1">
                                        {messages.find(m => m.id === msg.replyTo)?.senderName || 'رسالة'}
                                      </span>
                                      <span className="truncate block max-w-[200px]">
                                        {messages.find(m => m.id === msg.replyTo)?.text || '...'}
                                      </span>
                                    </div>
                                  )}
                                  {msg.type === 'image' && msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="صورة" className="max-w-[250px] rounded-xl mb-1" />
                                  )}
                                  {msg.type === 'voice' && msg.voiceUrl && (
                                    <audio src={msg.voiceUrl} controls className="max-w-[250px] h-10 mb-1" />
                                  )}
                                  {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                                </div>

                                {!isMe && (
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 relative">
                                    <button onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)} className="p-1.5 text-slate-400 hover:bg-white/50 rounded-full"><Smile className="w-4 h-4" /></button>
                                    <button onClick={() => setReplyingTo(msg)} className="p-1.5 text-slate-400 hover:bg-white/50 rounded-full"><Reply className="w-4 h-4" /></button>
                                    
                                    {showEmojiPicker === msg.id && (
                                      <div className="absolute top-full mt-1 left-0 w-max bg-white border border-slate-200 rounded-full shadow-lg p-1 flex gap-1 z-20">
                                        {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                                          <button key={emoji} onClick={() => handleReact(msg.id, emoji)} className="hover:bg-slate-100 p-1 rounded-full text-lg">
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Reactions */}
                              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end mr-2' : 'justify-start ml-2'}`}>
                                  {Object.entries(msg.reactions).map(([emoji, uids]) => (
                                    <button 
                                      key={emoji}
                                      onClick={() => handleReact(msg.id, emoji)}
                                      className="bg-white border border-slate-200 rounded-full px-1.5 py-0.5 text-xs shadow-sm flex items-center gap-1 hover:bg-slate-50"
                                    >
                                      <span>{emoji}</span>
                                      {uids.length > 1 && <span className="text-slate-500 font-bold">{uids.length}</span>}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Read Receipt / Time */}
                              {isLastMyMessage && (
                                <div className="flex items-center gap-1 mt-1 mr-1">
                                  {isRead ? (
                                    <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center text-[8px] shadow-sm">
                                      {'type' in activeChat ? <Users className="w-2 h-2 text-slate-500" /> : (activeChat.avatar?.hairStyle === 'spiky' ? '👦' : '👧')}
                                    </div>
                                  ) : (
                                    <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Typing Indicator */}
                      {currentChatSession?.typing?.filter(uid => uid !== activeChild.uid).map(typingUid => (
                        <div key={`typing-${typingUid}`} className="flex justify-start">
                          <div className="w-8 h-8 mr-2 flex-shrink-0 flex items-end">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow-sm">
                              {friends.find(f => f.uid === typingUid)?.avatar?.hairStyle === 'spiky' ? '👦' : '👧'}
                            </div>
                          </div>
                          <div className="bg-white text-slate-500 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      ))}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Info Sidebar */}
                    <AnimatePresence>
                      {isChatInfoOpen && (
                        <motion.div 
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 280, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="border-r border-slate-200 bg-white overflow-y-auto"
                        >
                          <div className="p-6 flex flex-col items-center border-b border-slate-100 relative group">
                            <Avatar className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm mb-4 relative overflow-hidden">
                              <AvatarFallback className="text-4xl mt-4 bg-transparent">
                                {'type' in activeChat && activeChat.type === 'group' ? (
                                  <Users className="w-10 h-10 text-slate-500" />
                                ) : (
                                  !('type' in activeChat) && activeChat.avatar?.hairStyle === 'spiky' ? '👦' : '👧'
                                )}
                              </AvatarFallback>
                              {'type' in activeChat && activeChat.type === 'group' && activeChat.photoURL && (
                                <AvatarImage src={activeChat.photoURL} alt="Group" className="object-cover" />
                              )}
                            </Avatar>
                            
                            {'type' in activeChat && activeChat.type === 'group' && activeChat.admins?.includes(activeChild.uid) && (
                              <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                <ImageIcon className="w-6 h-6" />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const fileExtension = file.name.split('.').pop() || 'jpg';
                                        const fileName = `group_images/${activeChat.id}_${Date.now()}.${fileExtension}`;
                                        const storageRef = ref(storage, fileName);
                                        await uploadBytes(storageRef, file);
                                        const downloadURL = await getDownloadURL(storageRef);
                                        await updateDoc(doc(db, 'chats', activeChat.id), { photoURL: downloadURL });
                                        toast.success('تم تحديث صورة المجموعة');
                                      } catch (error) {
                                        console.error('Error uploading group image:', error);
                                        toast.error('حدث خطأ أثناء رفع الصورة');
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">{activeChat.name}</h3>
                            {!('type' in activeChat) && <p className="text-sm text-slate-500">{activeChat.heroName}</p>}
                            {!('type' in activeChat) && activeChat.customStatus && (
                              <p className="text-sm text-center mt-2 text-slate-600 bg-slate-50 px-3 py-1 rounded-full">
                                "{activeChat.customStatus}"
                              </p>
                            )}

                          {activeChat && 'type' in activeChat && activeChat.type === 'group' && (
                            <div className="p-4 border-b border-slate-100">
                              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                الأعضاء ({activeChat.participants.length})
                              </h4>
                              <div className="space-y-2">
                                {activeChat.participants.map(participantId => {
                                  const participant = participantId === activeChild.uid ? activeChild : friends.find(f => f.uid === participantId);
                                  if (!participant) return null;
                                  return (
                                    <div key={participantId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                      <Avatar className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm">
                                        <AvatarFallback className="text-sm mt-1 bg-transparent">
                                          {participant.avatar?.hairStyle === 'spiky' ? '👦' : '👧'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-slate-800 truncate">
                                          {participantId === activeChild.uid ? 'أنت' : participant.name}
                                        </p>
                                        {activeChat.admins?.includes(participantId) && (
                                          <p className="text-[10px] text-blue-500 font-bold">مسؤول</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="p-4">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <Palette className="w-4 h-4 text-purple-500" />
                              تخصيص الدردشة
                            </h4>
                            <div className="space-y-2">
                              {Object.entries(CHAT_THEMES).map(([key, theme]) => (
                                <button
                                  key={key}
                                  onClick={() => handleChangeTheme(key)}
                                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${currentThemeKey === key ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full ${theme.bubble}`}></div>
                                    <span className="text-sm font-medium text-slate-700">{theme.name}</span>
                                  </div>
                                  {currentThemeKey === key && <Check className="w-4 h-4 text-blue-500" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Input Area */}
                  <div className="p-3 bg-white/80 backdrop-blur-md border-t border-slate-200 flex flex-col">
                    {replyingTo && (
                      <div className="bg-slate-50 p-2 rounded-t-xl border-t border-x border-slate-200 flex justify-between items-center text-sm mb-2">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Reply className="w-4 h-4" />
                          <span>الرد على <b>{replyingTo.senderName}</b>: {replyingTo.text || (replyingTo.type === 'image' ? 'صورة' : 'تسجيل صوتي')}</span>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                      </div>
                    )}

                    <div className="flex items-end gap-2">
                      {!isRecording && (
                        <>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            disabled={isUploading}
                          />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-2 text-blue-500 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="إرسال صورة"
                            disabled={isUploading}
                          >
                            {isUploading ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> : <ImageIcon className="w-5 h-5" />}
                          </button>
                        </>
                      )}
                      
                      {isRecording ? (
                        <div className="flex-1 bg-red-50 rounded-3xl flex items-center justify-between px-4 py-1 min-h-[44px]">
                          <div className="flex items-center gap-2 text-red-500 animate-pulse">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-bold">
                              {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:
                              {(recordingTime % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={stopRecording} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                              <Square className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 bg-slate-100 rounded-3xl flex items-center px-2 py-1 min-h-[44px] relative">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                              setNewMessage(e.target.value);
                              handleTyping();
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Aa"
                            className="flex-1 bg-transparent px-3 py-2 text-[15px] focus:outline-none"
                          />
                          <button 
                            onClick={() => setShowEmojiPicker(showEmojiPicker === 'input' ? null : 'input')}
                            className="p-2 text-blue-500 hover:bg-slate-200 rounded-full transition-colors"
                          >
                            <Smile className="w-5 h-5" />
                          </button>
                          {showEmojiPicker === 'input' && (
                            <div className="absolute bottom-full mb-2 right-0 w-max bg-white border border-slate-200 rounded-2xl shadow-lg p-2 flex gap-2 z-20">
                              {['😀', '😂', '🥰', '😎', '👍', '❤️', '🎉', '🔥'].map(emoji => (
                                <button 
                                  key={emoji} 
                                  onClick={() => {
                                    setNewMessage(prev => prev + emoji);
                                    setShowEmojiPicker(null);
                                  }} 
                                  className="hover:bg-slate-100 p-2 rounded-xl text-xl transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {!isRecording && (
                        newMessage.trim() ? (
                          <button
                            onClick={handleSendMessage}
                            className={`p-2.5 ${currentTheme.bubble} text-white rounded-full transition-colors flex-shrink-0 shadow-sm`}
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={startRecording}
                            className="p-2.5 text-blue-500 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
                          >
                            <Mic className="w-5 h-5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                  <MessageCircle className="w-20 h-20 mb-4 text-slate-200" />
                  <p className="text-lg font-medium text-slate-500">اختر محادثة للبدء</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {incomingCall && (
        <IncomingCallModal 
          call={incomingCall} 
          onAccept={handleAcceptCall} 
          onReject={handleRejectCall} 
        />
      )}

      {activeCall && (
        <CallScreen 
          call={activeCall} 
          isCaller={activeCall.callerId === activeChild.uid}
          onEndCall={handleEndCall} 
        />
      )}

      {/* Profile Settings Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <Card className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border-none">
              <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50 space-y-0">
                <CardTitle className="font-bold text-lg text-slate-800">إعدادات الملف الشخصي</CardTitle>
                <button onClick={() => setIsProfileModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 shadow-md border-4 border-white">
                      <AvatarFallback className="text-5xl mt-4 bg-transparent">
                        {activeChild.avatar?.hairStyle === 'spiky' ? '👦' : '👧'}
                      </AvatarFallback>
                    </Avatar>
                    <button 
                      onClick={() => navigate('/character')}
                      className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors"
                      title="تغيير الصورة"
                    >
                      <Palette className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-xl text-slate-800">{activeChild.name}</h3>
                  <p className="text-sm text-purple-600">{activeChild.heroName}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">الحالة (Bio)</label>
                  <input
                    type="text"
                    value={customStatusInput}
                    onChange={(e) => setCustomStatusInput(e.target.value)}
                    placeholder="بماذا تشعر اليوم؟"
                    className="w-full bg-slate-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 transition-colors"
                  />
                  <p className="text-xs text-slate-500">ستظهر هذه الحالة لأصدقائك في الماسنجر.</p>
                </div>

                <button
                  onClick={handleUpdateStatus}
                  className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors shadow-md shadow-blue-200"
                >
                  حفظ التغييرات
                </button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isCreateGroupModalOpen && (
          <CreateGroupModal
            onClose={() => setIsCreateGroupModalOpen(false)}
            friends={friends}
            activeChild={activeChild}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
