import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Home, MessageCircle, Users, Sparkles, Shield, Star } from 'lucide-react';

export default function VillageView() {
  const navigate = useNavigate();
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);

  const houses = [
    { id: 'house-1', name: 'بيت مريم', emoji: '🏠', color: 'from-fuchsia-500/30 to-pink-500/20' },
    { id: 'house-2', name: 'بيت سارة', emoji: '🏡', color: 'from-sky-500/30 to-cyan-500/20' },
    { id: 'house-3', name: 'بيت ليان', emoji: '🏘️', color: 'from-amber-500/30 to-orange-500/20' },
    { id: 'house-4', name: 'بيت نور', emoji: '🌷', color: 'from-violet-500/30 to-indigo-500/20' },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-fuchsia-950 via-violet-950 to-indigo-950 text-white">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/child')} className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 border border-white/15">
            <ArrowLeft className="w-4 h-4" />
            العودة
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-300/30 flex items-center justify-center">
              <Home className="w-6 h-6 text-fuchsia-200" />
            </div>
            <div className="text-right">
              <h1 className="font-black">مدينة البطلات</h1>
              <p className="text-xs text-white/70">هيكل المدينة التفاعلية للأطفال</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-[2rem] bg-white/10 border border-white/15 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h2 className="font-black text-xl">المدينة الآن</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {houses.map((house) => (
                <motion.button
                  key={house.id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelectedHouse(house.id)}
                  className={`rounded-[1.75rem] p-4 text-right bg-gradient-to-br ${house.color} border border-white/10`}
                >
                  <div className="text-4xl mb-3">{house.emoji}</div>
                  <div className="font-black">{house.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/10 border border-white/15 backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-300" />
              <h2 className="font-black">أمان الأطفال</h2>
            </div>
            <p className="text-sm text-white/75 leading-7">المرحلة الحالية تعرض الهيكل فقط، مع عزل آمن وواجهة RTL دون تفعيل الفيديو أو الصوت.</p>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Users className="w-4 h-4" />
              دخول وخروج الأطفال
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <MessageCircle className="w-4 h-4" />
              دردشة نصية آمنة
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Star className="w-4 h-4" />
              سجل محفوظ داخل Firestore
            </div>
          </div>
        </section>

        <section className="rounded-[2.25rem] bg-white/10 border border-white/15 backdrop-blur-xl p-6">
          <h2 className="font-black text-xl mb-4">بيت الطفلة المختار</h2>
          <div className="min-h-[260px] rounded-[2rem] bg-black/20 border border-white/10 flex items-center justify-center text-center p-6">
            {selectedHouse ? (
              <div>
                <div className="text-6xl mb-3">🏠</div>
                <div className="font-black text-2xl">تم اختيار {houses.find((h) => h.id === selectedHouse)?.name}</div>
                <p className="text-white/70 mt-2">هنا لاحقًا يتم استقبال طفلة أخرى داخل البيت والدردشة النصية فقط.</p>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-3">✨</div>
                <div className="font-black text-2xl">اختاري بيتًا للبدء</div>
                <p className="text-white/70 mt-2">سيُبنى هنا نظام المدينة والبيوت خطوة بخطوة.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}