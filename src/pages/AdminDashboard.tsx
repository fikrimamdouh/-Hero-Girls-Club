import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Users, MessageSquare, Activity, Settings, Database, Trash2, CheckCircle, XCircle, Star, Mail, Phone, MapPin, School, Lock, ArrowRight, Lightbulb } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'users' | 'children' | 'logs' | 'settings' | 'ideas' | 'chats'>('users');
  const [activeTab, setActiveTab] = useState<'users' | 'children' | 'logs' | 'settings' | 'ideas' | 'chats' | 'safety'>('users');
  const [selectedChatChild, setSelectedChatChild] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [safetyReports, setSafetyReports] = useState<any[]>([]);

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

    const qSafety = query(collection(db, 'safety_reports'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribeSafety = onSnapshot(qSafety, (snapshot) => {
      setSafetyReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'safety_reports'));

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
      unsubscribeSafety();
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
@@ -240,50 +247,60 @@ export default function AdminDashboard() {
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
          <button 
            onClick={() => setActiveTab('safety')}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'safety' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <AlertTriangle className="w-4 h-4" />
            بلاغات الأمان
            {safetyReports.filter(r => r.status === 'new').length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{safetyReports.filter(r => r.status === 'new').length}</span>
            )}
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
@@ -629,30 +646,66 @@ export default function AdminDashboard() {
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

          {activeTab === 'safety' && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">بلاغات الأمان 🛡️</h2>
                  <p className="text-slate-500">متابعة سريعة لبلاغات الأطفال داخل الزيارات</p>
                </div>
              </div>
              <div className="space-y-4">
                {safetyReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
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
        </div>
      </main>
    </div>
  );
}
