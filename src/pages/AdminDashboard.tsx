import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Users, MessageSquare, Activity, Settings, Database, Trash2, CheckCircle, XCircle, Star, Mail, Phone, MapPin, School, Lock, ArrowRight, Lightbulb, AlertTriangle } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'users' | 'children' | 'logs' | 'settings' | 'ideas' | 'chats' | 'safety'>('users');
  const [selectedChatChild, setSelectedChatChild] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [safetyReports, setSafetyReports] = useState<any[]>([]);

  const isOnline = (lastActive?: number) => {
    if (!lastActive) return false;
    return lastActive > Date.now() - 5 * 60 * 1000;
  };

  useEffect(() => {
    if (auth.currentUser?.email !== 'rorofikri@gmail.com') return;

    const unsubscribeParents = onSnapshot(collection(db, 'users'), (snapshot) => {
      setParents(snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'users'));

    const unsubscribeChildren = onSnapshot(collection(db, 'children_profiles'), (snapshot) => {
      setAllChildren(snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as ChildProfile)));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'children_profiles'));

    const qLogs = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog)));
      setLoading(false);
    }, (err) => { handleFirestoreError(err, OperationType.GET, 'activity_logs'); setLoading(false); });

    const qIdeas = query(collection(db, 'feature_ideas'), orderBy('createdAt', 'desc'));
    const unsubscribeIdeas = onSnapshot(qIdeas, (snapshot) => {
      setIdeas(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FeatureIdea)));
    }, () => {});

    const qChats = query(collection(db, 'idea_chats'), orderBy('updatedAt', 'desc'), limit(100));
    const unsubscribeChats = onSnapshot(qChats, (snapshot) => {
      setIdeaChats(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});

    const qSafety = query(collection(db, 'safety_reports'), orderBy('createdAt', 'desc'));
    const unsubscribeSafety = onSnapshot(qSafety, (snapshot) => {
      setSafetyReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});

    fetch('/api/mail-status')
      .then(r => r.json())
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
      unsubscribeSafety();
    };
  }, []);

  const handleApproveChild = async (child: ChildProfile) => {
    try {
      await updateDoc(doc(db, 'children_profiles', child.uid), { status: 'approved' });
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
      toast.success(`تمت الموافقة على ${child.name}`);
    } catch {
      toast.error('حدث خطأ أثناء الموافقة');
    }
  };

  const handleDeleteChild = async (uid: string) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذا الحساب؟')) return;
    try {
      await deleteDoc(doc(db, 'children_profiles', uid));
      toast.success('تم الحذف');
    } catch {
      toast.error('فشل الحذف');
    }
  };

  const handleSendTestMail = async () => {
    setIsSendingTest(true);
    try {
      const res = await fetch('/api/send-test-email', { method: 'POST' });
      const data = await res.json();
      if (data.success) toast.success('تم إرسال البريد التجريبي!');
      else toast.error('فشل الإرسال: ' + data.error);
    } catch {
      toast.error('لم يمكن الوصول لخادم البريد');
    } finally {
      setIsSendingTest(false);
    }
  };

  const filteredLogs = logStatusFilter === 'all'
    ? logs
    : logs.filter(l => l.status === logStatusFilter);

  if (auth.currentUser?.email !== 'rorofikri@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800">غير مصرح لك بالدخول</h2>
          <button onClick={() => navigate('/')} className="mt-4 bg-slate-800 text-white px-6 py-2 rounded-xl font-bold">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800">لوحة التحكم</h1>
              <p className="text-xs text-slate-400">نادي البطلات الصغيرات</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-bold text-sm">
            <ArrowRight className="w-4 h-4" />
            الرئيسية
          </button>
        </div>

        {/* Nav tabs */}
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'users', label: 'الأهالي', icon: <Users className="w-4 h-4" /> },
            { id: 'children', label: 'البطلات', icon: <Star className="w-4 h-4" /> },
            { id: 'logs', label: 'السجلات', icon: <Activity className="w-4 h-4" /> },
            { id: 'ideas', label: 'أفكار', icon: <Lightbulb className="w-4 h-4" />, badge: ideas.filter(i => i.status === 'new').length },
            { id: 'chats', label: 'محادثات', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'safety', label: 'الأمان', icon: <AlertTriangle className="w-4 h-4" />, badge: safetyReports.filter(r => r.status === 'new').length, danger: true },
            { id: 'settings', label: 'الإعدادات', icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all shrink-0 ${
                activeTab === tab.id
                  ? tab.danger ? 'bg-red-600 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {(tab.badge ?? 0) > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <Users className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-slate-500 text-xs">أولياء الأمور</p>
            <p className="text-2xl font-black text-slate-800">{parents.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <Star className="w-8 h-8 text-amber-500 mb-2" />
            <p className="text-slate-500 text-xs">البطلات</p>
            <p className="text-2xl font-black text-slate-800">{allChildren.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <Activity className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="text-slate-500 text-xs">السجلات</p>
            <p className="text-2xl font-black text-slate-800">{logs.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <Database className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-slate-500 text-xs">البريد</p>
            <div className={`flex items-center gap-2 mt-1 text-sm font-bold ${mailStatus === 'connected' ? 'text-emerald-600' : mailStatus === 'disconnected' ? 'text-red-500' : 'text-slate-400'}`}>
              {mailStatus === 'connected' ? <CheckCircle className="w-4 h-4" /> : mailStatus === 'disconnected' ? <XCircle className="w-4 h-4" /> : null}
              {mailStatus === 'connected' ? 'متصل' : mailStatus === 'disconnected' ? 'غير متصل' : 'جاري التحقق'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

          {/* ── Users Tab ── */}
          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-4">أولياء الأمور</h2>
              <div className="space-y-3">
                {parents.map((parent) => (
                  <div key={parent.uid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <div className="font-black text-slate-800">{parent.displayName || parent.email}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {parent.email}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {parent.role}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full font-bold bg-slate-200 text-slate-500">
                        ولي أمر
                      </span>
                    </div>
                  </div>
                ))}
                {parents.length === 0 && (
                  <div className="text-center py-12 text-slate-400">لا يوجد أولياء أمور مسجلون</div>
                )}
              </div>
            </div>
          )}

          {/* ── Children Tab ── */}
          {activeTab === 'children' && (
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-4">البطلات</h2>
              <div className="space-y-3">
                {allChildren.map((child) => (
                  <div key={child.uid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <div className="font-black text-slate-800">{child.heroName || child.name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <School className="w-3 h-3" />
                        {child.ageGroup || 'غير محدد'}
                        {child.city && <><MapPin className="w-3 h-3" /> {child.city}</>}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Lock className="w-3 h-3" />
                        PIN: {child.pin}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        child.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                        : child.status === 'pending' ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {child.status === 'approved' ? 'معتمدة' : child.status === 'pending' ? 'بانتظار' : 'موقوفة'}
                      </span>
                      {child.status === 'pending' && (
                        <button
                          onClick={() => handleApproveChild(child)}
                          className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold hover:bg-emerald-600"
                        >
                          <CheckCircle className="w-3 h-3 inline ml-1" />
                          اعتمادي
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteChild(child.uid)}
                        className="bg-red-100 text-red-600 text-xs px-2 py-1.5 rounded-xl font-bold hover:bg-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {allChildren.length === 0 && (
                  <div className="text-center py-12 text-slate-400">لا توجد بطلات مسجلات</div>
                )}
              </div>
            </div>
          )}

          {/* ── Logs Tab ── */}
          {activeTab === 'logs' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-slate-800">سجل الأنشطة</h2>
                <div className="flex gap-2">
                  {(['all', 'success', 'failed'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setLogStatusFilter(f)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold ${logStatusFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {f === 'all' ? 'الكل' : f === 'success' ? 'ناجح' : 'فاشل'}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? (
                <div className="text-center py-12 text-slate-400">جاري التحميل...</div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                      <div>
                        <div className="font-bold text-slate-700">{log.message}</div>
                        <div className="text-xs text-slate-400">{log.childName || log.childId}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {log.status === 'success' ? 'ناجح' : 'فاشل'}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                      </div>
                    </div>
                  ))}
                  {filteredLogs.length === 0 && (
                    <div className="text-center py-12 text-slate-400">لا توجد سجلات</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Ideas Tab ── */}
          {activeTab === 'ideas' && (
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-4">أفكار البطلات</h2>
              <div className="space-y-3">
                {ideas.map((idea) => (
                  <div key={idea.id} className="p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-black text-slate-800">{idea.childName}</div>
                        <div className="text-sm text-slate-600 mt-1">{idea.idea}</div>
                        <div className="text-xs text-slate-400 mt-1">{idea.childName} — {new Date(idea.createdAt).toLocaleDateString('ar-EG')}</div>
                      </div>
                      <div className="flex gap-2 mr-3">
                        {idea.status === 'new' && (
                          <button
                            onClick={async () => {
                              await updateDoc(doc(db, 'feature_ideas', idea.id), { status: 'reviewed' });
                              toast.success('تم التحديث');
                            }}
                            className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl font-bold"
                          >
                            مراجعة
                          </button>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${idea.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {idea.status === 'new' ? 'جديدة' : 'تمت المراجعة'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {ideas.length === 0 && (
                  <div className="text-center py-12 text-slate-400">لا توجد أفكار بعد</div>
                )}
              </div>
            </div>
          )}

          {/* ── Chats Tab ── */}
          {activeTab === 'chats' && (
            <div className="flex h-[600px]">
              <div className="w-64 border-l border-slate-200 overflow-y-auto shrink-0">
                <div className="p-3 border-b border-slate-100">
                  <p className="font-black text-sm text-slate-700">محادثات المساعد</p>
                </div>
                {allChildren.map((child) => {
                  const childChats = ideaChats.filter(c => c.childId === child.uid);
                  if (childChats.length === 0) return null;
                  return (
                    <button
                      key={child.uid}
                      onClick={() => setSelectedChatChild(child.uid)}
                      className={`w-full text-right px-4 py-3 flex items-center gap-2 hover:bg-slate-50 transition-colors ${selectedChatChild === child.uid ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''}`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0">
                        {(child.heroName || child.name).slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-700 truncate">{child.heroName || child.name}</div>
                        <div className="text-xs text-slate-400">{childChats.length} رسالة</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex-1 flex flex-col">
                {selectedChatChild ? (
                  <>
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <p className="font-black text-slate-700">
                        {allChildren.find(c => c.uid === selectedChatChild)?.heroName || 'البطلة'}
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {ideaChats
                        .filter(c => c.childId === selectedChatChild)
                        .sort((a, b) => a.createdAt - b.createdAt)
                        .map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                              msg.role === 'user'
                                ? 'bg-indigo-500 text-white rounded-tl-none'
                                : 'bg-white border border-slate-200 text-slate-700 rounded-tr-none shadow-sm'
                            }`}>
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
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
                    <p>اختر بطلة لعرض محادثتها</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Safety Tab ── */}
          {activeTab === 'safety' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800">بلاغات الأمان 🛡️</h2>
                  <p className="text-slate-500 text-sm">متابعة سريعة لبلاغات الأطفال</p>
                </div>
              </div>
              <div className="space-y-3">
                {safetyReports.map((report) => (
                  <div key={report.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-800">بلاغ من: {report.reporterName}</div>
                      <div className="text-sm text-slate-500">زيارة: {report.visitId}</div>
                      <div className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleString('ar-EG')}</div>
                    </div>
                    <button
                      onClick={async () => {
                        await updateDoc(doc(db, 'safety_reports', report.id), { status: 'resolved', resolvedAt: Date.now() });
                        toast.success('تم إغلاق البلاغ');
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold ${report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {report.status === 'resolved' ? 'تم الحل' : 'وضع كمحلول'}
                    </button>
                  </div>
                ))}
                {safetyReports.length === 0 && (
                  <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-dashed border-slate-300">
                    لا توجد بلاغات أمان حالياً ✨
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Settings Tab ── */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-xl font-black text-slate-800 mb-4">الإعدادات</h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        اختبار البريد الإلكتروني
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">
                        حالة الخادم: {' '}
                        <span className={mailStatus === 'connected' ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                          {mailStatus === 'connected' ? 'متصل ✓' : mailStatus === 'disconnected' ? 'غير متصل ✗' : 'جاري التحقق...'}
                        </span>
                      </div>
                      {mailError && <div className="text-xs text-red-400 mt-1">{mailError}</div>}
                    </div>
                    <button
                      onClick={handleSendTestMail}
                      disabled={isSendingTest}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSendingTest ? 'جاري الإرسال...' : 'إرسال بريد تجريبي'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
