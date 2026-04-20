import { Scissors, Sparkles } from 'lucide-react';
import KidsPageLayout from '../components/kids/KidsPageLayout';

const creativeIdeas = [
  { title: 'بطاقة شكر يدوية', details: 'استخدمي ورقًا ملونًا ورسمي قلبًا واكتبي رسالة امتنان.' },
  { title: 'قناع بطلة خارقة', details: 'قصي ورقة بشكل قناع ولونيها بالألوان المفضلة لديك.' },
  { title: 'صندوق الذكريات الصغيرة', details: 'احتفظي برسمة أو صورة جميلة كل يوم داخل صندوق.' },
  { title: 'حديقة ورقية', details: 'اصنعي زهورًا ورقية ورتبيها في لوحة حائط رائعة.' }
];

export default function KidsCreativeCornerPage() {
  return (
    <KidsPageLayout title="ركن الإبداع" subtitle="أنشطة فنية وأشغال يدوية" emoji="🎨" tone="from-pink-50 to-rose-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {creativeIdeas.map((idea) => (
          <div key={idea.title} className="bg-white rounded-3xl p-5 border-2 border-rose-100 shadow">
            <h3 className="text-xl font-black text-rose-700 mb-2">{idea.title}</h3>
            <p className="text-slate-600 mb-4">{idea.details}</p>
            <div className="flex items-center gap-2 text-rose-600 font-bold"><Scissors className="w-4 h-4" /> نشاط يدوي ممتع</div>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white rounded-3xl p-6 border-2 border-pink-100">
        <h4 className="text-2xl font-black text-pink-700 mb-2">مهمة الإبداع الكبرى</h4>
        <p className="text-slate-700">اختاري فكرة من الأعلى وأضيفي لمستك الخاصة ثم شاركيها مع العائلة.</p>
        <p className="mt-3 text-pink-700 font-semibold inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> كل فكرة صغيرة ممكن تصبح إبداعًا كبيرًا!</p>
      </div>
    </KidsPageLayout>
  );
}
