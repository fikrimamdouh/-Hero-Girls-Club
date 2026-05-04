import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Book,
  ArrowRight,
  Sparkles,
  Star,
  Trophy,
  Wand2,
  Loader2,
  X,
  BookOpen,
} from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Story, ChildProfile } from '../types';
import { toast } from 'sonner';
import { generateMagicStory } from '../services/aiService';

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const LOCAL_STORIES: Story[] = [
  {
    id: 'local-1',
    title: 'ليلى والنجمة الضائعة',
    content: `في قرية صغيرة تحاط بالجبال الخضراء، عاشت فتاة اسمها ليلى. كانت ليلى تحب النجوم كثيراً وكانت تعدّها كل ليلة قبل النوم.

ذات ليلة، لاحظت ليلى أن نجمة صغيرة وحيدة سقطت من السماء وأضاءت حديقة منزلهم بضوء ذهبي خافت.

ركضت ليلى نحو النجمة وسألتها بلطف: "هل أنتِ بخير؟ هل تأذيتِ؟"

قالت النجمة بصوت كالموسيقى: "أنا خائفة وضائعة، لا أعرف كيف أعود إلى السماء."

فكّرت ليلى وقالت: "لا تخافي! سنجد طريقاً معاً." جمعت ليلى أصدقاءها — سامي الذي يحب العلوم، ورنا التي ترسم بشكل جميل، وأمير الذي يعرف الكثير عن الفلك.

عمل الأصدقاء معاً طوال الليل. رسمت رنا خريطة للسماء، وقرأ أمير كتاباً قديماً عن النجوم، وبنى سامي جهازاً صغيراً يشير نحو مكان النجمة في السماء.

عندما أشرق الفجر، حلّقت النجمة الصغيرة إلى السماء ثانيةً، وأضاءت أكثر من أي وقت مضى.

منذ ذلك اليوم، كلما نظرت ليلى إلى السماء، رأت النجمة الصغيرة تلمع لها تحية خاصة.`,
    choices: [],
    points: 20,
  },
  {
    id: 'local-2',
    title: 'مريم وشجرة التفاح السحرية',
    content: `في بستان جميل كانت تعيش شجرة تفاح عجيبة. ثمارها لا تُؤكل فحسب، بل كلّ ثمرة تحمل في داخلها رسالة حكمة.

وجدت مريم، الفتاة ذات الضفائر الطويلة، أول تفاحة وفتحتها فوجدت مكتوباً: "الصبر مفتاح كل باب."

لم تفهم مريم المعنى في البداية، فذهبت لتسأل جدّتها. ابتسمت الجدّة وقالت: "يوماً ما ستفهمين."

بعد أسبوع، كانت مريم تتعلم العزف على الناي ولم تستطع. بكت وأرادت أن تتوقف، لكنها تذكّرت الرسالة: "الصبر مفتاح كل باب."

حاولت مرة بعد مرة، يوماً بعد يوم. وبعد شهر كامل، عزفت مريم أول أغنية كاملة بنجاح، وكانت الأجمل التي سمعتها القرية.

عادت مريم إلى الشجرة وقالت لها: "الآن فهمتُ." فنزلت ثمرة جديدة كانت مكتوب فيها: "التعلم رحلة لا نهاية لها."

ابتسمت مريم وأخذت الثمرة، مدركةً أن الحياة مليئة بالدروس لمن يصبر ويتعلم.`,
    choices: [],
    points: 20,
  },
  {
    id: 'local-3',
    title: 'الأميرة التي أنقذت المملكة بالكتب',
    content: `في مملكة بعيدة اسمها "ضياء"، كانت الأميرة دانا تقضي معظم وقتها في المكتبة الكبيرة بدلاً من قاعات الاحتفالات.

كان الجميع يقول: "أميرة لا تحب الرقص والزينة؟ هذا غريب!" لكن دانا كانت تؤمن أن المعرفة أقوى من أي سيف.

وذات يوم، أصاب المملكة مرض غريب جعل النباتات تذبل والماء يجف. لم يعرف أحد ما يفعل، وخاف الجميع.

لكن دانا، التي قرأت مئات الكتب، تذكّرت كتاباً قديماً عن "ينبوع الجذور" المخفي تحت الجبل الشرقي.

قادت دانا مجموعة صغيرة من الشجعان، وبفضل ما قرأته وجدوا الينبوع وأعادوا الماء إلى المملكة.

منذ ذلك اليوم، بنى الملك أكبر مكتبة في المملكة وجعل تعلّم القراءة واجباً للجميع.

قالت دانا في خطابها: "الكتاب لا يحمله إنسان واحد، بل يحمل أجيالاً من الحكمة."`,
    choices: [],
    points: 25,
  },
  {
    id: 'local-4',
    title: 'سارة والأخطبوط الوحيد',
    content: `كانت سارة تعيش في بيت صغير قريب من البحر. في كل صباح كانت تذهب لتنظر إلى الأمواج وتتخيل ما تحتها من عجائب.

في يوم شتائي ممطر، وجدت سارة على الشاطئ أخطبوطاً صغيراً محاصراً بين الصخور، لا يستطيع العودة إلى البحر.

كان كثيرون يخافون من الأخطبوط، لكن سارة لم تخف. اقتربت ببطء وقالت له: "لا تخف، سأساعدك."

بحثت سارة عن طريقة لجرّ الأخطبوط بلطف نحو الماء دون أن تؤذيه. أحضرت دلواً وملأته بماء البحر، ووضعت الأخطبوط فيه بحرص، ثم حملته إلى موجة عميقة وأطلقته.

غاص الأخطبوط في الأعماق، ثم عاد وأطلّ برأسه للحظة كأنه يقول شكراً.

قالت سارة لأمّها في المساء: "الشجاعة ليست عدم الخوف، بل هي أن تساعد رغم الخوف."

ابتسمت أمّها وقبّلت جبينها: "هذا أعظم درس تعلمتِه يا حبيبتي."`,
    choices: [],
    points: 20,
  },
  {
    id: 'local-5',
    title: 'نور والألوان المفقودة',
    content: `في مدينة اسمها "رويّة" كانت كل الألوان موجودة إلا اللون البنفسجي. لا أحد يعرف لماذا اختفى منذ سنوات.

كانت نور، الفتاة المحبة للرسم، تحلم دائماً برسم غروب الشمس باللون البنفسجي لكنها لم تستطع.

قررت نور أن تحل اللغز. سألت الجميع: العجوز بائعة الأعشاب، والنجار الكبير، والمعلمة ذات الشعر الأبيض.

أخيراً أخبرتها المعلمة: "اللون البنفسجي لا يُجد في الطبيعة هنا — لكنه يولد حين تخلطين الأحمر والأزرق بمحبة."

جرّبت نور في محترفها الصغير. خلطت وخلطت حتى ظهر البنفسجي الجميل أمام عينيها!

ركضت نور إلى الميدان ورسمت على الجدار الكبير غروباً بنفسجياً رائعاً، وتجمّع الجميع يصفقون.

علّمت نور كل أطفال المدينة كيف يصنعون البنفسجي بأنفسهم، لأن أجمل الأشياء تُبنى حين نتشارك المعرفة.`,
    choices: [],
    points: 25,
  },
  {
    id: 'local-6',
    title: 'البطلة الصغيرة ورسالة الشجرة العجوز',
    content: `في غابة كثيفة كانت تقف شجرة ضخمة عمرها مئات السنين. كان الناس يقولون إنها تتكلم — لكن فقط من يصبر ويصغي يسمعها.

وجدت هدى، في عطلة الصيف، طريقاً غير مطروق أوصلها إلى تلك الشجرة. جلست تحتها وأنصتت.

في البداية لم تسمع إلا هواء وأوراقاً. لكنها صبرت. وببطء، شعرت كأن الشجرة تقول:

"أنتِ قوية يا صغيرتي. كل يوم تعيشينه تضافين حلقة إلى سلسلتك. لا تتسرعي، الجذور تحتاج وقتاً قبل أن يطول الغصن."

لم تفهم هدى كل الكلمات، لكنها حفظتها في قلبها.

حين عادت إلى بيتها، كانت تواجه صعوبة في الرياضيات. تذكّرت الشجرة وقررت ألا تستسلم. راجعت ودرست يوماً بعد يوم.

وحين نجحت في اختبارها بتفوق، عادت إلى الغابة وجلست تحت الشجرة وقالت: "شكراً. فهمتُ الآن."

وكأن الريح أجابتها: "أنا كنت أعرف أنكِ ستفهمين."`,
    choices: [],
    points: 30,
  },
];

