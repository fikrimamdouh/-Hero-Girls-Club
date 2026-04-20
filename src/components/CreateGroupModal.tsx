import React, { useState } from 'react';
import { ChildProfile } from '../types';
import { X, Users, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

interface CreateGroupModalProps {
  onClose: () => void;
  friends: ChildProfile[];
  activeChild: ChildProfile;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, friends, activeChild }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const toggleFriend = (uid: string) => {
    setSelectedFriends(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) {
      toast.error('يرجى إدخال اسم المجموعة واختيار صديق واحد على الأقل');
      return;
    }

    setIsCreating(true);
    try {
      const participants = [activeChild.uid, ...selectedFriends];
      
      await addDoc(collection(db, 'chats'), {
        type: 'group',
        name: groupName.trim(),
        participants,
        admins: [activeChild.uid],
        createdBy: activeChild.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        theme: 'default'
      });

      toast.success('تم إنشاء المجموعة بنجاح!');
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chats');
      toast.error('حدث خطأ أثناء إنشاء المجموعة');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            إنشاء مجموعة جديدة
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">اسم المجموعة</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="مثال: أبطال المغامرات"
              className="w-full bg-slate-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">اختر الأصدقاء ({selectedFriends.length})</label>
            <div className="space-y-2">
              {friends.map(friend => (
                <button
                  key={friend.uid}
                  onClick={() => toggleFriend(friend.uid)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    selectedFriends.includes(friend.uid) 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-xl shadow-sm">
                      {friend.avatar?.hairStyle === 'spiky' ? '👦' : '👧'}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{friend.name}</p>
                      <p className="text-xs text-slate-500">{friend.heroName}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedFriends.includes(friend.uid)
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-slate-300'
                  }`}>
                    {selectedFriends.includes(friend.uid) && <Check className="w-4 h-4" />}
                  </div>
                </button>
              ))}
              {friends.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-4">لا يوجد أصدقاء لإضافتهم</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleCreateGroup}
            disabled={isCreating || !groupName.trim() || selectedFriends.length === 0}
            className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'جاري الإنشاء...' : 'إنشاء المجموعة'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
