import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Star, Heart, Sparkles, ArrowRight, Info, CheckCircle2, Lock, Users, Trophy } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff5f7] p-4 md:p-8 relative overflow-hidden" dir="rtl">
      {/* Magical Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-[30rem] h-[30rem] bg-purple-200/20 rounded-full blur-3xl"
        />
      </div>

      <header className="max-w-4xl mx-auto flex items-center justify-between mb-8 relative z-10">
        <div className="princess-card px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-princess-purple flex items-center gap-2">
            <Info className="w-8 h-8 text-princess-pink" />
            الشروط والقوانين
          </h1>
        </div>
        <button onClick={() => navigate('/')} className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-md text-princess-pink hover:bg-white transition-all border-2 border-pink-100">
          <ArrowRight className="w-6 h-6" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto relative z-10 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-[3rem] p-8 md:p-12 shadow-2xl border-4 border-pink-100 text-right"
        >
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-princess-purple mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-princess-gold" />
              مميزات نادي البطلات الصغيرات
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'بيئة آمنة', desc: 'عالم مغلق ومراقب تماماً من قبل أولياء الأمور، حيث لا يوجد تواصل مع الغرباء.', icon: Shield },
                { title: 'تنمية المهارات', desc: 'مهام يومية تشجع على القراءة، النظافة، والتعاون، وتنمي حس المسؤولية لدى الطفلة.', icon: Star },
                { title: 'قصص ملهمة', desc: 'مكتبة متجددة من القصص التي تغرس القيم والأخلاق، وتنمي خيال الطفلة وإبداعها.', icon: Heart },
                { title: 'ذكاء اصطناعي مرشد', desc: 'مساعدة سحرية تتفاعل مع كتابات الطفلة وتشجعها على التعبير عن نفسها بطريقة إيجابية.', icon: Sparkles },
                { title: 'متابعة أبوية', desc: 'لوحة تحكم خاصة بأولياء الأمور لمتابعة تقدم الطفلة وإضافة مهام جديدة.', icon: Users },
                { title: 'مكافآت تحفيزية', desc: 'نظام نقاط وأوسمة يشجع الطفلة على إنجاز المهام واكتساب عادات حميدة.', icon: Trophy },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-pink-50/50 rounded-2xl border-2 border-pink-100 flex flex-col items-start">
                  <item.icon className="w-8 h-8 text-princess-pink mb-2" />
                  <h3 className="font-bold text-princess-purple mb-1">{item.title}</h3>
                  <p className="text-sm text-pink-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-princess-purple mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-princess-pink" />
              قوانين النادي الملكي
            </h2>
            <ul className="space-y-4">
              {[
                'يجب الحفاظ على سرية الرمز السري (PIN) الخاص بكل بطلة وعدم مشاركته مع الآخرين.',
                'الاحترام المتبادل هو أساس التعامل في عالمنا السحري، ويجب استخدام كلمات مهذبة دائماً.',
                'يتم مراجعة جميع طلبات الانضمام يدوياً من قبل الإدارة لضمان أمان المجتمع.',
                'يحق لولي الأمر متابعة جميع نشاطات البطلة وتعديل مهامها ومكافآتها حسب ما يراه مناسباً.',
                'النقاط والأوسمة هي وسيلة للتشجيع والتحفيز الذاتي، وليست للمنافسة غير العادلة مع الأخريات.',
                'يُمنع مشاركة أي معلومات شخصية حساسة داخل التطبيق، مثل العنوان أو رقم الهاتف.',
                'في حال مواجهة أي مشكلة تقنية أو سلوكية، يجب التواصل مع الإدارة فوراً عبر لوحة تحكم ولي الأمر.'
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-princess-purple text-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-princess-purple mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-princess-pink" />
              خصوصية البيانات
            </h2>
            <p className="text-princess-purple leading-relaxed text-lg">
              نحن نأخذ خصوصية أطفالنا على محمل الجد. جميع البيانات مشفرة ومحمية بأحدث التقنيات، ولا يتم مشاركتها أو بيعها لأي جهة خارجية تحت أي ظرف. إيميل ولي الأمر هو المرجع الأساسي والوحيد للتواصل وتفعيل الحسابات، ونحن نلتزم بقوانين حماية خصوصية الأطفال على الإنترنت.
            </p>
          </section>

          <div className="mt-12 flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="princess-button py-4 px-12 text-xl"
            >
              فهمت، لنبدأ الرحلة!
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
