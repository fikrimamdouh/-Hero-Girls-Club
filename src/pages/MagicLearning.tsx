import { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ChildProfile, Course, Lesson, Quiz, UserProgress } from '../types';
import { toast } from 'sonner';

const COURSES: Course[] = [
  { id: 'math-1', title: 'مملكة الأرقام', description: 'تعلمي الجمع والطرح بأسلوب سحري ممتع', icon: 'Calculator', color: 'bg-blue-400', category: 'math', level: 1 },
  { id: 'sci-1', title: 'مختبر العجائب', description: 'اكتشفي أسرار الطبيعة والعلوم من حولكِ', icon: 'FlaskConical', color: 'bg-green-400', category: 'science', level: 1 },
  { id: 'lang-1', title: 'لغة الجنيات', description: 'أتقني اللغة العربية الفصحى بجمالها وسحرها', icon: 'Languages', color: 'bg-purple-400', category: 'language', level: 1 },
  { id: 'val-1', title: 'أخلاق الأميرات', description: 'تعلمي الصدق، الأمانة، والتعاون مع الآخرين', icon: 'Heart', color: 'bg-pink-400', category: 'values', level: 1 },
];

const LESSONS: Record<string, Lesson[]> = {
  'math-1': [
    { id: 'm1-l1', courseId: 'math-1', title: 'سحر الأرقام من 1 إلى 10', content: 'في هذه الرحلة، سنتعرف على الأرقام الصديقة التي تساعدنا في عد النجوم...', order: 1, points: 20 },
    { id: 'm1-l2', courseId: 'math-1', title: 'سر الجمع البسيط', content: 'عندما نجمع نجمتين مع ثلاث نجوم، كم نجمة سحرية سيكون لدينا؟', order: 2, points: 30 },
  ],
  'val-1': [
    { id: 'v1-l1', courseId: 'val-1', title: 'قوة الصدق', content: 'الأميرة الحقيقية دائماً تقول الصدق، لأن الصدق هو مفتاح القلوب السحرية...', order: 1, points: 25 },
  ]
};

