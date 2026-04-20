import { Badge, Story } from "./types";

export const BADGES: Badge[] = [
  { id: 'courage', name: 'نجمة الشجاعة', icon: 'Shield', description: 'للبطلات اللواتي يواجهن مخاوفهن' },
  { id: 'kindness', name: 'زهرة اللطف', icon: 'Heart', description: 'للبطلات اللواتي يساعدن الآخرين' },
  { id: 'creativity', name: 'جوهرة الإبداع', icon: 'Palette', description: 'للبطلات اللواتي يبتكرن أشياء جديدة' },
  { id: 'cooperation', name: 'جناح التعاون', icon: 'Users', description: 'للبطلات اللواتي يعملن مع الفريق' },
  { id: 'wisdom', name: 'قمر الحكمة', icon: 'Moon', description: 'للبطلات اللواتي يفكرن قبل العمل' },
];

export const LEVELS = [
  { id: 1, name: 'نجمة صغيرة', minPoints: 0 },
  { id: 2, name: 'مستكشفة الأحلام', minPoints: 100 },
  { id: 3, name: 'بطلة سحرية', minPoints: 300 },
  { id: 4, name: 'قائدة شجاعة', minPoints: 600 },
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'رينا والغابة السحرية',
    content: 'كانت رينا في رحلة داخل الغابة السحرية، وفجأة رأت فراشة عالقة في خيوط العنكبوت. ماذا تفعل رينا؟',
    points: 20,
    choices: [
      { text: 'تساعد الفراشة بلطف', points: 10, moral: 'اللطف هو القوة الحقيقية' },
      { text: 'تكمل طريقها للبحث عن الكنز', points: 0, moral: 'مساعدة الآخرين أهم من الكنوز' },
    ],
  },
  {
    id: 'story-2',
    title: 'سر القلعة المفقودة',
    content: 'وجدت رينا مفتاحاً قديماً يلمع تحت ضوء القمر. هل تفتحه الآن أم تنتظر الصباح؟',
    points: 30,
    choices: [
      { text: 'تنتظر الصباح لتكون أكثر حذراً', points: 15, moral: 'الحكمة في التأني' },
      { text: 'تفتحه فوراً بدافع الفضول', points: 5, moral: 'الصبر مفتاح النجاح' },
    ],
  },
];

export const INITIAL_MISSIONS = [
  { title: 'ساعدت أمي في ترتيب غرفتي', points: 50, type: 'daily' },
  { title: 'قرأت صفحة من القرآن الكريم', points: 40, type: 'daily' },
  { title: 'قلت كلمة طيبة لصديقتي اليوم', points: 30, type: 'daily' },
  { title: 'شربت 8 أكواب من الماء', points: 20, type: 'daily' },
  { title: 'صليت الصلوات الخمس في وقتها', points: 100, type: 'daily' },
];

export const COLORS = {
  primary: '#FFB6C1', // Soft Pink
  secondary: '#E6E6FA', // Lavender
  accent: '#87CEEB', // Sky Blue
  success: '#98FB98', // Mint
  warning: '#FFD700', // Light Gold
};
