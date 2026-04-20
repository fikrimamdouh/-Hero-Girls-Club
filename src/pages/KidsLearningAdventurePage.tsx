import { useState } from 'react';
import { BookOpen, FlaskConical, Calculator, Globe, Star, ArrowLeft, CheckCircle2, Play, PawPrint } from 'lucide-react';
import KidsPageLayout from '../components/kids/KidsPageLayout';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { VIDEOS } from '../data/videoData';

const lessons = [
  { id: 'math', title: 'رحلة الأرقام', icon: <Calculator className='w-6 h-6' />, color: 'bg-blue-500', tone: 'blue', subcat: 'math' },
  { id: 'science', title: 'مختبر العلوم', icon: <FlaskConical className='w-6 h-6' />, color: 'bg-emerald-500', tone: 'emerald', subcat: 'science' },
  { id: 'letters', title: 'مفردات وحكايات', icon: <BookOpen className='w-6 h-6' />, color: 'bg-purple-500', tone: 'purple', subcat: 'letters' },
  { id: 'world', title: 'اكتشاف العالم', icon: <Globe className='w-6 h-6' />, color: 'bg-amber-500', tone: 'amber', subcat: 'world' },
  { id: 'animals', title: 'مملكة الحيوان', icon: <PawPrint className='w-6 h-6' />, color: 'bg-orange-500', tone: 'orange', subcat: 'animals' }
];

