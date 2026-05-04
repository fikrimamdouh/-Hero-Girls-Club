import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Brain,
  Calculator,
  FlaskConical,
  Languages,
  Heart,
  Star,
  ArrowRight,
  Play,
  CheckCircle2,
  Trophy,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, setDoc } from 'firebase/firestore';
import { ChildProfile, Course, Lesson, Quiz, UserProgress } from '../types';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const COURSES: Course[] = [
  { id: 'math-1', title: 'مملكة الأرقام', description: 'تعلمي الجمع والطرح بأسلوب سحري ممتع', icon: 'Calculator', color: 'bg-blue-400', category: 'math', level: 1 },
  { id: 'sci-1', title: 'مختبر العجائب', description: 'اكتشفي أسرار الطبيعة والعلوم من حولكِ', icon: 'FlaskConical', color: 'bg-emerald-400', category: 'science', level: 1 },
  { id: 'lang-1', title: 'لغة الجنيات', description: 'أتقني اللغة العربية الفصحى بجمالها وسحرها', icon: 'Languages', color: 'bg-violet-400', category: 'language', level: 1 },
  { id: 'val-1', title: 'أخلاق الأميرات', description: 'تعلمي الصدق، الأمانة، والتعاون مع الآخرين', icon: 'Heart', color: 'bg-pink-400', category: 'values', level: 1 },
];

