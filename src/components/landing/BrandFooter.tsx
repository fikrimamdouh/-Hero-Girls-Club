import { Crown, Heart, Star, Mail, Shield, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BrandFooter() {
  const navigate = useNavigate();
  return (
    <footer className="relative z-10 mt-12 w-full overflow-hidden rounded-t-[3rem] sm:rounded-t-[4rem] bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-6 pb-10 pt-16">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-400 to-fuchsia-400 shadow-lg shadow-rose-500/30">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <span className="font-arabic text-xl font-black text-white">نادي البطلات الصغيرات</span>
          </div>
          <p className="max-w-md font-arabic text-sm font-medium leading-7 text-slate-400">
            منصّة رقمية آمنة وملهمة للفتيات من 6 إلى 12 سنة. نصنع محتوى يعزّز الثقة بالنفس وينمّي المهارات.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="mailto:rorofikri@gmail.com" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10">
              <Mail className="h-4 w-4" />
            </a>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-rose-300">
              <Heart className="h-4 w-4 fill-current" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-amber-300">
              <Star className="h-4 w-4 fill-current" />
            </span>
          </div>
        </div>

        <div>
          <h4 className="mb-5 font-arabic text-base font-black text-white">روابط سريعة</h4>
          <ul className="space-y-3 font-arabic text-sm font-medium text-slate-400">
            <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition-colors hover:text-white">الرئيسية</button></li>
            <li><button onClick={() => navigate('/terms')} className="transition-colors hover:text-white">الشروط والقوانين</button></li>
            <li><a href="mailto:rorofikri@gmail.com" className="transition-colors hover:text-white">تواصل معنا</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 font-arabic text-base font-black text-white">الأمان والثقة</h4>
          <ul className="space-y-3 font-arabic text-sm font-medium text-slate-400">
            <li className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-emerald-400" /><span>إشراف أبوي كامل</span></li>
            <li className="flex items-center gap-2"><Info className="h-3.5 w-3.5 text-sky-400" /><span>محتوى مراجَع يدويًا</span></li>
            <li className="flex items-center gap-2"><Heart className="h-3.5 w-3.5 fill-current text-rose-400" /><span>بدون إعلانات مزعجة</span></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6 font-arabic text-xs text-slate-500">
        <span>© 2026 نادي البطلات الصغيرات. كل الحقوق محفوظة.</span>
        <span className="flex items-center gap-1.5">صُنع بحبّ <Heart className="h-3.5 w-3.5 fill-current text-pink-400" /> للبطلات</span>
      </div>
    </footer>
  );
}