const STORY_EMOJIS = ['📚', '🌟', '🌸', '🦋', '🌙', '🌈', '💫', '🌺', '🎀', '✨'];

export default function StoryWorld() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [firestoreStories, setFirestoreStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiStory, setAiStory] = useState<{ title: string; content: string } | null>(null);

  const stories = firestoreStories.length > 0 ? firestoreStories : LOCAL_STORIES;

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (activeChildStr) {
      setProfile(JSON.parse(activeChildStr));
    } else {
      navigate('/');
    }

    const unsubscribe = onSnapshot(
      collection(db, 'stories'),
      (snapshot) => {
        const storiesData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));
        setFirestoreStories(storiesData);
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'stories');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleCreateAiStory = async () => {
    if (!profile) return;
    setGenerating(true);
    try {
      const themes = [
        'مغامرة في الغابة السحرية',
        'إنقاذ مدينة الألوان',
        'البحث عن الكنز المفقود',
        'صداقة مع تنين لطيف',
      ];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      const storyText = await generateMagicStory(
        profile.heroName || profile.name,
        profile.heroPower || 'الذكاء',
        randomTheme
      );

      setAiStory({
        title: `مغامرة ${profile.heroName || profile.name}: ${randomTheme}`,
        content: storyText,
      });
    } catch (error) {
      toast.error('حدث خطأ في السحر، حاولي مرة أخرى!');
    } finally {
      setGenerating(false);
    }
  };

  const handleReadStory = async (story: Story) => {
    setActiveStory(story);
  };

  const handleCompleteStory = async () => {
    if (!profile || (!activeStory && !aiStory)) return;

    try {
      const pointsToAdd = activeStory?.points || 50;
      const newPoints = (profile.points || 0) + pointsToAdd;
      const newLevel = Math.floor(newPoints / 100) + 1;

      await updateDoc(doc(db, 'children_profiles', profile.uid), {
        points: newPoints,
        level: newLevel,
      });

      const updatedProfile = { ...profile, points: newPoints, level: newLevel };
      localStorage.setItem('active_child', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);

      toast.success(`أحسنتِ يا بطلة! حصلتِ على ${pointsToAdd} نقطة سحرية لقراءة القصة!`);
      setActiveStory(null);
      setAiStory(null);
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ التقدم');
    }
  };

  const featured = useMemo(() => stories.slice(0, 1), [stories]);
  const rest = useMemo(() => stories.slice(1), [stories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#fdfaf6] font-arabic"
      dir="rtl"
      style={{
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(254,215,170,0.4), transparent 50%), radial-gradient(circle at 100% 0%, rgba(251,207,232,0.35), transparent 45%)',
      }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate('/child')}
            className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors shrink-0"
            aria-label="العودة"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md shadow-rose-200">
              <Book className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] leading-none text-stone-400 font-bold">عالم القصص</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">مكتبة الحكايات</p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 bg-amber-50 ring-1 ring-amber-200 px-3 py-1.5 rounded-full">
            <Star className="h-4 w-4 text-amber-500 fill-current" />
            <span className="font-extrabold text-amber-700 text-sm">{profile?.points || 0}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* AI Story Generator banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-400 p-6 sm:p-8 mb-8 shadow-lg shadow-pink-200"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-right text-white">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                ميزة سحرية جديدة
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 flex items-center gap-2 justify-end">
                اصنعي قصتكِ الخاصة بالذكاء الاصطناعي
                <Wand2 className="h-7 w-7 text-amber-200" />
              </h2>
              <p className="text-pink-50 text-sm sm:text-base">سأكتب لكِ مغامرة فريدة تكونين أنتِ بطلتها!</p>
            </div>
            <button
              onClick={handleCreateAiStory}
              disabled={generating}
              className="bg-white text-pink-600 font-extrabold py-3.5 px-8 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-60 disabled:hover:scale-100 shrink-0"
            >
              {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-amber-500" />}
              {generating ? 'جاري التحضير...' : 'ابدئي المغامرة'}
            </button>
          </div>
        </motion.div>

        {/* Section heading */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-rose-500" />
              قصص مختارة
            </h3>
            <p className="text-stone-500 text-sm font-bold">حكايات مليئة بالحكمة والمغامرة</p>
          </div>
          <span className="text-xs font-extrabold text-stone-400">{stories.length} قصة</span>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl ring-1 ring-stone-200">
            <Sparkles className="w-16 h-16 text-rose-300 mx-auto mb-4" />
            <p className="text-stone-500 text-lg font-bold">لا يوجد قصص حالياً. انتظروا المزيد قريباً!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
            {featured.map((story, idx) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={() => handleReadStory(story)}
                emoji={STORY_EMOJIS[idx % STORY_EMOJIS.length]}
                featured
              />
            ))}
            {rest.map((story, idx) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={() => handleReadStory(story)}
                emoji={STORY_EMOJIS[(idx + 1) % STORY_EMOJIS.length]}
              />
            ))}
          </div>
        )}
      </main>

      {/* Reader modal */}
      <AnimatePresence>
        {(activeStory || aiStory) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              setActiveStory(null);
              setAiStory(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-5 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveStory(null);
                    setAiStory(null);
                  }}
                  className="h-9 w-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="h-4 w-4" />
                </button>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white text-right">
                  {activeStory?.title || aiStory?.title}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-right">
                <div className="text-stone-700 text-lg leading-loose whitespace-pre-wrap font-arabic">
                  {activeStory?.content || aiStory?.content}
                </div>
              </div>
              <div className="border-t border-stone-100 p-5 bg-stone-50 flex justify-center">
                <button
                  onClick={handleCompleteStory}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold py-3 px-10 rounded-2xl shadow-lg shadow-pink-200 transition-all flex items-center gap-2"
                >
                  <Trophy className="h-5 w-5 text-amber-200" />
                  لقد قرأتُ القصة!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StoryCard({
  story,
  onClick,
  emoji,
  featured = false,
}: {
  story: Story;
  onClick: () => void;
  emoji: string;
  featured?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`group text-right bg-white rounded-2xl ring-1 ring-stone-200 hover:ring-rose-200 hover:shadow-lg shadow-stone-100 transition-all overflow-hidden flex flex-col ${
        featured ? 'sm:col-span-2 sm:row-span-1' : ''
      }`}
    >
      <div className="h-1.5 w-full bg-rose-500" />
      <div
        className={`flex items-center justify-center text-6xl bg-gradient-to-br from-rose-50 to-pink-50 ${
          featured ? 'h-48' : 'h-36'
        }`}
      >
        <span className="group-hover:scale-110 transition-transform">{emoji}</span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className={`font-extrabold text-stone-800 mb-2 ${featured ? 'text-xl' : 'text-base'}`}>
          {story.title}
        </h3>
        <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 mb-4">{story.content}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-xs font-extrabold px-2.5 py-1 rounded-full">
            <Star className="h-3 w-3 fill-current" />
            {story.points} نقطة
          </span>
          <span className="text-rose-500 font-extrabold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            اقرئي الآن
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}
