export type KidsSection = {
  id: string;
  title: string;
  description: string;
  path: string;
  emoji: string;
  color: string;
};

export type MiniStory = {
  id: string;
  title: string;
  moral: string;
  content: string;
};

export type QuickChallenge = {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
};

export const kidsSections: KidsSection[] = [
  {
    id: 'stories',
    title: 'قصص قصيرة',
    description: 'قصص لطيفة تساعد الأطفال على التعلم والاستمتاع.',
    path: '/kids/stories',
    emoji: '📚',
    color: 'from-fuchsia-400 to-pink-400'
  },
  {
    id: 'games',
    title: 'ألعاب ذكية',
    description: 'تحديات بسيطة لتنشيط التركيز والذاكرة.',
    path: '/kids/games',
    emoji: '🧩',
    color: 'from-sky-400 to-cyan-400'
  }
];

export const miniStories: MiniStory[] = [
  {
    id: 's1',
    title: 'نور والنجمة الصغيرة',
    moral: 'المثابرة تجعل الحلم قريباً.',
    content:
      'في ليلة هادئة، شاهدت نور نجمة صغيرة لا تلمع كثيراً. قالت النجمة: أريد أن أكون مثل باقي النجوم. ابتسمت نور وقالت: لنضيء معاً كل ليلة. كل يوم كانت نور تكتب أمنية جميلة وتقرأها بصوت لطيف. بعد أيام، بدأت النجمة تلمع أكثر وأكثر حتى أصبحت من أجمل النجوم في السماء.'
  },
  {
    id: 's2',
    title: 'سارة وحديقة الألوان',
    moral: 'التعاون يصنع نتائج أجمل.',
    content:
      'دخلت سارة الحديقة ووجدت الزهور حزينة لأن الألوان اختفت. طلبت سارة المساعدة من أصدقائها. أحضر كل طفل لوناً مختلفاً: الأحمر، الأزرق، الأصفر، والأخضر. بدأوا بتلوين اللوحة الكبيرة معاً، فعادت الألوان إلى الزهور وامتلأت الحديقة بالبهجة والضحك.'
  },
  {
    id: 's3',
    title: 'ليان وصندوق اللطف',
    moral: 'الكلمة الطيبة هدية يومية.',
    content:
      'صنعت ليان صندوقاً صغيراً وسمته صندوق اللطف. كل صباح تكتب ورقة فيها كلمة جميلة: شكراً، أحسنت، أنا فخورة بك. كانت توزع الأوراق على من حولها. مع الوقت، صار كل من يقرأ الورقة يبتسم، وانتشرت المحبة في الفصل كله.'
  }
];

export const quickChallenges: QuickChallenge[] = [
  {
    id: 'q1',
    question: 'كم ناتج 2 + 3؟',
    choices: ['4', '5', '6'],
    answerIndex: 1,
    explanation: 'إجابة ممتازة! 2 + 3 = 5.'
  },
  {
    id: 'q2',
    question: 'أي كلمة تعبر عن التعاون؟',
    choices: ['أنا وحدي دائماً', 'نعمل معاً', 'لا أساعد أحداً'],
    answerIndex: 1,
    explanation: 'رائع! التعاون يعني نعمل معاً ونساعد بعض.'
  },
  {
    id: 'q3',
    question: 'أي عادة جيدة قبل النوم؟',
    choices: ['مشاهدة شاشة طويلة', 'تفريش الأسنان', 'تجاوز تنظيف اليدين'],
    answerIndex: 1,
    explanation: 'صحيح! تفريش الأسنان عادة صحية مهمة.'
  }
];
