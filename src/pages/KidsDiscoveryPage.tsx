import { useState } from 'react';
import { Shuffle, Sparkles, Globe, Rocket, Info } from 'lucide-react';
import KidsPageLayout from '../components/kids/KidsPageLayout';
import { discoveryFacts, animalWorld, spaceFacts } from '../data/kidsUniverse';
import { motion, AnimatePresence } from 'motion/react';

export default function KidsDiscoveryPage() {
  const [factIndex, setFactIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<'facts' | 'animals' | 'space'>('facts');

  return (
    <KidsPageLayout title="ركن الاكتشاف" subtitle="استكشفي أسرار العالم والفضاء" emoji="🔍" tone="from-lime-50 to-green-50">
      {/* Section Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button 
          onClick={() => setActiveSection('facts')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${activeSection === 'facts' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-green-700 border-2 border-green-100 hover:bg-green-50'}`}
        >
          <Sparkles className="w-5 h-5" />
          حقائق مدهشة
        </button>
        <button 
          onClick={() => setActiveSection('animals')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${activeSection === 'animals' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-amber-700 border-2 border-amber-100 hover:bg-amber-50'}`}
        >
          <Globe className="w-5 h-5" />
          عالم الحيوان
        </button>
        <button 
          onClick={() => setActiveSection('space')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${activeSection === 'space' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-700 border-2 border-indigo-100 hover:bg-indigo-50'}`}
        >
          <Rocket className="w-5 h-5" />
          أسرار الفضاء
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'facts' && (
          <motion.div 
            key="facts"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-[2.5rem] p-10 border-4 border-lime-200 shadow-xl text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 text-lime-100">
              <Sparkles className="w-20 h-20" />
            </div>
            <p className="text-2xl md:text-4xl font-black text-green-700 leading-relaxed relative z-10">
              {discoveryFacts[factIndex]}
            </p>
            <button 
              onClick={() => setFactIndex((prev) => (prev + 1) % discoveryFacts.length)} 
              className="mt-10 inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-green-600 text-white font-black text-lg hover:bg-green-700 shadow-lg hover:scale-105 transition-all"
            >
              <Shuffle className='w-6 h-6' /> 
              حقيقة جديدة
            </button>
          </motion.div>
        )}

        {activeSection === 'animals' && (
          <motion.div 
            key="animals"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {animalWorld.map((animal, i) => (
              <motion.div 
                key={animal.name}
                whileHover={{ y: -10 }}
                className="bg-white p-6 rounded-[2rem] border-2 border-amber-100 shadow-lg text-center group"
              >
                <div className="text-6xl mb-4 group-hover:scale-125 transition-transform">{animal.emoji}</div>
                <h3 className="text-2xl font-black text-amber-900 mb-2">{animal.name}</h3>
                <div className="inline-block px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm font-bold mb-4">
                  صوته: {animal.sound}
                </div>
                <p className="text-slate-600 font-bold leading-relaxed">
                  {animal.fact}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeSection === 'space' && (
          <motion.div 
            key="space"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {spaceFacts.map((item) => (
              <div key={item.title} className="bg-indigo-900 text-white p-8 rounded-[2.5rem] border-4 border-indigo-700 shadow-2xl flex items-center gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
                <div className="text-6xl relative z-10">{item.emoji}</div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-2 text-indigo-200">{item.title}</h3>
                  <p className="text-indigo-100 font-bold leading-relaxed">{item.fact}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 p-6 bg-white/50 rounded-3xl border-2 border-dashed border-green-200 text-center">
        <p className="text-green-800 font-bold flex items-center justify-center gap-2">
          <Info className="w-5 h-5" />
          هل تعلمين أن الفضول هو أول خطوة لتصبحي عالمة كبيرة؟ استمري في الاكتشاف!
        </p>
      </div>
    </KidsPageLayout>
  );
}
