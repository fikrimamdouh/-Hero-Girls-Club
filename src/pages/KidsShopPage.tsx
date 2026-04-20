import { useMemo, useState } from 'react';
import { Coins, ShoppingBag, CheckCircle2 } from 'lucide-react';
import KidsPageLayout from '../components/kids/KidsPageLayout';
import { shopItems } from '../data/kidsUniverse';
import { buyItem, equipItem, loadKidsProgress, saveKidsProgress } from '../lib/kidsProgress';

export default function KidsShopPage() {
  const [progress, setProgress] = useState(loadKidsProgress());
  const grouped = useMemo(() => ({
    wand: shopItems.filter((i) => i.category === 'wand'),
    crown: shopItems.filter((i) => i.category === 'crown'),
    wings: shopItems.filter((i) => i.category === 'wings')
  }), []);

  const onBuy = (itemId: string, cost: number) => { const next = buyItem(progress, itemId, cost); setProgress(next); saveKidsProgress(next); };
  const onEquip = (itemId: string) => { const next = equipItem(progress, itemId); setProgress(next); saveKidsProgress(next); };

  const renderSection = (title: string, items: typeof shopItems) => (
    <div className="bg-white rounded-3xl p-5 border-2 border-amber-100 shadow">
      <h3 className="text-xl font-black text-amber-700 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const unlocked = progress.unlockedItems.includes(item.id);
          const equipped = progress.equippedItem === item.id;
          return <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xl font-black">{item.emoji} {item.name}</p>
            <p className="text-sm text-slate-500 mb-2">السعر: {item.cost} عملة</p>
            {!unlocked ? (
              <button disabled={progress.coins < item.cost} onClick={() => onBuy(item.id, item.cost)} className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold disabled:opacity-50">شراء</button>
            ) : (
              <button onClick={() => onEquip(item.id)} className={`px-3 py-2 rounded-xl font-bold ${equipped ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {equipped ? <span className='inline-flex items-center gap-1'><CheckCircle2 className='w-4 h-4' /> مُجهز</span> : 'تجهيز'}
              </button>
            )}
          </div>;
        })}
      </div>
    </div>
  );

  return (
    <KidsPageLayout title="متجر النجوم" subtitle="نظام أيقونات موحّد لكل الأقسام" emoji="🛍️" tone="from-yellow-50 to-orange-50">
      <div className="mb-6 bg-white rounded-2xl border border-yellow-200 p-4 inline-flex gap-4 items-center font-black text-amber-700">
        <span className='inline-flex items-center gap-1'><Coins className='w-4 h-4' /> العملات: {progress.coins}</span>
        <span className='inline-flex items-center gap-1'><ShoppingBag className='w-4 h-4' /> العناصر المفتوحة: {progress.unlockedItems.length}</span>
      </div>
      <div className="grid gap-5">{renderSection('العصي السحرية', grouped.wand)}{renderSection('التيجان', grouped.crown)}{renderSection('الأجنحة', grouped.wings)}</div>
    </KidsPageLayout>
  );
}
