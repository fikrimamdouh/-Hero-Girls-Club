import { useMemo, useState } from 'react';
import { BookOpen, Sparkles, Volume2 } from 'lucide-react';
import { miniStories } from '../data/kidsContent';
import KidsPageLayout from '../components/kids/KidsPageLayout';

type StoryCategory = 'مغامرات' | 'خيال' | 'تعليمي';

const categoryMap: Record<string, StoryCategory> = {
  s1: 'خيال',
  s2: 'مغامرات',
  s3: 'تعليمي'
};

const endings = [
  'اختارت البطلة أن تساعد صديقاتها فصار اليوم أجمل للجميع.',
  'قررت البطلة المحاولة مرة أخرى حتى نجحت في النهاية.',
  'شاركت البطلة الفكرة مع عائلتها فازداد الفرح في البيت.'
];

export default function KidsStoriesPage() {
  const [activeId, setActiveId] = useState(miniStories[0]?.id ?? '');
  const [activeCategory, setActiveCategory] = useState<StoryCategory | 'الكل'>('الكل');
  const [pickedEnding, setPickedEnding] = useState<string | null>(null);

  const filteredStories = useMemo(() => {
    if (activeCategory === 'الكل') return miniStories;
    return miniStories.filter((story) => categoryMap[story.id] === activeCategory);
  }, [activeCategory]);

  const activeStory = filteredStories.find((story) => story.id === activeId) ?? filteredStories[0] ?? miniStories[0];

  const readAloud = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !activeStory) return;
    const utterance = new SpeechSynthesisUtterance(`${activeStory.title}. ${activeStory.content}`);
    utterance.lang = 'ar-SA';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <KidsPageLayout title="عالم القصص" subtitle="قصص تفاعلية بتجربة موحدة" emoji="📚" tone="from-violet-50 to-pink-50">
        <div className="flex flex-wrap gap-2 mb-4">
          {(['الكل', 'مغامرات', 'خيال', 'تعليمي'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold ${
                activeCategory === cat ? 'bg-violet-600 text-white' : 'bg-white text-violet-700 border border-violet-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <aside className="md:col-span-1 bg-white rounded-3xl p-4 border-2 border-violet-100 shadow-lg">
            <h1 className="text-2xl font-black text-violet-700 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              قصص الأطفال
            </h1>

            <div className="space-y-3">
              {filteredStories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => {
                    setActiveId(story.id);
                    setPickedEnding(null);
                  }}
                  className={`w-full text-right rounded-2xl p-3 border transition ${
                    story.id === activeId
                      ? 'bg-violet-100 border-violet-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-violet-50'
                  }`}
                >
                  <p className="font-bold text-slate-800">{story.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{story.moral}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 border-2 border-pink-100 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-fuchsia-700 mb-3">{activeStory.title}</h2>
                <p className="text-fuchsia-600 font-semibold mb-5">{activeStory.moral}</p>
              </div>
              <button onClick={readAloud} className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-100 text-fuchsia-700 px-3 py-2 font-bold">
                <Volume2 className="w-4 h-4" />
                قراءة صوتية
              </button>
            </div>

            <p className="text-slate-700 leading-8 text-lg">{activeStory.content}</p>

            <div className="mt-6">
              <p className="font-black text-slate-800 mb-2">اختاري نهاية القصة:</p>
              <div className="grid gap-2">
                {endings.map((ending) => (
                  <button key={ending} onClick={() => setPickedEnding(ending)} className="text-right p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-fuchsia-50">
                    {ending}
                  </button>
                ))}
              </div>
            </div>

            {pickedEnding && (
              <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                نهاية اختيارك: {pickedEnding}
              </div>
            )}

            <div className="mt-8 p-4 rounded-2xl bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-700 font-semibold inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              شاركي القصة مع العائلة واسألي طفلك عن العبرة.
            </div>
          </section>
        </div>
    </KidsPageLayout>
  );
}