export default function KidsLearningAdventurePage() {
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const currentLesson = lessons.find(l => l.id === activeLesson);
  const lessonVideo =
    VIDEOS.find(v => v.category === 'educational' && v.subcategory === currentLesson?.subcat) ??
    VIDEOS.find(v => v.category === 'educational');

  const renderMath = () => (
    <div className="text-center space-y-8">
      <h3 className="text-3xl font-black text-blue-900">هيا نعد النجوم! ⭐</h3>
      <div className="flex flex-wrap justify-center gap-4 min-h-[120px] p-6 bg-blue-50 rounded-3xl border-2 border-dashed border-blue-200">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div 
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-4xl"
          >
            ⭐
          </motion.div>
        ))}
        {count === 0 && <p className="text-blue-400 font-bold self-center">اضغطي على الزر لإضافة النجوم</p>}
      </div>
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => {
            setCount(prev => Math.min(prev + 1, 20));
            if (count < 20) {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
              audio.play().catch(() => {});
            }
          }}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          أضيفي نجمة (+1)
        </button>
        <button 
          onClick={() => setCount(0)}
          className="bg-white text-blue-600 border-2 border-blue-200 px-8 py-4 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all"
        >
          البدء من جديد
        </button>
      </div>
      <p className="text-2xl font-black text-blue-700">العدد الآن: {count}</p>
      {count === 10 && <motion.div animate={{ scale: [1, 1.2, 1] }} className="text-xl font-black text-emerald-600">رائع! لقد وصلتِ للرقم 10! 🎉</motion.div>}
    </div>
  );

  const renderScience = () => (
    <div className="space-y-6">
      <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-4 border-emerald-100 text-center">
        <FlaskConical className="w-20 h-20 text-emerald-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-2xl font-black text-emerald-900 mb-4">تجربة الألوان السحرية</h3>
        <p className="text-emerald-700 font-bold text-lg leading-relaxed">
          هل تعلمين ماذا يحدث عندما نخلط اللون الأزرق مع الأصفر؟
        </p>
        <div className="flex justify-center items-center gap-4 my-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full shadow-lg" />
          <span className="text-4xl font-black text-emerald-300">+</span>
          <div className="w-16 h-16 bg-yellow-400 rounded-full shadow-lg" />
          <span className="text-4xl font-black text-emerald-300">=</span>
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            className="w-20 h-20 bg-green-500 rounded-full shadow-xl border-4 border-white flex items-center justify-center text-white font-black"
          >
            أخضر!
          </motion.div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-emerald-100 text-emerald-600 font-bold">
          💡 الضوء الأبيض يتكون من جميع ألوان قوس قزح!
        </div>
      </div>
    </div>
  );

  const renderAnimals = () => (
    <div className="text-center space-y-6">
      <PawPrint className="w-20 h-20 text-orange-500 mx-auto mb-4" />
      <h3 className="text-3xl font-black text-orange-900">مملكة الحيوانات العجيبة</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: 'أسد 🦁', sound: 'زئير' },
          { name: 'فيل 🐘', sound: 'نفير' },
          { name: 'زرافة 🦒', sound: 'هادئة' },
          { name: 'قرد 🐒', sound: 'ضحك' }
        ].map(animal => (
          <motion.div 
            key={animal.name}
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-orange-50 rounded-2xl border-2 border-orange-100"
          >
            <div className="text-4xl mb-2">{animal.name.split(' ')[1]}</div>
            <div className="font-black text-orange-700">{animal.name.split(' ')[0]}</div>
            <div className="text-xs text-orange-400 font-bold mt-1">صوته: {animal.sound}</div>
          </motion.div>
        ))}
      </div>
      <p className="text-slate-600 font-bold text-lg mt-8">الحيوانات أصدقاؤنا، يجب أن نعطف عليها ونطعمها! ❤️</p>
    </div>
  );

  return (
    <KidsPageLayout title="مغامرات التعلم" subtitle="تعلم ممتع باللعب والتجربة" emoji="🚀" tone="from-emerald-50 to-cyan-50">
      <AnimatePresence mode="wait">
        {!activeLesson ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {lessons.map((lesson) => (
              <button 
                key={lesson.id}
                onClick={() => setActiveLesson(lesson.id)}
                className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:border-emerald-200 transition-all text-right group relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-24 h-24 ${lesson.color} opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform`} />
                <div className={`w-14 h-14 ${lesson.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform`}>
                  {lesson.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{lesson.title}</h3>
                <p className="text-slate-500 font-bold text-sm">اضغطي هنا لبدء المغامرة التعليمية الممتعة!</p>
                <div className="mt-6 flex items-center gap-2 text-emerald-600 font-black text-xs">
                  <span>ابدأ الآن</span>
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="lesson"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-[3rem] p-8 md:p-12 border-4 border-emerald-100 shadow-2xl relative"
          >
            <button 
              onClick={() => {
                setActiveLesson(null);
                setShowVideo(false);
              }}
              className="absolute top-6 left-6 p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all z-10"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="mb-12">
              {activeLesson === 'math' && renderMath()}
              {activeLesson === 'science' && renderScience()}
              {activeLesson === 'animals' && renderAnimals()}
              {activeLesson === 'letters' && (
                <div className="text-center space-y-6">
                  <BookOpen className="w-20 h-20 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-3xl font-black text-purple-900">كلمات اليوم السحرية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['شمس ☀️', 'قمر 🌙', 'نجمة ⭐'].map(word => (
                      <div key={word} className="p-6 bg-purple-50 rounded-2xl border-2 border-purple-100 text-2xl font-black text-purple-700">
                        {word}
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-600 font-bold text-lg mt-8">حاولي كتابة هذه الكلمات في دفتركِ الجميل!</p>
                </div>
              )}
              {activeLesson === 'world' && (
                <div className="text-center space-y-6">
                  <Globe className="w-20 h-20 text-amber-500 mx-auto mb-4 animate-spin-slow" />
                  <h3 className="text-3xl font-black text-amber-900">أين نعيش؟</h3>
                  <div className="p-8 bg-amber-50 rounded-[2.5rem] border-4 border-amber-100">
                    <p className="text-xl font-bold text-amber-800 leading-relaxed">
                      نحن نعيش على كوكب الأرض الجميل، وهو الكوكب الوحيد الذي فيه حياة ونباتات وحيوانات وبشر.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                      <div className="px-6 py-3 bg-white rounded-full shadow text-amber-600 font-black">7 قارات 🌍</div>
                      <div className="px-6 py-3 bg-white rounded-full shadow text-amber-600 font-black">5 محيطات 🌊</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Lesson Integration */}
            {lessonVideo && (
              <div className="mt-12 border-t-4 border-slate-50 pt-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                  <div className="text-right">
                    <h4 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                      <Play className="w-6 h-6 text-red-500 fill-current" />
                      شاهدي وتعلمي
                    </h4>
                    <p className="text-slate-500 font-bold mt-1">فيديو تعليمي ممتع عن {currentLesson?.title}</p>
                  </div>
                  {!showVideo && (
                    <button 
                      onClick={() => setShowVideo(true)}
                      className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-red-600 transition-all flex items-center gap-2"
                    >
                      شغل الفيديو الآن
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showVideo ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="aspect-video w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white"
                    >
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${lessonVideo.youtubeId}?autoplay=1`}
                        title={lessonVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </motion.div>
                  ) : (
                    <div 
                      className="aspect-video w-full rounded-[2rem] bg-slate-100 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
                      onClick={() => setShowVideo(true)}
                    >
                      <img 
                        src={lessonVideo.thumbnail} 
                        alt={lessonVideo.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="w-10 h-10 text-red-500 fill-current ml-1" />
                        </div>
                        <p className="mt-4 text-white font-black text-xl drop-shadow-lg">{lessonVideo.title}</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </KidsPageLayout>
  );
}
