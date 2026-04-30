export type Role = 'parent' | 'child';

export interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  displayName: string;
  createdAt: number;
}

export interface HouseItem {
  id: string;
  type: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
    room?: 'sleep' | 'play' | 'study';
}

export interface HouseConfig {
  theme: 'castle' | 'garden' | 'space' | 'underwater' | 'cloud';
  furniture: HouseItem[];
  decorations: HouseItem[];
  wallpaper: string;
  floor: string;
}

export interface ChildProfile {
  uid: string;
  parentId: string;
  name: string;
  parentName?: string;
  email?: string;
  phone?: string;
  pin: string;
  avatar: AvatarConfig;
  pet?: MagicPet;
  points: number;
  stars?: number;
  level: number;
  heroName: string;
  heroPower: string;
  heroBadge: string;
  pattern?: number[];
  usePattern?: boolean;
  school?: string;
  city?: string;
  hobbies?: string;
  status: 'pending' | 'approved' | 'rejected';
  ageGroup?: '3-5' | '6-8' | '9-12';
  customStatus?: string; // For messenger bio/status
  createdAt: number;
  lastActive?: number; // Added for presence tracking
  houseConfig?: HouseConfig; // Added for house customization
}

export interface MagicPet {
  id: string;
  name: string;
  type: string; // e.g., 'dragon', 'unicorn', 'cat'
  level: number;
  experience: number;
  mood: 'happy' | 'sleepy' | 'hungry' | 'playful';
  lastFed: number;
}

export interface AvatarConfig {
  hairStyle: string;
  dressStyle: string;
  color: string;
  accessory: string;
  eyes?: string;
  eyeColor?: string;
  cape?: string;
  shoes?: string;
  wings?: string;
  wand?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'daily' | 'custom';
  isApproved: boolean;
  isCompleted: boolean;
  childId: string;
  parentId: string;
  createdAt: number;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  choices: StoryChoice[];
  points: number;
}

export interface StoryChoice {
  text: string;
  nextStoryId?: string;
  points: number;
  moral: string;
}

export interface Achievement {
  id: string;
  childId: string;
  badgeId: string;
  date: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface FeatureIdea {
  id: string;
  childId: string;
  childName: string;
  idea: string;
  createdAt: number;
  status: 'new' | 'read' | 'implemented';
}

export interface ActivityLog {
  id: string;
  childId: string;
  childName: string;
  message: string;
  type: 'mission' | 'story' | 'achievement' | 'login' | 'learning';
  timestamp: number;
  status?: 'success' | 'failed';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'math' | 'science' | 'language' | 'arts' | 'values';
  level: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  points: number;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export interface UserProgress {
  childId: string;
  lessonId: string;
  courseId: string;
  status: 'started' | 'completed';
  score?: number;
  completedAt?: number;
}

export interface OnlineStatus {
  uid: string;
  name: string;
  heroName: string;
  avatar: AvatarConfig;
  lastActive: number;
  isOnline: boolean;
}

export interface VisitRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromHeroName: string;
  fromAvatar: AvatarConfig;
  toId: string;
  toName: string;
  toAvatar?: AvatarConfig; // Added to show the host
  status: 'pending' | 'accepted' | 'rejected' | 'declined' | 'ended';
  currentAction?: {
    type: 'tea' | 'sweets' | 'music' | 'dance' | 'none' | 'heart' | 'star' | 'laugh' | 'wow' | 'juice' | 'fruit' | 'cookies' | 'mirror';
    timestamp: number;
    triggeredBy: string;
  };
  gameState?: {
    type: 'tictactoe';
    board: ('X' | 'O' | null)[];
    turn: 'X' | 'O';
    winner: 'X' | 'O' | 'draw' | null;
    isDraw: boolean;
    playerX?: string;
    playerO?: string;
  };
  acceptedAt?: number;
  roomMood?: 'cozy' | 'playful' | 'calm';
  timestamp: number;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromHeroName: string;
  toId: string;
  toName: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: number;
}

export interface DirectMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  readBy?: string[];
  reactions?: Record<string, string[]>; // emoji -> array of uids
  replyTo?: string; // messageId
  imageUrl?: string;
  voiceUrl?: string;
  type?: 'text' | 'image' | 'voice' | 'system';
}

export interface ChatSession {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    timestamp: number;
    senderId: string;
    type?: 'text' | 'image' | 'voice' | 'system';
  };
  unreadCount?: Record<string, number>;
  updatedAt: number;
  type: 'direct' | 'group';
  name?: string; // For group chats
  photoURL?: string; // For group chats
  admins?: string[]; // For group chats
  createdBy?: string; // For group chats
  theme?: string; // e.g., 'default', 'love', 'ocean', 'night'
  typing?: string[]; // Array of uids currently typing
  readBy?: string[]; // Array of uids who have read the latest message
}

export interface CallSession {
  id: string;
  chatId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: any;
  calleeId: string; // For 1-on-1 calls
  type: 'audio' | 'video';
  status: 'ringing' | 'accepted' | 'rejected' | 'missed' | 'ended' | 'busy' | 'failed' | 'canceled';
  createdAt: number;
  acceptedAt?: number;
  endedAt?: number;
  endedBy?: string;
  offer?: any;
  answer?: any;
}

export interface ChatMessage {
  id: string;
  visitId: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string;
  timestamp: number;
}
