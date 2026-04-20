import { Clock3, Home, Star, Sparkles, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import KidsPageLayout from '../components/kids/KidsPageLayout';
import { homeActivities } from '../data/kidsUniverse';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function KidsHomeActivitiesPage() {
  const [completed, setCompleted] = useState<string[]>([]);

  const handleComplete = (id: string) => {
    if (completed.includes(id)) return;
    setCompleted(prev => [...prev, id]);
    toast.success('رائع! استمتعي بوقتك مع عائلتك! 🏠✨');
  };

  return (
    <KidsPageLayout title="أنشطة المنزل" subtitle="فعاليات ممتعة ومغامرات عائلية في البيت" emoji="🏠" tone="from-indigo-50 to-violet-50">
      <div className="max-w-6xl mx-auto">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] p-8 md:p-12 text-white mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 p-8 opacity-10">
            <Users className="w-64 h-64" />
          </div>
          <div className="relative z-10 text-center md:text-right">
            <h2 className="text-3xl md:text-4xl font-black mb-4">وقت العائلة السحري!</h2>
            <p className="text-indigo-100 text-lg font-bold max-w-2xl leading-relaxed">
              هنا تجدين أفكاراً رائعة لتستمتعي بها مع والديكِ وإخوتكِ بعيداً عن الشاشات. 
              اصنعي، العبي، واكتشفي في منزلكِ الجميل!
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {homeActivities.map((activity, idx) => {
            const isDone = completed.includes(activity.id);
            return (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`group bg-white rounded-[2.5rem] overflow-hidden border-4 transition-all ${
                  isDone ? 'border-emerald-100' : 'border-indigo-50 hover:border-indigo-200 shadow-xl'
                }`}
              >
                {/* Activity Header Icon/Color */}
                <div className={`h-32 flex items-center justify-center text-5xl ${
                  idx % 3 === 0 ? 'bg-indigo-100' : idx % 3 === 1 ? 'bg-purple-100' : 'bg-pink-100'
                }`}>
                  {idx % 3 === 0 ? '🎨' : idx % 3 === 1 ? '🧪' : '🍪'}
                </div>

                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-slate-900">{activity.title}</h3>
                    <div className="flex items-center gap-1 text-indigo-500 font-bold text-sm">
                      <Clock3 className="w-4 h-4" />
                      {activity.duration}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-wider mb-3">الأدوات المطلوبة</p>
                      <div className="flex flex-wrap gap-2">
                        {activity.items.map((item) => (
                          <span key={item} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-wider mb-3">كيف نبدأ؟</p>
                      <ul className="space-y-3">
                        {activity.steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex gap-3 text-sm font-bold text-slate-600 leading-relaxed">
                            <span className="flex-shrink-0 w-5 h-5 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-[10px] font-black">
                              {sIdx + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleComplete(activity.id)}
                    className={`w-full mt-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                      isDone 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        تم الاستمتاع!
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        سأجربها الآن!
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Share Section */}
        <div className="mt-16 bg-white rounded-[3rem] p-10 border-4 border-dashed border-indigo-100 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-black text-indigo-900 mb-2">هل لديكِ فكرة لنشاط منزلي؟</h3>
          <p className="text-slate-500 font-bold mb-8">شاركينا أفكاركِ المبدعة لنضيفها في المنصة!</p>
          <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all">
            أرسلي فكرتكِ
          </button>
        </div>
      </div>
    </KidsPageLayout>
  );
}
