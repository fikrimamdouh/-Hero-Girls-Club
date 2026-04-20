import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Compass, Sparkles, Star } from 'lucide-react';
import SectionHeader from '../components/kids/SectionHeader';
import ZoneCard from '../components/kids/ZoneCard';
import { universeZones } from '../data/kidsUniverse';
import { loadKidsProgress } from '../lib/kidsProgress';

export default function KidsWorldPage() {
  const progress = loadKidsProgress();
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-sky-50 to-violet-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-xl border border-pink-100 shadow-sm hover:bg-pink-50"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <SectionHeader title="عالم الأطفال الكبير" subtitle="مدينة مليئة بالمغامرات والضحك والتعلم" emoji="🌈" />
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-sky-100 flex items-center gap-3">
            <Compass className="w-6 h-6 text-sky-500" />
            <div>
              <p className="font-black text-slate-800">{universeZones.length} مناطق للاستكشاف</p>
              <p className="text-sm text-slate-500">كل منطقة تجربة مختلفة</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-fuchsia-100 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-fuchsia-500" />
            <div>
              <p className="font-black text-slate-800">فعاليات يومية</p>
              <p className="text-sm text-slate-500">سلسلة الحضور: {progress.streakDays} يوم</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-amber-100 flex items-center gap-3">
            <Star className="w-6 h-6 text-amber-500 star-glow" />
            <div>
              <p className="font-black text-slate-800">جوائز وشارات</p>
              <p className="text-sm text-slate-500">نجومك الحالية: {progress.stars}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {universeZones.map((zone, idx) => (
            <ZoneCard key={zone.id} zone={zone} delay={idx * 0.05} />
          ))}
        </div>
      </div>
    </div>
  );
}
