import { GiCastle, GiCrystalGrowth, GiFairyWings, GiPalette } from 'react-icons/gi';
import { HiSparkles, HiShieldCheck } from 'react-icons/hi2';

const FEATURES = [
  { icon: HiShieldCheck, label: 'بيئة آمنة', sub: 'مراقبة من ولي الأمر', color: 'from-emerald-400 to-teal-500' },
  { icon: GiCastle, label: 'عالم متكامل', sub: 'ألعاب وأنشطة وقصص', color: 'from-pink-400 to-fuchsia-500' },
  { icon: GiPalette, label: 'إبداع وفن', sub: 'تلوين ورسم وتصميم', color: 'from-amber-400 to-orange-500' },
  { icon: GiFairyWings, label: 'شخصية بطلة', sub: 'كل بنت لها هويتها', color: 'from-rose-300 to-fuchsia-500' },
  { icon: GiCrystalGrowth, label: 'نمو حقيقي', sub: 'نقاط ومستويات وجوائز', color: 'from-sky-400 to-rose-400' },
  { icon: HiSparkles, label: 'مرح وتعلّم', sub: 'محتوى عربي مميز', color: 'from-rose-400 to-pink-500' },
];

export default function FeatureStrip() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-6">
      {FEATURES.map(({ icon: Icon, label, sub, color }) => (
        <div
          key={label}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/8 p-3 text-center backdrop-blur-md transition-all hover:border-white/25 hover:bg-white/12 sm:p-4"
        >
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg transition-transform group-hover:scale-110 sm:h-12 sm:w-12`}
          >
            <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
          </div>
          <div>
            <div className="font-arabic text-[11px] font-extrabold text-white sm:text-xs">{label}</div>
            <div className="font-arabic text-[9px] leading-4 text-white/55 sm:text-[10px]">{sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
