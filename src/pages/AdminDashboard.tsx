import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Users, MessageSquare, Activity, Settings, Database, Trash2, CheckCircle, XCircle, Star, Mail, Phone, MapPin, School, Lock, ArrowRight, Lightbulb } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, doc, deleteDoc, updateDoc, onSnapshot, orderBy, limit, where, setDoc, writeBatch } from 'firebase/firestore';
import { UserProfile, ChildProfile, ActivityLog, FeatureIdea } from '../types';
import { toast } from 'sonner';

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [parents, setParents] = useState<UserProfile[]>([]);
  const [allChildren, setAllChildren] = useState<ChildProfile[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [ideas, setIdeas] = useState<FeatureIdea[]>([]);
  const [ideaChats, setIdeaChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mailStatus, setMailStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [mailError, setMailError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'children' | 'logs' | 'settings' | 'ideas' | 'chats'>('users');
  const [selectedChatChild, setSelectedChatChild] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

  // Helper to check if a user/child is online (active in last 5 minutes)
  const isOnline = (lastActive?: number) => {
    if (!lastActive) return false;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return lastActive > fiveMinutesAgo;
  };

  useEffect(() => {
    if (auth.currentUser?.email !== 'rorofikri@gmail.com') return;

    // Fetch Parents
    const unsubscribeParents = onSnapshot(collection(db, 'users'), (snapshot) => {
      setParents(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'users'));

    // Fetch All Children
    const unsubscribeChildren = onSnapshot(collection(db, 'children_profiles'), (snapshot) => {
      setAllChildren(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as ChildProfile)));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'children_profiles'));

    // Fetch Global Logs
    const qLogs = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'activity_logs'));

    // Fetch Ideas
    const qIdeas = query(collection(db, 'feature_ideas'), orderBy('createdAt', 'desc'));
    const unsubscribeIdeas = onSnapshot(qIdeas, (snapshot) => {
      setIdeas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeatureIdea)));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'feature_ideas'));

    // Fetch Idea Chats
    const qChats = query(collection(db, 'idea_chats'), orderBy('createdAt', 'asc'));
    const unsubscribeChats = onSnapshot(qChats, (snapshot) => {
      setIdeaChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'idea_chats'));

    // Fetch mail status
    fetch('/api/mail-status')
      .then(res => res.json())
      .then(data => {
        setMailStatus(data.status);
        if (data.error) setMailError(data.error);
      })
      .catch(() => setMailStatus('disconnected'));

    return () => {
      unsubscribeParents();
      unsubscribeChildren();
      unsubscribeLogs();
      unsubscribeIdeas();
      unsubscribeChats();
    };
  }, []);

  const handleApproveChild = async (child: ChildProfile) => {
    try {
      await updateDoc(doc(db, 'children_profiles', child.uid), {
        status: 'approved'
      });
      
      // Send notification email
      if (child.email) {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: child.email,
            type: 'approval',
            data: {
              name: child.name,
              heroName: child.heroName,
              message: `تمت الموافقة على طلب انضمامك! يمكنك الآن الدخول باستخدام الرمز السري: ${child.pin}`
            }
          })
        });
      }
      
      toast.success('تم تفعيل حساب البطلة وإرسال بريد إلكتروني');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `children_profiles/${child.uid}`);
    }
  };

  const handleUpdatePin = async (child: ChildProfile) => {
    const newPin = window.prompt('أدخل الرمز السري الجديد (4 أرقام):', child.pin);
    if (!newPin || newPin.length !== 4 || isNaN(Number(newPin))) {
      if (newPin) toast.error('الرمز يجب أن يكون 4 أرقام');
      return;
    }

    try {
      await updateDoc(doc(db, 'children_profiles', child.uid), {
        pin: newPin
      });

      // Send notification about PIN change
      if (child.email) {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: child.email,
            type: 'pin_change',
            data: {
              name: child.name,
              heroName: child.heroName,
              message: `تم تحديث الرمز السري الخاص بكِ. الرمز الجديد هو: ${newPin}`
            }
          })
        });
      }

      toast.success('تم تحديث الرمز السري وإرسال بريد إلكتروني');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `children_profiles/${child.uid}`);
    }
  };

  useEffect(() => {
    if (selectedChatChild) {
      const unreadMessages = ideaChats.filter(c => c.childId === selectedChatChild && c.role === 'user' && c.status === 'new');
      if (unreadMessages.length > 0) {
        const batch = writeBatch(db);
        unreadMessages.forEach(msg => {
          batch.update(doc(db, 'idea_chats', msg.id), { status: 'read' });
        });
        batch.commit().catch(err => console.error('Failed to mark chats as read:', err));
      }
    }
  }, [selectedChatChild, ideaChats.length]);

  const handleDeleteUser = async (uid: string, type: 'parent' | 'child') => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    try {
      const path = type === 'parent' ? 'users' : 'children_profiles';
      await deleteDoc(doc(db, path, uid));
      toast.success('تم الحذف بنجاح');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${type === 'parent' ? 'users' : 'children_profiles'}/${uid}`);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    try {
      const response = await fetch('/api/send-test-email', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        toast.success('تم إرسال الإيميل التجريبي بنجاح! تفقد بريدك الوارد.');
      } else {
        toast.error('فشل إرسال الإيميل');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الإرسال');
    } finally {
      setIsSendingTest(false);
    }
  };

  if (auth.currentUser?.email !== 'rorofikri@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border-2 border-red-100">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800">وصول ممنوع</h1>
          <p className="text-red-600">هذه المنطقة مخصصة لمدير المنصة فقط.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-arabic" dir="rtl">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              auth.signOut();
              localStorage.removeItem('active_child');
              window.location.href = '/';
            }}
            className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 group"
          >
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-bold">تسجيل الخروج</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">لوحة إدارة المنصة</h1>
              <p className="text-slate-500 text-sm">مرحباً بك يا مدير، أنت تتحكم في كل شيء هنا.</p>
            </div>
          </div>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            أولياء الأمور
          </button>
          <button 
            onClick={() => setActiveTab('children')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'children' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            البطلات
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            السجلات
          </button>
          <button 
            onClick={() => setActiveTab('ideas')}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'ideas' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Lightbulb className="w-4 h-4" />
            أفكار الأبطال
            {ideas.filter(i => i.status === 'new').length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {ideas.filter(i => i.status === 'new').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('chats')}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'chats' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <MessageSquare className="w-4 h-4" />
            محادثات المساعد
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <Users className="w-10 h-10 text-blue-500 mb-2" />
            <p className="text-slate-500 text-sm">إجمالي أولياء الأمور</p>
            <p className="text-3xl font-bold text-slate-800">{parents.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <Star className="w-10 h-10 text-amber-500 mb-2" />
            <p className="text-slate-500 text-sm">إجمالي البطلات</p>
            <p className="text-3xl font-bold text-slate-800">{allChildren.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <Activity className="w-10 h-10 text-emerald-500 mb-2" />
            <p className="text-slate-500 text-sm">النشاط اليومي</p>
            <p className="text-3xl font-bold text-slate-800">{logs.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <Database className="w-10 h-10 text-purple-500 mb-2" />
            <p className="text-slate-500 text-sm">حالة البريد</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className={`text-xl font-bold ${mailStatus === 'connected' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {mailStatus === 'connected' ? 'متصل' : mailStatus === 'loading' ? 'جاري الفحص...' : 'غير متصل'}
                </p>
                {mailStatus === 'connected' && (
                  <button 
                    onClick={handleSendTestEmail}
                    disabled={isSendingTest}
                    className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-all disabled:opacity-50"
                  >
                    {isSendingTest ? 'جاري الإرسال...' : 'إرسال تجربة'}
                  </button>
                )}
              </div>
              {mailError && mailStatus === 'disconnected' && (
                <p className="text-[10px] text-red-400 mt-1 leading-tight">{mailError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          {activeTab === 'users' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">إدارة أولياء الأمور</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 font-bold text-slate-400">الاسم</th>
                      <th className="pb-4 font-bold text-slate-400">البريد الإلكتروني</th>
                      <th className="pb-4 font-bold text-slate-400">تاريخ التسجيل</th>
                      <th className="pb-4 font-bold text-slate-400">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {parents.map(parent => (
                      <tr key={parent.uid} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isOnline((parent as any).lastActive) ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                            <span className="font-bold text-slate-700">{parent.displayName}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-500">{parent.email}</td>
                        <td className="py-4 text-slate-400 text-sm">{new Date(parent.createdAt).toLocaleDateString('ar-EG')}</td>
                        <td className="py-4">
                          <button 
                            onClick={() => handleDeleteUser(parent.uid, 'parent')}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'children' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">إدارة جميع البطلات</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allChildren.map(child => (
                  <div key={child.uid} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 relative group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-slate-100">
                          {child.avatar?.hairStyle || '👧'}
                        </div>
                        <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white ${isOnline((child as any).lastActive) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-slate-300'}`} title={isOnline((child as any).lastActive) ? 'متصلة الآن' : 'غير متصلة'}></div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          child.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                          child.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {child.status === 'approved' ? 'مفعل' : child.status === 'pending' ? 'قيد الانتظار' : 'مرفوض'}
                        </div>
                        {isOnline((child as any).lastActive) && (
                          <span className="text-[9px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">أونلاين</span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{child.name}</h3>
                    <p className="text-indigo-600 font-bold text-sm mb-4">{child.heroName}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users className="w-3 h-3" /> {child.parentName || 'غير محدد'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" /> {child.city || 'غير محدد'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <School className="w-3 h-3" /> {child.school || 'غير محدد'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3 h-3" /> {child.email || 'لا يوجد بريد'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="flex gap-2">
                        {child.status === 'pending' && (
                          <button 
                            onClick={() => handleApproveChild(child)}
                            className="p-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="تفعيل الحساب"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleUpdatePin(child)}
                          className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="تعديل الرمز السري"
                        >
                          <Lock className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(child.uid, 'child')}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400">النقاط</p>
                          <p className="font-bold text-slate-700">{child.points}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400">المستوى</p>
                          <p className="font-bold text-slate-700">{child.level}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">سجل النشاط العالمي</h2>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setLogStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${logStatusFilter === 'all' ? 'bg-white text-princess-purple shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    الكل
                  </button>
                  <button 
                    onClick={() => setLogStatusFilter('success')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${logStatusFilter === 'success' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    عمليات ناجحة ✅
                  </button>
                  <button 
                    onClick={() => setLogStatusFilter('failed')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${logStatusFilter === 'failed' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    عمليات فشلت ❌
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {logs
                  .filter(log => logStatusFilter === 'all' || log.status === logStatusFilter)
                  .map(log => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${
                        log.type === 'login' ? 'bg-blue-100 text-blue-600' : 
                        log.type === 'learning' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {log.type === 'login' ? <Activity className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{log.childName} - {log.message}</p>
                        <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString('ar-EG')}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      log.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {log.type === 'login' ? (log.status === 'success' ? 'دخول ناجح' : 'فشل دخول') : 'نشاط'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ideas' && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">صندوق أفكار الأبطال 💡</h2>
                  <p className="text-slate-500">الأفكار والمقترحات المرسلة من الأطفال عبر المساعد الذكي</p>
                </div>
              </div>
              <div className="grid gap-4">
                {ideas.map(idea => (
                  <motion.div key={idea.id} className={`p-6 rounded-2xl border-2 ${idea.status === 'new' ? 'border-purple-400 bg-purple-50' : 'border-slate-200 bg-white'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{idea.childName}</h3>
                        <p className="text-sm text-slate-500">{new Date(idea.createdAt).toLocaleString('ar-EG')}</p>
                      </div>
                      <div className="flex gap-2">
                        {idea.status === 'new' && (
                          <button 
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'feature_ideas', idea.id), { status: 'read' });
                                toast.success('تم تحديد الفكرة كمقروءة');
                              } catch (error) {
                                handleFirestoreError(error, OperationType.UPDATE, 'feature_ideas');
                              }
                            }} 
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title="تحديد كمقروء"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={async () => {
                            try {
                              await deleteDoc(doc(db, 'feature_ideas', idea.id));
                              toast.success('تم حذف الفكرة');
                            } catch (error) {
                              handleFirestoreError(error, OperationType.DELETE, 'feature_ideas');
                            }
                          }} 
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="حذف الفكرة"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 text-lg whitespace-pre-wrap">{idea.idea}</p>
                  </motion.div>
                ))}
                {ideas.length === 0 && (
                  <div className="text-center py-12 text-slate-500 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-xl">لا توجد أفكار جديدة بعد</p>
                    <p className="text-sm mt-2">عندما يقترح الأطفال أفكاراً عبر المساعد الذكي، ستظهر هنا.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'chats' && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">محادثات المساعد فكرة 💬</h2>
                  <p className="text-slate-500">سجل المحادثات بين الأطفال والمساعد الذكي</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* قائمة الأطفال الذين لديهم محادثات */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-[600px] flex flex-col">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    الأطفال
                  </div>
                  <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {Array.from(new Set(ideaChats.map(c => c.childId))).map(childId => {
                      const childChats = ideaChats.filter(c => c.childId === childId);
                      const childData = allChildren.find(c => c.uid === childId);
                      const childName = childChats[0]?.childName || childData?.name || 'بطلة مجهولة';
                      const lastMessage = childChats[childChats.length - 1];
                      const unreadCount = childChats.filter(c => c.role === 'user' && c.status === 'new').length;
                      
                      return (
                        <button
                          key={childId}
                          onClick={() => {
                            setSelectedChatChild(childId);
                            // Mark visible messages as read (UI only, logic below for firestore)
                          }}
                          className={`w-full text-right p-3 rounded-xl transition-all flex items-center gap-3 relative border ${
                            selectedChatChild === childId 
                              ? 'bg-indigo-50 border-indigo-200' 
                              : 'hover:bg-slate-50 border-transparent'
                          }`}
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl shrink-0 overflow-hidden border border-slate-200">
                             {childData?.avatar?.hairStyle || '👧'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center gap-2">
                              <span className="font-bold text-slate-800 truncate">{childName}</span>
                              {unreadCount > 0 && (
                                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full shrink-0 animate-bounce">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{lastMessage?.text}</p>
                          </div>
                          {isOnline(childData?.lastActive) && (
                            <div className="absolute top-3 left-3 w-2 h-2 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                          )}
                        </button>
                      );
                    })}
                    {ideaChats.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        لا توجد محادثات بعد
                      </div>
                    )}
                  </div>
                </div>

                {/* نافذة المحادثة */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden h-[600px] flex flex-col">
                  {selectedChatChild ? (
                    <>
                      <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
                        <span>محادثة: {ideaChats.find(c => c.childId === selectedChatChild)?.childName}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                        {ideaChats.filter(c => c.childId === selectedChatChild).map(msg => (
                          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${
                              msg.role === 'user' 
                                ? 'bg-indigo-500 text-white rounded-tl-none' 
                                : 'bg-white border border-slate-200 text-slate-700 rounded-tr-none shadow-sm'
                            }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                              <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                {new Date(msg.createdAt).toLocaleString('ar-EG')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                      <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                      <p>اختر طفلاً لعرض المحادثة</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
