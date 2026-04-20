import { useMemo, useState } from 'react';
import { Medal, Star } from 'lucide-react';
import KidsPageLayout from '../components/kids/KidsPageLayout';
import { badgeCards, shopItems } from '../data/kidsUniverse';
import { loadKidsProgress } from '../lib/kidsProgress';

const avatars = ['👧', '🧚‍♀️', '👸', '🦸‍♀️', '🧜‍♀️', '🐱'];

export default function KidsProfilePage() {
  const progress = loadKidsProgress();
  const [avatar, setAvatar] = useState(avatars[0]);
  const [name, setName] = useState('بطلة النجوم');
  const [level] = useState(progress.level);
  const [stars] = useState(progress.stars);
  const nextMilestone = useMemo(() => Math.max(0, level * 120 - stars), [stars, level]);
  const equippedItem = shopItems.find((item) => item.id === progress.equippedItem);

  return (
    <KidsPageLayout title="ملفي السحري" subtitle="هوية موحّدة وتجربة متناسقة" emoji="👧" tone="from-rose-50 to-pink-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border-2 border-rose-100 shadow text-center">
          <div className="text-7xl mb-3">{avatar}</div>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-rose-200 rounded-xl p-2 text-center font-bold" />
          <p className="mt-4 font-bold text-slate-700">المستوى {level}</p>
          <p className="font-bold text-amber-600 inline-flex items-center gap-1"><Star className="w-4 h-4 star-glow" /> {stars} نجمة</p>
          <p className="mt-2 text-sm font-bold text-fuchsia-600">العنصر المُجهز: {equippedItem?.emoji || '✨'} {equippedItem?.name || 'افتراضي'}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border-2 border-rose-100 shadow lg:col-span-2">
          <h3 className="text-xl font-black text-rose-700 mb-4">اختاري الأفاتار</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">{avatars.map((item) => <button key={item} onClick={() => setAvatar(item)} className={`text-4xl rounded-2xl p-3 border ${avatar === item ? 'bg-rose-100 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>{item}</button>)}</div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5"><p className="font-bold text-amber-700">متبقي {nextMilestone} نجمة للوصول إلى المستوى التالي!</p></div>
          <h4 className="font-black text-slate-800 mb-3 inline-flex items-center gap-2"><Medal className='w-4 h-4' /> آخر الشارات</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{badgeCards.slice(0, 4).map((badge) => <div key={badge.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3"><p className="font-bold">{badge.emoji} {badge.name}</p><p className="text-xs text-slate-500">{badge.requirement}</p></div>)}</div>
        </div>
      </div>
    </KidsPageLayout>
  );
}
