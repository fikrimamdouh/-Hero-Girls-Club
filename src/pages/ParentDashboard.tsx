import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Plus, Users, ClipboardList, LogOut, Settings, X, Star, Sparkles, Activity, CheckCircle2, XCircle, Trash2, BookOpen, Brain, Mail, LayoutDashboard, Lightbulb } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, setDoc, deleteDoc, getDocs, writeBatch, limit, orderBy } from 'firebase/firestore';
import { ChildProfile, Mission, ActivityLog } from '../types';
import { toast } from 'sonner';
import { INITIAL_MISSIONS } from '../constants';

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({ name: '', pin: '', heroName: '', heroPower: '', school: '', city: '', hobbies: '' });
  const [showEditChild, setShowEditChild] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [childToDelete, setChildToDelete] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mailStatus, setMailStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [suggestion, setSuggestion] = useState('');
  const [isSendingSuggestion, setIsSendingSuggestion] = useState(false);

  const handleDeleteChild = async (childId: string) => {
    setChildToDelete(childId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChild = async () => {
    if (!childToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'children_profiles', childToDelete));
      toast.success('تم حذف البطلة بنجاح');
      setShowDeleteConfirm(false);
      setChildToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `children_profiles/${childToDelete}`);
    }
  };

  const [loginLogs, setLoginLogs] = useState<ActivityLog[]>([]);
  const [learningLogs, setLearningLogs] = useState<ActivityLog[]>([]);

  const [childIds, setChildIds] = useState<string[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | 'all'>('all');

  useEffect(() => {
    if (!auth.currentUser) return;

    // First fetch children to get their IDs
    const childrenQuery = query(
      collection(db, 'children_profiles'),
      where('parentId', '==', auth.currentUser.uid)
    );

    const unsubscribeChildren = onSnapshot(childrenQuery, (snapshot) => {
      const childrenData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any));
      setChildren(childrenData);
      setChildIds(childrenData.map(c => c.uid));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'children_profiles'));

    const missionsQuery = query(
      collection(db, 'missions'),
      where('parentId', '==', auth.currentUser.uid)
    );

    const unsubscribeMissions = onSnapshot(missionsQuery, (snapshot) => {
      setMissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'missions'));

    // Fetch mail status
    fetch('/api/mail-status')
      .then(res => res.json())
      .then(data => setMailStatus(data.status))
      .catch(() => setMailStatus('disconnected'));

    return () => {
      unsubscribeChildren();
      unsubscribeMissions();
    };
  }, []);

  // Presence Heartbeat for Parents
  useEffect(() => {
    if (!auth.currentUser) return;

    const updatePresence = () => {
      if (auth.currentUser) {
        setDoc(doc(db, 'users', auth.currentUser.uid), {
          lastActive: Date.now()
        }, { merge: true }).catch(err => console.error('Failed to update parent presence:', err));
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (childIds.length === 0) {
      setLoginLogs([]);
      setLearningLogs([]);
      return;
    }

    // Fetch login logs for these children
    const logsQuery = query(
      collection(db, 'activity_logs'),
      where('type', '==', 'login'),
      where('childId', 'in', childIds),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      setLoginLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'activity_logs'));

    // Fetch learning logs for these children
    const learningLogsQuery = query(
      collection(db, 'activity_logs'),
      where('type', '==', 'learning'),
      where('childId', 'in', childIds),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribeLearningLogs = onSnapshot(learningLogsQuery, (snapshot) => {
      setLearningLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'activity_logs'));

    return () => {
      unsubscribeLogs();
      unsubscribeLearningLogs();
    };
  }, [childIds]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!newChild.name || !newChild.pin || newChild.pin.length !== 4) {
      toast.error('يرجى إدخال الاسم ورمز سري من 4 أرقام');
      return;
    }

    try {
      // Check if child with same name already exists globally or for this parent
      const nameQuery = query(collection(db, 'children_profiles'), where('name', '==', newChild.name));
      const nameSnapshot = await getDocs(nameQuery);
      if (!nameSnapshot.empty) {
        toast.error('عذراً، هذا الاسم مسجل مسبقاً في النظام. يرجى اختيار اسم مختلف.');
        return;
      }

      const childId = Math.random().toString(36).substring(7);
      const childProfile: ChildProfile = {
        uid: childId,
        parentId: auth.currentUser.uid,
        name: newChild.name,
        pin: newChild.pin,
        heroName: newChild.heroName || `بطلة ${newChild.name}`,
        heroPower: newChild.heroPower || 'قوة اللطف',
        heroBadge: 'courage',
        school: newChild.school || '',
        city: newChild.city || '',
        hobbies: newChild.hobbies || '',
        points: 0,
        level: 1,
        avatar: {
          hairStyle: '💇‍♀️',
          dressStyle: '👗',
          color: 'bg-pink-400',
          accessory: '👑'
        },
        status: 'approved',
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'children_profiles', childId), childProfile);
      
      // Add initial missions
      for (const mission of INITIAL_MISSIONS) {
        await addDoc(collection(db, 'missions'), {
          id: Math.random().toString(36).substring(7),
          title: mission.title,
          description: '',
          points: mission.points,
          type: mission.type,
          isApproved: true,
          isCompleted: false,
          childId: childId,
          parentId: auth.currentUser.uid,
          createdAt: Date.now()
        });
      }

      toast.success('تمت إضافة البطلة بنجاح!');
      setShowAddChild(false);
      setNewChild({ name: '', pin: '', heroName: '', heroPower: '', school: '', city: '', hobbies: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'children_profiles');
    }
  };

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem('active_child');
    window.location.href = '/';
  };

  const handleUpdateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChild) return;
    
    setIsUpdating(true);
    try {
      // Check if the name is taken by another child
      const nameQuery = query(collection(db, 'children_profiles'), where('name', '==', editingChild.name));
      const nameSnapshot = await getDocs(nameQuery);
      if (nameSnapshot.docs.some(doc => doc.id !== editingChild.uid)) {
        toast.error('عذراً، هذا الاسم مستخدم بالفعل لبطلة أخرى');
        setIsUpdating(false);
        return;
      }

      await setDoc(doc(db, 'children_profiles', editingChild.uid), {
        heroName: editingChild.heroName,
        heroPower: editingChild.heroPower,
        name: editingChild.name,
        pin: editingChild.pin,
        school: editingChild.school || '',
        city: editingChild.city || '',
        hobbies: editingChild.hobbies || ''
      }, { merge: true });
      
      toast.success('تم تحديث بيانات البطلة بنجاح!');
      setShowEditChild(false);
      setEditingChild(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `children_profiles/${editingChild.uid}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim() || !auth.currentUser) return;

    setIsSendingSuggestion(true);
    try {
      // 1. Store in Firestore (Admin Dashboard reads from here)
      await addDoc(collection(db, 'feature_ideas'), {
        title: `اقتراح من ولي أمر: ${auth.currentUser.email}`,
        description: suggestion,
        status: 'pending',
        votes: 0,
        parentEmail: auth.currentUser.email,
        parentId: auth.currentUser.uid,
        createdAt: Date.now()
      });

      // 2. Notify Admin via API (Optional, but user requested "reaching the email")
      // We don't expose the admin email here; the backend should handle the recipient.
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggestion',
          data: {
            parentEmail: auth.currentUser.email,
            message: suggestion
          }
        })
      });

      toast.success('تم إرسال اقتراحك بنجاح! شكراً لك.');
      setSuggestion('');
    } catch (error) {
      console.error('Error sending suggestion:', error);
      toast.error('عذراً، لم نتمكن من إرسال الاقتراح حالياً.');
    } finally {
      setIsSendingSuggestion(false);
    }
  };

  const handleInitializeContent = async () => {
    if (!window.confirm('هل تريدين إضافة المحتوى العالمي الأولي (قصص ومهام)؟')) return;
    
    setLoading(true);
    try {
      const stories = [
        { title: 'رينا وبطلة الشجاعة', content: 'في يوم من الأيام، اكتشفت رينا أن الشجاعة ليست في عدم الخوف، بل في مواجهته...', points: 50 },
        { title: 'سر الحديقة السحرية', content: 'كانت هناك حديقة لا تفتح أبوابها إلا لمن يملك قلباً طيباً ويحب مساعدة الآخرين...', points: 60 },
        { title: 'مغامرة في عالم الأرقام', content: 'انطلقت البطلة في رحلة لإنقاذ الأرقام الضائعة، وتعلمت أن كل رقم له دور مهم...', points: 40 }
      ];

      for (const story of stories) {
        await addDoc(collection(db, 'stories'), {
          ...story,
          createdAt: Date.now()
        });
      }

      toast.success('تم إضافة المحتوى العالمي بنجاح!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'stories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5f7] p-4 md:p-8 relative overflow-hidden">
      {/* Magical Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"
        />
      </div>

      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8 princess-card p-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-princess-pink/10 p-3 rounded-2xl">
            <Shield className="w-8 h-8 text-princess-pink" />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-princess-purple">لوحة التحكم الملكية</h1>
            <p className="text-pink-400 text-sm">إدارة عالم البطلات السحري</p>
          </div>
        </div>
        <div className="flex gap-2">
          {auth.currentUser?.email === 'rorofikri@gmail.com' && (
            <button 
              onClick={() => navigate('/admin')}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-3 rounded-2xl transition-colors border-2 border-indigo-100 flex items-center gap-2 px-4 shadow-sm"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-bold hidden sm:inline">لوحة الإدارة</span>
            </button>
          )}
          {auth.currentUser?.email === 'rorofikri@gmail.com' && (
            <button 
              onClick={handleInitializeContent}
              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 p-3 rounded-2xl transition-colors border-2 border-yellow-100 flex items-center gap-2 px-4 shadow-sm"
            >
              <Sparkles className="w-5 h-5 text-princess-gold" />
              <span className="font-bold hidden sm:inline">إضافة محتوى</span>
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="bg-pink-50 hover:bg-pink-100 text-pink-500 p-3 rounded-2xl transition-colors flex items-center gap-2 px-6 border-2 border-pink-100 shadow-sm"
          >
            <LogOut className="w-6 h-6" />
            <span className="font-bold hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Children Management */}
        <section className="lg:col-span-2 space-y-6">
          <div className="princess-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-princess-purple flex items-center gap-2">
                <Users className="w-6 h-6" />
                إدارة البطلات
              </h2>
              <button 
                onClick={() => setShowAddChild(true)}
                className="princess-button py-3 px-6 text-sm flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إضافة بطلة جديدة
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lavender-500"></div>
              </div>
            ) : children.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-lavender-100 rounded-2xl">
                <p className="text-lavender-400">لا يوجد بطلات مسجلات بعد</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {children.map(child => (
                  <div 
                    key={child.uid} 
                    onClick={() => setSelectedChildId(child.uid)}
                    className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer relative group ${
                      selectedChildId === child.uid 
                      ? 'bg-lavender-100 border-lavender-400 shadow-inner' 
                      : 'bg-white border-lavender-50 hover:border-lavender-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-lavender-100 to-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-lavender-200">
                        {child.avatar?.hairStyle || '👧'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lavender-900 text-lg">{child.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-princess-gold fill-princess-gold" />
                            <span className="font-bold text-lavender-700">{child.points}</span>
                          </div>
                        </div>
                        <p className="text-princess-purple font-bold text-xs mb-2 italic opacity-80">{child.heroName}</p>
                        
                        <div className="flex gap-2">
                           <div className="bg-white/50 px-2 py-0.5 rounded-lg border border-lavender-100 text-[10px] font-bold text-lavender-600">
                             مستوى {child.level}
                           </div>
                           <div className="bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 text-[10px] font-bold text-emerald-600">
                             {child.status === 'approved' ? 'نشط' : 'قيد المراجعة'}
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChild(child);
                          setShowEditChild(true);
                        }}
                        className="p-1.5 bg-white rounded-full shadow-sm text-lavender-400 hover:text-lavender-600 border border-lavender-100"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChild(child.uid);
                        }}
                        className="p-1.5 bg-white rounded-full shadow-sm text-red-300 hover:text-red-500 border border-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {selectedChildId === child.uid && (
                      <motion.div 
                        layoutId="active-child"
                        className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-lavender-500 rounded-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning Progress Section */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-blue-100">
            <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2 mb-6 text-right">
              <BookOpen className="w-6 h-6 text-blue-500" />
              متابعة التقدم التعليمي
            </h2>
            <div className="space-y-3">
              {learningLogs.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-blue-100 rounded-2xl">
                  <p className="text-blue-300 italic">لا توجد سجلات تعليمية بعد</p>
                </div>
              ) : (
                learningLogs
                  .filter(log => selectedChildId === 'all' || log.childId === selectedChildId)
                  .map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-blue-100">
                          {children.find(c => c.uid === log.childId)?.avatar?.hairStyle || '👧'}
                        </div>
                        <div>
                          <p className="font-bold text-blue-900 text-sm">
                            {log.childName} - {log.message}
                          </p>
                          <p className="text-[10px] text-blue-400">
                            {new Date(log.timestamp).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Brain className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Login Logs Section */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-pink-100">
            <h2 className="text-xl font-bold text-princess-purple flex items-center gap-2 mb-6 text-right">
              <Activity className="w-6 h-6 text-princess-pink" />
              سجل عمليات الدخول (مراقبة الأمان)
            </h2>
            <div className="space-y-3">
              {loginLogs.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-pink-100 rounded-2xl">
                  <p className="text-pink-300 italic">لا توجد سجلات دخول بعد</p>
                </div>
              ) : (
                loginLogs
                  .filter(log => selectedChildId === 'all' || log.childId === selectedChildId)
                  .map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-pink-50/50 rounded-2xl border border-pink-100 text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-pink-100">
                          {children.find(c => c.uid === log.childId)?.avatar?.hairStyle || '👧'}
                        </div>
                        <div>
                          <p className="font-bold text-princess-purple text-sm">
                            {log.childName} - {log.message}
                          </p>
                          <p className="text-[10px] text-pink-400">
                            {new Date(log.timestamp).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg ${log.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-lavender-100">
            <h2 className="text-xl font-bold text-lavender-800 flex items-center gap-2 mb-6">
              <ClipboardList className="w-6 h-6" />
              المهام النشطة
            </h2>
            <div className="space-y-4">
              {missions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-lavender-100 rounded-2xl">
                  <p className="text-lavender-400">لا يوجد مهام نشطة حالياً</p>
                </div>
              ) : (
                missions
                  .filter(m => selectedChildId === 'all' || m.childId === selectedChildId)
                  .map(mission => (
                    <div key={mission.id} className="p-4 bg-lavender-50 rounded-xl border border-lavender-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm shadow-sm border border-lavender-100">
                          {children.find(c => c.uid === mission.childId)?.avatar?.hairStyle || '👧'}
                        </div>
                        <div>
                          <p className="font-bold text-lavender-800">{mission.title}</p>
                          <p className="text-[10px] text-lavender-400">
                            {children.find(c => c.uid === mission.childId)?.name} • النقاط: {mission.points}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${mission.isCompleted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {mission.isCompleted ? 'مكتملة ✨' : 'قيد التنفيذ'}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>

        {/* Sidebar / Settings */}
        <aside className="space-y-6">
          {/* Child Selection Filter */}
          {children.length > 1 && (
            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-slate-100 mb-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-princess-purple" />
                تصفية حسب البطلة
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedChildId('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedChildId === 'all' 
                    ? 'bg-princess-purple text-white shadow-md' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  الكل
                </button>
                {children.map(child => (
                  <button
                    key={child.uid}
                    onClick={() => setSelectedChildId(child.uid)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      selectedChildId === child.uid 
                      ? 'bg-princess-pink text-white shadow-md' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg">{child.avatar?.hairStyle || '👧'}</span>
                    {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="princess-card p-8">
            <h2 className="text-xl font-bold text-princess-purple flex items-center gap-2 mb-6">
              <Settings className="w-6 h-6" />
              حسابي
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-lavender-50 rounded-2xl border-2 border-lavender-100">
                <p className="text-xs text-lavender-400 mb-1">البريد الإلكتروني الحالي</p>
                <p className="text-sm font-bold text-lavender-800 truncate">{auth.currentUser?.email}</p>
              </div>
              <div className="p-4 bg-lavender-50 rounded-2xl border-2 border-lavender-100">
                <p className="text-xs text-lavender-400 mb-1">عدد البطلات</p>
                <p className="text-sm font-bold text-lavender-800">{children.length}</p>
              </div>
              
              {/* Suggestion Form */}
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border-2 border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-indigo-900 text-sm">أرسلي اقتراحاً للمديرة</h3>
                </div>
                <form onSubmit={handleSendSuggestion} className="space-y-3">
                  <textarea
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="لديكِ فكرة جديدة؟ أخبرينا بها..."
                    className="w-full p-3 rounded-xl border-2 border-indigo-50 focus:border-indigo-200 outline-none text-sm min-h-[100px] resize-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSendingSuggestion || !suggestion.trim()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSendingSuggestion ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <Mail className="w-3 h-3" />
                    )}
                    إرسال الاقتراح
                  </button>
                </form>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                <h3 className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  حالة الاتصال
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[10px] text-blue-800 font-bold">لوحة البيانات مفعلة</p>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full py-4 rounded-xl border-2 border-pink-100 text-pink-500 font-bold hover:bg-pink-50 transition-all shadow-sm"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-princess-pink to-princess-purple p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
            <Sparkles className="w-12 h-12 mb-4 opacity-30 text-princess-gold" />
            <h3 className="text-xl font-bold mb-2 relative z-10">نصيحة اليوم</h3>
            <p className="text-pink-50 text-sm leading-relaxed relative z-10">
              شجعي بطلتك على إكمال مهامها اليومية لزيادة نقاطها وفتح أوسمة جديدة!
            </p>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </aside>
      </main>

      {/* Add Child Dialog */}
      <AnimatePresence>
        {showAddChild && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAddChild(false)}
                className="absolute top-4 left-4 p-2 hover:bg-lavender-50 rounded-full text-lavender-400"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-lavender-800 mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6" />
                إضافة بطلة جديدة
              </h2>

              <form onSubmit={handleAddChild} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-lavender-600 mb-1">اسم البطلة</label>
                  <input
                    type="text"
                    required
                    value={newChild.name}
                    onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none"
                    placeholder="مثال: رينا"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-lavender-600 mb-1">الرمز السري (4 أرقام)</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={newChild.pin}
                    onChange={(e) => setNewChild({...newChild, pin: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none tracking-widest"
                    placeholder="****"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-lavender-600 mb-1">اسم البطولة (اللقب)</label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {['صبورة', 'ذكية', 'شجاعة', 'كريمة', 'رسامة'].map(title => (
                      <button
                        key={title}
                        type="button"
                        onClick={() => setNewChild({...newChild, heroName: `البطلة ${title}`})}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          newChild.heroName === `البطلة ${title}`
                            ? 'bg-lavender-500 text-white border-lavender-500'
                            : 'bg-white text-lavender-400 border-lavender-100 hover:border-lavender-300'
                        }`}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={newChild.heroName}
                    onChange={(e) => setNewChild({...newChild, heroName: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none"
                    placeholder="مثال: بطلة التفكير"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-lavender-600 mb-1">المدرسة</label>
                    <input
                      type="text"
                      value={newChild.school}
                      onChange={(e) => setNewChild({...newChild, school: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none"
                      placeholder="اسم المدرسة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-lavender-600 mb-1">المدينة</label>
                    <input
                      type="text"
                      value={newChild.city}
                      onChange={(e) => setNewChild({...newChild, city: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none"
                      placeholder="المدينة"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-lavender-600 mb-1">هوايات خاصة</label>
                  <textarea
                    value={newChild.hobbies}
                    onChange={(e) => setNewChild({...newChild, hobbies: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none min-h-[60px]"
                    placeholder="ما هي هواياتك المفضلة؟"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-lavender-600 hover:bg-lavender-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg mt-4"
                >
                  إضافة البطلة
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Child Dialog */}
      <AnimatePresence>
        {showEditChild && editingChild && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative"
            >
              <button 
                onClick={() => setShowEditChild(false)}
                className="absolute top-4 left-4 p-2 hover:bg-lavender-50 rounded-full text-lavender-400"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-lavender-800 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                تعديل بيانات البطلة
              </h2>

              <form onSubmit={handleUpdateChild} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-lavender-600 mb-1">اسم البطلة</label>
                  <input
                    type="text"
                    required
                    value={editingChild.name}
                    onChange={(e) => setEditingChild({...editingChild, name: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-lavender-600 mb-1">الرمز السري (4 أرقام)</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={editingChild.pin}
                    onChange={(e) => setEditingChild({...editingChild, pin: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-lavender-600 mb-1">اسم البطولة (اللقب)</label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {['صبورة', 'ذكية', 'شجاعة', 'كريمة', 'رسامة'].map(title => (
                      <button
                        key={title}
                        type="button"
                        onClick={() => setEditingChild({...editingChild, heroName: `البطلة ${title}`})}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          editingChild.heroName === `البطلة ${title}`
                            ? 'bg-lavender-500 text-white border-lavender-500'
                            : 'bg-white text-lavender-400 border-lavender-100 hover:border-lavender-300'
                        }`}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editingChild.heroName || ''}
                    onChange={(e) => setEditingChild({...editingChild, heroName: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-lavender-600 mb-1">قوة البطولة</label>
                  <input
                    type="text"
                    value={editingChild.heroPower || ''}
                    onChange={(e) => setEditingChild({...editingChild, heroPower: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-lavender-600 mb-1">المدرسة</label>
                    <input
                      type="text"
                      value={editingChild.school || ''}
                      onChange={(e) => setEditingChild({...editingChild, school: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-lavender-600 mb-1">المدينة</label>
                    <input
                      type="text"
                      value={editingChild.city || ''}
                      onChange={(e) => setEditingChild({...editingChild, city: e.target.value})}
                      className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-lavender-600 mb-1">هوايات خاصة</label>
                  <textarea
                    value={editingChild.hobbies || ''}
                    onChange={(e) => setEditingChild({...editingChild, hobbies: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-lavender-100 focus:border-lavender-400 outline-none min-h-[60px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-lavender-600 hover:bg-lavender-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : null}
                  تحديث بيانات البطلة
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm p-8 rounded-[2rem] shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">تأكيد الحذف</h2>
              <p className="text-gray-500 mb-8">هل أنتِ متأكدة من حذف هذه البطلة؟ سيتم حذف جميع بياناتها ولا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteChild}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all"
                >
                  نعم، حذف
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setChildToDelete(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