const COURSE_ACCENT: Record<string, { stripe: string; soft: string; gradient: string }> = {
  'math-1': { stripe: 'bg-blue-500', soft: 'bg-blue-50 text-blue-600 ring-blue-200', gradient: 'from-blue-400 to-sky-500' },
  'sci-1': { stripe: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-600 ring-emerald-200', gradient: 'from-emerald-400 to-teal-500' },
  'lang-1': { stripe: 'bg-violet-500', soft: 'bg-violet-50 text-violet-600 ring-violet-200', gradient: 'from-violet-400 to-purple-500' },
  'val-1': { stripe: 'bg-pink-500', soft: 'bg-pink-50 text-pink-600 ring-pink-200', gradient: 'from-pink-400 to-rose-500' },
};

const LESSONS: Record<string, Lesson[]> = {
  'math-1': [
    { id: 'm1-l1', courseId: 'math-1', title: 'سحر الأرقام من 1 إلى 10', content: 'في هذه الرحلة، سنتعرف على الأرقام الصديقة التي تساعدنا في عد النجوم والزهور والفراشات من حولنا. الأرقام هي لغة الكون السحرية! الرقم 1 يشبه شمعة وحيدة تضيء الظلام، والرقم 2 يشبه بطّتين تسبحان معاً، والرقم 10 يعني أننا أتممنا رحلة كاملة! 🌟', order: 1, points: 20 },
    { id: 'm1-l2', courseId: 'math-1', title: 'سر الجمع البسيط', content: 'عندما نجمع نجمتين مع ثلاث نجوم، كم نجمة سحرية سيكون لدينا؟ الجمع هو إضافة شيء إلى شيء آخر لنحصل على مجموع أكبر. تخيلي أن لديكِ 2 تفاحة في سلة، ثم أضفتِ 3 تفاحات أخرى، فأصبح لديكِ 5 تفاحات رائعة! ✨ الجمع يجعل عالمنا أكبر وأجمل.', order: 2, points: 30 },
    { id: 'm1-l3', courseId: 'math-1', title: 'لعبة الطرح المبهجة', content: 'الطرح هو عكس الجمع! إذا كان لديكِ 8 حبّات عنب وأكلتِ 3 منها، كم بقي؟ 8 - 3 = 5. نستخدم الطرح في حياتنا اليومية كثيراً، مثل معرفة كم نقطة تحتاجين للوصول إلى المستوى التالي! 🍇 تذكري: الطرح لا يُفقدنا شيئاً، بل يعلّمنا الحساب!', order: 3, points: 35 },
  ],
  'sci-1': [
    { id: 's1-l1', courseId: 'sci-1', title: 'عالم النباتات الرائع', content: 'النباتات كائنات سحرية تصنع غذاءها من الشمس والماء والهواء! هذه العملية تُسمى "البناء الضوئي". تخيلي مصنعاً صغيراً داخل كل ورقة خضراء تعمل بصمت لتنتج الأكسجين الذي نتنفسه. بدون النباتات لن يكون هناك هواء نقي على الأرض! 🌱 الجزء الأخضر في الأوراق يُسمى "الكلوروفيل".', order: 1, points: 25 },
    { id: 's1-l2', courseId: 'sci-1', title: 'دورة الماء في الطبيعة', content: 'الماء في طبيعتنا يقوم برحلة مذهلة لا تتوقف! يتبخر الماء من البحار والأنهار صعوداً إلى السماء، ويتحول إلى سحاب، ثم يعود مطراً يروي الأرض والنباتات والحيوانات. هذه الدورة تحفظ الحياة على كوكبنا منذ ملايين السنين. ☁️ 🌧️ كوب الماء الذي تشربينه قد يكون سبق وشربه ديناصور!', order: 2, points: 30 },
    { id: 's1-l3', courseId: 'sci-1', title: 'المجموعة الشمسية', content: 'نعيش في مجموعة شمسية مكوّنة من الشمس و8 كواكب تدور حولها. كوكبنا الأرض هو الثالث من الشمس وهو الوحيد المعروف بوجود الحياة عليه! أكبر الكواكب هو المشتري، ويمكن أن تُوضع داخله 1300 كرة أرضية! 🪐 أقرب كوكب إلى الشمس هو عطارد وهو الأسرع في دورته.', order: 3, points: 35 },
  ],
  'lang-1': [
    { id: 'l1-l1', courseId: 'lang-1', title: 'جمال حروف الهجاء', content: 'اللغة العربية أجمل لغات العالم! تتكوّن من 28 حرفاً هجائياً يُكوّن كل حرف منها كلمات لا حصر لها. بعض الحروف تتغير شكلها حسب مكانها في الكلمة: في البداية أو في الوسط أو في النهاية. حرف "ب" مثلاً يصبح "بـ" في البداية، و"ـبـ" في الوسط، و"ـب" في النهاية. 🌙 تعلّم القرآن الكريم يُحسّن لغتنا العربية بشكل رائع!', order: 1, points: 25 },
    { id: 'l1-l2', courseId: 'lang-1', title: 'أنواع الكلمات السحرية', content: 'في اللغة العربية ثلاثة أنواع من الكلمات: الاسم، الفعل، والحرف. الاسم هو كل ما نستطيع تسميته مثل "بطلة" و"نجمة" و"مدرسة". الفعل هو كل حدث يحصل مثل "لعبت" و"قرأت" و"ابتسمت". الحرف يربط الكلام مثل "في" و"على" و"من". ✨ الجملة المفيدة تحتاج إلى اسم وفعل على الأقل!', order: 2, points: 30 },
    { id: 'l1-l3', courseId: 'lang-1', title: 'فن الكتابة الجميلة', content: 'الكتابة الجميلة هي هدية نقدمها للقارئ! عندما نكتب جملة، نبدأ بحرف كبير وننتهي بنقطة. الفقرة هي مجموعة جمل تتحدث عن فكرة واحدة. يمكنكِ أن تصبحي كاتبة رائعة بالتدرب كل يوم. اكتبي يومياتك السحرية، أو قصة قصيرة عن مغامرتك، فكل كاتبة عظيمة بدأت بجملة واحدة! 📝', order: 3, points: 35 },
  ],
  'val-1': [
    { id: 'v1-l1', courseId: 'val-1', title: 'قوة الصدق', content: 'الأميرة الحقيقية دائماً تقول الصدق، لأن الصدق هو مفتاح القلوب السحرية. عندما نكون صادقين يثق بنا الناس ويحبوننا أكثر. قد يكون الصدق صعباً أحياناً، لكنه يجعلنا نشعر بالراحة في قلوبنا. حتى لو أخطأنا، الاعتراف بالخطأ وإصلاحه هو من أجمل الشجاعة! 💎', order: 1, points: 25 },
    { id: 'v1-l2', courseId: 'val-1', title: 'سر التعاون', content: 'عندما نتعاون مع بعضنا نصنع أشياء أكبر بكثير مما نصنعه وحدنا! النحل يبني خلايا رائعة لأنه يعمل بروح الفريق. في المدرسة وفي البيت، حين تساعدين صديقتك أو أختك تنتهي الأعمال أسرع وتصبح أجمل. التعاون يُعلّمنا أيضاً الصبر وقبول أفكار الآخرين. 🌸', order: 2, points: 30 },
    { id: 'v1-l3', courseId: 'val-1', title: 'الاحترام درع البطلة', content: 'الاحترام يعني تقدير مشاعر الآخرين وأفكارهم حتى لو اختلفنا معهم. نحترم الكبار بالاستماع إليهم وعدم مقاطعتهم. ونحترم الصغار بأن نكون لطيفين ومتفهمين لهم. وأهم من كل ذلك احترام أنفسنا بعدم قبول أي شيء يؤذينا. البطلة الحقيقية تحترم الجميع وتكسب احترامهم. 🛡️', order: 3, points: 35 },
  ],
};

const QUIZZES: Record<string, Quiz> = {
  'm1-l1': { id: 'q-m1-l1', lessonId: 'm1-l1', questions: [
    { id: 'q1', text: 'كم عدد النجوم في سماء الأميرات إذا كان هناك 3 نجوم وردية و 2 زرقاء؟', options: ['4 نجوم', '5 نجوم', '6 نجوم'], correctOption: 1, explanation: 'أحسنتِ! 3 + 2 يساوي 5 نجوم سحرية.' },
    { id: 'q2', text: 'أي رقم يأتي بعد الرقم 7 في عدنا السحري؟', options: ['6', '8', '9'], correctOption: 1, explanation: 'رائع! الرقم 8 هو الذي يتبع الرقم 7.' },
  ]},
  'm1-l2': { id: 'q-m1-l2', lessonId: 'm1-l2', questions: [
    { id: 'q1', text: 'عندي 4 فراشات ووجدت 3 أخرى، كم فراشة لديّ الآن؟', options: ['6 فراشات', '7 فراشات', '8 فراشات'], correctOption: 1, explanation: 'صحيح! 4 + 3 = 7 فراشات جميلة.' },
    { id: 'q2', text: 'ما نتيجة 5 + 2؟', options: ['6', '7', '8'], correctOption: 1, explanation: 'أحسنتِ! 5 + 2 = 7.' },
  ]},
  'm1-l3': { id: 'q-m1-l3', lessonId: 'm1-l3', questions: [
    { id: 'q1', text: 'عندي 9 حبّات توت وأكلتُ 4 منها. كم تبقى؟', options: ['4', '5', '6'], correctOption: 1, explanation: 'رائع! 9 - 4 = 5 حبّات.' },
    { id: 'q2', text: 'ما نتيجة 8 - 3؟', options: ['4', '5', '6'], correctOption: 1, explanation: 'صحيح تماماً! 8 - 3 = 5.' },
  ]},
  's1-l1': { id: 'q-s1-l1', lessonId: 's1-l1', questions: [
    { id: 'q1', text: 'ماذا تصنع النباتات من الشمس والماء والهواء؟', options: ['ماء نقي', 'غذاءها وأكسجين', 'تربة خصبة'], correctOption: 1, explanation: 'أحسنتِ! النباتات تصنع غذاءها وتُنتج الأكسجين عبر البناء الضوئي.' },
    { id: 'q2', text: 'ما اسم المادة الخضراء في أوراق النباتات؟', options: ['الكلوروفيل', 'الكلسيوم', 'النيتروجين'], correctOption: 0, explanation: 'صحيح! الكلوروفيل هو ما يُعطي النباتات لونها الأخضر.' },
  ]},
  's1-l2': { id: 'q-s1-l2', lessonId: 's1-l2', questions: [
    { id: 'q1', text: 'من أين يتبخر الماء ليصعد إلى السماء؟', options: ['من الجبال فقط', 'من البحار والأنهار', 'من الغابات فقط'], correctOption: 1, explanation: 'صحيح! الماء يتبخر بشكل رئيسي من البحار والأنهار.' },
    { id: 'q2', text: 'ماذا يصبح البخار عندما يرتفع إلى السماء؟', options: ['ثلج', 'سحاب', 'ريح'], correctOption: 1, explanation: 'أحسنتِ! البخار يتحول إلى سحاب في السماء.' },
  ]},
  's1-l3': { id: 'q-s1-l3', lessonId: 's1-l3', questions: [
    { id: 'q1', text: 'الأرض هي الكوكب رقم كم من الشمس؟', options: ['الثاني', 'الثالث', 'الرابع'], correctOption: 1, explanation: 'صحيح! الأرض هي الكوكب الثالث في ترتيبها من الشمس.' },
    { id: 'q2', text: 'ما أكبر كوكب في مجموعتنا الشمسية؟', options: ['زحل', 'المشتري', 'أورانوس'], correctOption: 1, explanation: 'رائع! المشتري هو أكبر كواكب المجموعة الشمسية.' },
  ]},
  'l1-l1': { id: 'q-l1-l1', lessonId: 'l1-l1', questions: [
    { id: 'q1', text: 'كم عدد حروف الهجاء العربية؟', options: ['24 حرفاً', '26 حرفاً', '28 حرفاً'], correctOption: 2, explanation: 'صحيح! اللغة العربية تتكوّن من 28 حرفاً هجائياً.' },
    { id: 'q2', text: 'كيف تُكتب حرف "ب" عند وضعها في وسط الكلمة؟', options: ['ب', 'ـبـ', 'ـب'], correctOption: 1, explanation: 'أحسنتِ! في وسط الكلمة تكتب "ـبـ" متصلة من الطرفين.' },
  ]},
  'l1-l2': { id: 'q-l1-l2', lessonId: 'l1-l2', questions: [
    { id: 'q1', text: 'كلمة "لعبتُ" من أي نوع من الكلمات؟', options: ['اسم', 'فعل', 'حرف'], correctOption: 1, explanation: 'صحيح! "لعبتُ" فعل لأنه يدل على حدث وقع.' },
    { id: 'q2', text: 'كلمة "على" ما نوعها؟', options: ['اسم', 'فعل', 'حرف'], correctOption: 2, explanation: 'رائع! "على" حرف جر يربط الكلمات ببعضها.' },
  ]},
  'l1-l3': { id: 'q-l1-l3', lessonId: 'l1-l3', questions: [
    { id: 'q1', text: 'بم تبدأ الجملة المكتوبة دائماً؟', options: ['بنقطة', 'بحرف كبير', 'بفارزة'], correctOption: 1, explanation: 'أحسنتِ! تبدأ الجملة دائماً بحرف كبير.' },
    { id: 'q2', text: 'الفقرة هي مجموعة من؟', options: ['حروف تتحدث عن فكرة', 'جمل تتحدث عن فكرة واحدة', 'كلمات عشوائية'], correctOption: 1, explanation: 'صحيح! الفقرة مجموعة جمل تدور حول فكرة واحدة.' },
  ]},
  'v1-l1': { id: 'q-v1-l1', lessonId: 'v1-l1', questions: [
    { id: 'q1', text: 'لماذا الصدق مفتاح القلوب السحرية؟', options: ['لأنه يجعلنا أذكياء', 'لأنه يكسب ثقة الناس ومحبتهم', 'لأنه سهل دائماً'], correctOption: 1, explanation: 'صحيح! الصدق يكسب ثقة الناس وإعجابهم بنا.' },
    { id: 'q2', text: 'ماذا نفعل عندما نرتكب خطأ؟', options: ['نتجاهله', 'نعترف به ونحاول الإصلاح', 'نلوم الآخرين'], correctOption: 1, explanation: 'رائع! الاعتراف بالخطأ وإصلاحه شجاعة حقيقية.' },
  ]},
  'v1-l2': { id: 'q-v1-l2', lessonId: 'v1-l2', questions: [
    { id: 'q1', text: 'ما ميزة التعاون مع الآخرين؟', options: ['يُبطئ العمل', 'يُنجز أشياء أكبر مما نستطيع وحدنا', 'يسبب المشاكل'], correctOption: 1, explanation: 'أحسنتِ! التعاون يُمكّننا من إنجاز ما لا نستطيع وحدنا.' },
    { id: 'q2', text: 'ماذا يعلّمنا التعاون؟', options: ['المنافسة فقط', 'الصبر وقبول أفكار الآخرين', 'الاعتماد على النفس فقط'], correctOption: 1, explanation: 'صحيح! التعاون يُعلّمنا الصبر وتقبّل أفكار الآخرين.' },
  ]},
  'v1-l3': { id: 'q-v1-l3', lessonId: 'v1-l3', questions: [
    { id: 'q1', text: 'كيف نحترم الكبار؟', options: ['بالصراخ عليهم', 'بالاستماع إليهم وعدم المقاطعة', 'بتجاهلهم'], correctOption: 1, explanation: 'صحيح! نحترم الكبار بالإصغاء وعدم مقاطعتهم.' },
    { id: 'q2', text: 'ما أهم نوع من الاحترام؟', options: ['احترام أنفسنا', 'احترام الأصدقاء فقط', 'احترام المعلمة فقط'], correctOption: 0, explanation: 'أحسنتِ! احترام أنفسنا هو الأساس الذي ينبثق منه احترام الجميع.' },
  ]},
};

const getCourseIcon = (iconName: string) => {
  const cls = 'h-7 w-7';
  switch (iconName) {
    case 'Calculator': return <Calculator className={cls} />;
    case 'FlaskConical': return <FlaskConical className={cls} />;
    case 'Languages': return <Languages className={cls} />;
    case 'Heart': return <Heart className={cls} />;
    default: return <BookOpen className={cls} />;
  }
};

export default function MagicLearning() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr) {
      navigate('/');
      return;
    }
    const activeChild = JSON.parse(activeChildStr) as ChildProfile;
    setProfile(activeChild);

    const q = query(collection(db, 'user_progress'), where('childId', '==', activeChild.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const progressMap: Record<string, UserProgress> = {};
        snapshot.docs.forEach((d) => {
          const data = d.data() as UserProgress;
          progressMap[data.lessonId] = data;
        });
        setProgress(progressMap);
        setLoading(false);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'user_progress')
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleStartLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowQuiz(false);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const handleAnswer = async (optionIndex: number) => {
    if (!selectedLesson) return;
    const quiz = QUIZZES[selectedLesson.id];
    const isCorrect = optionIndex === quiz.questions[currentQuestionIndex].correctOption;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast.success('إجابة سحرية صحيحة! ✨');
    } else {
      toast.error('حاولي مرة أخرى يا بطلة، أنتِ قادرة على ذلك! 💪');
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const finalScore = score + (isCorrect ? 1 : 0);
      const totalQuestions = quiz.questions.length;
      const isPassed = finalScore >= totalQuestions / 2;

      if (isPassed && profile) {
        try {
          await setDoc(doc(db, 'user_progress', `${profile.uid}_${selectedLesson.id}`), {
            childId: profile.uid,
            lessonId: selectedLesson.id,
            courseId: selectedLesson.courseId,
            status: 'completed',
            score: finalScore,
            completedAt: Date.now(),
          });

          const newPoints = profile.points + selectedLesson.points;
          const newLevel = Math.floor(newPoints / 100) + 1;
          await setDoc(
            doc(db, 'children_profiles', profile.uid),
            { points: newPoints, level: newLevel },
            { merge: true }
          );

          await addDoc(collection(db, 'activity_logs'), {
            childId: profile.uid,
            childName: profile.name,
            message: `أكملت درس "${selectedLesson.title}" بنجاح!`,
            type: 'learning',
            timestamp: Date.now(),
          });

          toast.success(`مبروك! حصلتِ على ${selectedLesson.points} نقطة سحرية! 🏆`);
        } catch (err) {
          toast.error('حدث خطأ أثناء حفظ تقدمكِ');
        }
      }
      setShowQuiz(false);
      setSelectedLesson(null);
    }
  };

  const courseProgress = useMemo(() => {
    const map: Record<string, number> = {};
    COURSES.forEach((c) => {
      const total = LESSONS[c.id]?.length || 1;
      const done = Object.values(progress).filter((p) => p.courseId === c.id && p.status === 'completed').length;
      map[c.id] = (done / total) * 100;
    });
    return map;
  }, [progress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#fdfaf6] font-arabic"
      dir="rtl"
      style={{
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(221,214,254,0.4), transparent 50%), radial-gradient(circle at 100% 0%, rgba(186,230,253,0.3), transparent 45%)',
      }}
    >
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={() =>
              selectedLesson
                ? setSelectedLesson(null)
                : selectedCourse
                ? setSelectedCourse(null)
                : navigate('/child')
            }
            className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors shrink-0"
            aria-label="العودة"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-md shadow-violet-200">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] leading-none text-stone-400 font-bold">أكاديمية التعلم</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">
                {selectedCourse ? selectedCourse.title : 'الحكمة السحرية'}
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 bg-amber-50 ring-1 ring-amber-200 px-3 py-1.5 rounded-full">
            <Star className="h-4 w-4 text-amber-500 fill-current" />
            <span className="font-extrabold text-amber-700 text-sm">{profile?.points || 0}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {!selectedCourse ? (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {COURSES.map((course) => {
                const accent = COURSE_ACCENT[course.id];
                const pct = courseProgress[course.id] || 0;
                return (
                  <motion.button
                    key={course.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedCourse(course)}
                    className="text-right bg-white rounded-2xl ring-1 ring-stone-200 hover:ring-stone-300 hover:shadow-lg shadow-stone-100 transition-all overflow-hidden flex flex-col"
                  >
                    <div className={`h-1.5 w-full ${accent.stripe}`} />
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div
                        className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center text-white shadow-md`}
                      >
                        {getCourseIcon(course.icon)}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-stone-800 mb-1">{course.title}</h3>
                        <p className="text-stone-500 text-sm leading-relaxed">{course.description}</p>
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-extrabold text-stone-400">التقدم</span>
                          <span className="text-xs font-extrabold text-stone-600">{Math.round(pct)}%</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${accent.stripe} transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : !selectedLesson ? (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div className="bg-white rounded-2xl ring-1 ring-stone-200 p-5 flex items-center gap-4">
                <div
                  className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${COURSE_ACCENT[selectedCourse.id].gradient} flex items-center justify-center text-white shadow-md`}
                >
                  {getCourseIcon(selectedCourse.icon)}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-stone-800">{selectedCourse.title}</h2>
                  <p className="text-stone-500 text-sm font-bold">{selectedCourse.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {LESSONS[selectedCourse.id]?.map((lesson, index) => {
                  const isDone = progress[lesson.id]?.status === 'completed';
                  const accent = COURSE_ACCENT[selectedCourse.id];
                  return (
                    <motion.button
                      key={lesson.id}
                      whileHover={{ y: -2 }}
                      onClick={() => handleStartLesson(lesson)}
                      className="group text-right bg-white rounded-2xl ring-1 ring-stone-200 hover:ring-stone-300 hover:shadow-md transition-all overflow-hidden flex items-stretch"
                    >
                      <div className={`w-1.5 ${accent.stripe}`} />
                      <div className="flex-1 p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className={`h-11 w-11 rounded-xl flex items-center justify-center font-extrabold text-base shrink-0 ring-1 ${
                              isDone ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : accent.soft
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-stone-800 truncate">{lesson.title}</h3>
                            <span className="inline-flex items-center gap-1 mt-1 bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-xs font-extrabold px-2 py-0.5 rounded-full">
                              <Star className="h-3 w-3 fill-current" />
                              {lesson.points} نقطة
                            </span>
                          </div>
                        </div>
                        <Play className="h-5 w-5 text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" />
                      </div>
                    </motion.button>
                  );
                }) || (
                  <div className="text-center py-16 bg-white rounded-2xl ring-1 ring-dashed ring-stone-300">
                    <p className="text-stone-400 text-base font-bold">قريباً.. دروس سحرية جديدة في هذا القسم!</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="lesson-content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-3xl ring-1 ring-stone-200 shadow-sm overflow-hidden"
            >
              {!showQuiz ? (
                <div className="text-right">
                  <div
                    className={`h-1.5 w-full ${COURSE_ACCENT[selectedCourse.id].stripe}`}
                  />
                  <div className="p-6 sm:p-10">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-800">
                        {selectedLesson.title}
                      </h2>
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-sm font-extrabold px-3 py-1.5 rounded-full">
                        <Star className="h-4 w-4 fill-current" />
                        {selectedLesson.points} نقطة
                      </span>
                    </div>
                    <div className="mb-10">
                      <p className="text-lg text-stone-700 leading-loose">{selectedLesson.content}</p>
                    </div>
                    <div className="flex justify-center">
                      {QUIZZES[selectedLesson.id] ? (
                        <button
                          onClick={handleStartQuiz}
                          className={`bg-gradient-to-r ${COURSE_ACCENT[selectedCourse.id].gradient} hover:brightness-110 text-white font-extrabold py-3.5 px-10 rounded-2xl shadow-lg transition-all flex items-center gap-2`}
                        >
                          <HelpCircle className="h-5 w-5" />
                          ابدئي التحدي السحري
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedLesson(null)}
                          className={`bg-gradient-to-r ${COURSE_ACCENT[selectedCourse.id].gradient} hover:brightness-110 text-white font-extrabold py-3.5 px-10 rounded-2xl shadow-lg transition-all`}
                        >
                          فهمت الدرس!
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-right">
                  <div
                    className={`h-1.5 w-full ${COURSE_ACCENT[selectedCourse.id].stripe}`}
                  />
                  <div className="p-6 sm:p-10">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-extrabold text-stone-800 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        التحدي السحري
                      </h2>
                      <div className="flex gap-1.5">
                        {QUIZZES[selectedLesson.id].questions.map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${
                              i === currentQuestionIndex
                                ? COURSE_ACCENT[selectedCourse.id].stripe
                                : i < currentQuestionIndex
                                ? 'bg-emerald-400'
                                : 'bg-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-stone-800 mb-8 leading-relaxed">
                      {QUIZZES[selectedLesson.id].questions[currentQuestionIndex].text}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {QUIZZES[selectedLesson.id].questions[currentQuestionIndex].options.map(
                        (option, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswer(i)}
                            className="p-5 rounded-2xl bg-white ring-1 ring-stone-200 hover:ring-violet-300 hover:bg-violet-50/30 text-right text-base font-extrabold text-stone-800 transition-all"
                          >
                            {option}
                          </motion.button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