const QUIZZES: Record<string, Quiz> = {
  'm1-l1': {
    id: 'q-m1-l1',
    lessonId: 'm1-l1',
    questions: [
      { id: 'q1', text: 'كم عدد النجوم في سماء الأميرات إذا كان هناك 3 نجوم وردية و 2 زرقاء؟', options: ['4 نجوم', '5 نجوم', '6 نجوم'], correctOption: 1, explanation: 'أحسنتِ! 3 + 2 يساوي 5 نجوم سحرية.' },
      { id: 'q2', text: 'أي رقم يأتي بعد الرقم 7 في عدنا السحري؟', options: ['6', '8', '9'], correctOption: 1, explanation: 'رائع! الرقم 8 هو الذي يتبع الرقم 7.' }
    ]
  }
};

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

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

    const q = query(
      collection(db, 'user_progress'),
      where('childId', '==', activeChild.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const progressMap: Record<string, UserProgress> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data() as UserProgress;
        progressMap[data.lessonId] = data;
      });
      setProgress(progressMap);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'user_progress'));

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
      setScore(prev => prev + 1);
      toast.success('إجابة سحرية صحيحة! ✨');
    } else {
      toast.error('حاولي مرة أخرى يا بطلة، أنتِ قادرة على ذلك! 💪');
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz Finished
      const finalScore = score + (isCorrect ? 1 : 0);
      const totalQuestions = quiz.questions.length;
      const isPassed = finalScore >= totalQuestions / 2;

      if (isPassed && profile) {
        try {
          // Update Progress
          await setDoc(doc(db, 'user_progress', `${profile.uid}_${selectedLesson.id}`), {
            childId: profile.uid,
            lessonId: selectedLesson.id,
            courseId: selectedLesson.courseId,
            status: 'completed',
            score: finalScore,
            completedAt: Date.now()
          });

          // Add Points
          const newPoints = profile.points + selectedLesson.points;
          const newLevel = Math.floor(newPoints / 100) + 1;
          await setDoc(doc(db, 'children_profiles', profile.uid), {
            points: newPoints,
            level: newLevel
          }, { merge: true });

          // Log Activity
          await addDoc(collection(db, 'activity_logs'), {
            childId: profile.uid,
            childName: profile.name,
            message: `أكملت درس "${selectedLesson.title}" بنجاح!`,
            type: 'learning',
            timestamp: Date.now()
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

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return <Calculator className="w-8 h-8" />;
      case 'FlaskConical': return <FlaskConical className="w-8 h-8" />;
      case 'Languages': return <Languages className="w-8 h-8" />;
      case 'Heart': return <Heart className="w-8 h-8" />;
      default: return <BookOpen className="w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff5f7] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-princess-pink animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff5f7] p-4 md:p-8 relative overflow-hidden">
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

      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8 relative z-10">
        <button 
          onClick={() => selectedLesson ? setSelectedLesson(null) : selectedCourse ? setSelectedCourse(null) : navigate('/child')}
          className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-md text-princess-pink hover:bg-white transition-all border-2 border-pink-100"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="princess-card px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-princess-purple flex items-center gap-2">
            <Brain className="w-8 h-8 text-princess-pink" />
            أكاديمية الحكمة السحرية
          </h1>
        </div>
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md flex items-center gap-2 border-2 border-pink-100">
          <Trophy className="w-5 h-5 text-princess-gold fill-current" />
          <span className="font-bold text-princess-purple">{profile?.points}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!selectedCourse ? (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {COURSES.map(course => (
                <motion.button
                  key={course.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCourse(course)}
                  className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border-4 border-pink-100 flex flex-col items-center text-center group"
                >
                  <div className={`w-20 h-20 ${course.color} rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:rotate-12 transition-transform`}>
                    {getIcon(course.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-princess-purple mb-2">{course.title}</h3>
                  <p className="text-sm text-pink-400 mb-4">{course.description}</p>
                  <div className="mt-auto w-full bg-pink-50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-princess-pink h-full transition-all duration-1000"
                      style={{ width: `${(Object.values(progress).filter(p => p.courseId === course.id && p.status === 'completed').length / (LESSONS[course.id]?.length || 1)) * 100}%` }}
                    />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : !selectedLesson ? (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-16 h-16 ${selectedCourse.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  {getIcon(selectedCourse.icon)}
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-princess-purple">{selectedCourse.title}</h2>
                  <p className="text-pink-400">{selectedCourse.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {LESSONS[selectedCourse.id]?.map((lesson, index) => (
                  <motion.button
                    key={lesson.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleStartLesson(lesson)}
                    className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border-2 border-pink-100 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${progress[lesson.id]?.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-pink-100 text-princess-pink'}`}>
                        {progress[lesson.id]?.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : index + 1}
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-princess-purple">{lesson.title}</h3>
                        <p className="text-xs text-pink-400">{lesson.points} نقطة سحرية</p>
                      </div>
                    </div>
                    <Play className="w-6 h-6 text-princess-pink opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                )) || (
                  <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-[3rem] border-4 border-dashed border-pink-200">
                    <p className="text-pink-400 text-xl italic">قريباً.. دروس سحرية جديدة في هذا القسم!</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="lesson-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/90 backdrop-blur-md rounded-[3rem] p-8 md:p-12 shadow-2xl border-4 border-pink-100 relative overflow-hidden"
            >
              {!showQuiz ? (
                <div className="text-right">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-princess-purple">{selectedLesson.title}</h2>
                    <span className="bg-pink-100 text-princess-pink px-4 py-2 rounded-full font-bold">
                      {selectedLesson.points} نقطة ✨
                    </span>
                  </div>
                  <div className="prose prose-pink max-w-none mb-12">
                    <p className="text-xl text-princess-purple leading-relaxed">
                      {selectedLesson.content}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    {QUIZZES[selectedLesson.id] ? (
                      <button
                        onClick={handleStartQuiz}
                        className="princess-button py-4 px-12 text-xl flex items-center gap-2"
                      >
                        <HelpCircle className="w-6 h-6" />
                        <span>ابدئي التحدي السحري</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedLesson(null)}
                        className="princess-button py-4 px-12 text-xl"
                      >
                        فهمت الدرس!
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-right">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-princess-purple">التحدي السحري</h2>
                    <div className="flex gap-1">
                      {QUIZZES[selectedLesson.id].questions.map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-3 h-3 rounded-full ${i === currentQuestionIndex ? 'bg-princess-pink' : i < currentQuestionIndex ? 'bg-green-400' : 'bg-pink-100'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-12">
                    <h3 className="text-2xl font-bold text-princess-purple mb-8">
                      {QUIZZES[selectedLesson.id].questions[currentQuestionIndex].text}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {QUIZZES[selectedLesson.id].questions[currentQuestionIndex].options.map((option, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02, backgroundColor: '#fff5f7' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(i)}
                          className="p-6 rounded-2xl border-2 border-pink-100 text-right text-lg font-bold text-princess-purple transition-colors"
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Sparkles */}
      <div className="fixed bottom-10 left-10 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-princess-gold opacity-30" />
        </motion.div>
      </div>
    </div>
  );
}
