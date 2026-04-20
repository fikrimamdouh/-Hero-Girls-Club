export type KidsGameCategory =
  | 'memory'
  | 'matching'
  | 'coloring'
  | 'letters'
  | 'numbers'
  | 'puzzle'
  | 'logic'
  | 'arcade';

export interface KidsGameItem {
  id: string;
  title: string;
  category: KidsGameCategory;
  difficulty: 'easy' | 'medium';
  minutes: number;
  emoji: string;
  mode: 'memory' | 'quiz' | 'puzzle' | 'coloring';
}

export const GAMES_LIBRARY: KidsGameItem[] = [
  {
    "id": "g001",
    "title": "توصيل الفواكه",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g002",
    "title": "تلوين الخضروات",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g003",
    "title": "تحدي حروف وسائل النقل",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g004",
    "title": "عدّ الفضاء",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g005",
    "title": "أحجية البحر",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g006",
    "title": "ذكاء المزرعة",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g007",
    "title": "مغامرة الحديقة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g008",
    "title": "ذاكرة الزهور",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g009",
    "title": "توصيل النجوم",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g010",
    "title": "تلوين الأشكال",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g011",
    "title": "تحدي حروف الألوان",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g012",
    "title": "عدّ الحروف العربية",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g013",
    "title": "أحجية الأرقام",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g014",
    "title": "ذكاء المهن",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g015",
    "title": "مغامرة الرياضة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g016",
    "title": "ذاكرة البيت",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g017",
    "title": "توصيل المدرسة",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g018",
    "title": "تلوين الأدوات",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g019",
    "title": "تحدي حروف الطيور",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g020",
    "title": "عدّ الأسماك",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g021",
    "title": "أحجية الغابة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g022",
    "title": "ذكاء الصحراء",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g023",
    "title": "مغامرة الجبال",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g024",
    "title": "ذاكرة الملابس",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g025",
    "title": "توصيل الألعاب",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g026",
    "title": "تلوين الحلويات",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g027",
    "title": "تحدي حروف الطعام الصحي",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g028",
    "title": "عدّ الطقس",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g029",
    "title": "أحجية الفصول الأربعة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g030",
    "title": "ذكاء الحيوانات",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g031",
    "title": "مغامرة الفواكه",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g032",
    "title": "ذاكرة الخضروات",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g033",
    "title": "توصيل وسائل النقل",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g034",
    "title": "تلوين الفضاء",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g035",
    "title": "تحدي حروف البحر",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g036",
    "title": "عدّ المزرعة",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g037",
    "title": "أحجية الحديقة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g038",
    "title": "ذكاء الزهور",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g039",
    "title": "مغامرة النجوم",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g040",
    "title": "ذاكرة الأشكال",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g041",
    "title": "توصيل الألوان",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g042",
    "title": "تلوين الحروف العربية",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g043",
    "title": "تحدي حروف الأرقام",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g044",
    "title": "عدّ المهن",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g045",
    "title": "أحجية الرياضة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g046",
    "title": "ذكاء البيت",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g047",
    "title": "مغامرة المدرسة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g048",
    "title": "ذاكرة الأدوات",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g049",
    "title": "توصيل الطيور",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g050",
    "title": "تلوين الأسماك",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g051",
    "title": "تحدي حروف الغابة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g052",
    "title": "عدّ الصحراء",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g053",
    "title": "أحجية الجبال",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g054",
    "title": "ذكاء الملابس",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g055",
    "title": "مغامرة الألعاب",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g056",
    "title": "ذاكرة الحلويات",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g057",
    "title": "توصيل الطعام الصحي",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g058",
    "title": "تلوين الطقس",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g059",
    "title": "تحدي حروف الفصول الأربعة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g060",
    "title": "عدّ الحيوانات",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g061",
    "title": "أحجية الفواكه",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g062",
    "title": "ذكاء الخضروات",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g063",
    "title": "مغامرة وسائل النقل",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g064",
    "title": "ذاكرة الفضاء",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g065",
    "title": "توصيل البحر",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g066",
    "title": "تلوين المزرعة",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g067",
    "title": "تحدي حروف الحديقة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g068",
    "title": "عدّ الزهور",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g069",
    "title": "أحجية النجوم",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g070",
    "title": "ذكاء الأشكال",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g071",
    "title": "مغامرة الألوان",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g072",
    "title": "ذاكرة الحروف العربية",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g073",
    "title": "توصيل الأرقام",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g074",
    "title": "تلوين المهن",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g075",
    "title": "تحدي حروف الرياضة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g076",
    "title": "عدّ البيت",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g077",
    "title": "أحجية المدرسة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g078",
    "title": "ذكاء الأدوات",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g079",
    "title": "مغامرة الطيور",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g080",
    "title": "ذاكرة الأسماك",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g081",
    "title": "توصيل الغابة",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g082",
    "title": "تلوين الصحراء",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g083",
    "title": "تحدي حروف الجبال",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g084",
    "title": "عدّ الملابس",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g085",
    "title": "أحجية الألعاب",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g086",
    "title": "ذكاء الحلويات",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g087",
    "title": "مغامرة الطعام الصحي",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g088",
    "title": "ذاكرة الطقس",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g089",
    "title": "توصيل الفصول الأربعة",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g090",
    "title": "تلوين الحيوانات",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g091",
    "title": "تحدي حروف الفواكه",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g092",
    "title": "عدّ الخضروات",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g093",
    "title": "أحجية وسائل النقل",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g094",
    "title": "ذكاء الفضاء",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g095",
    "title": "مغامرة البحر",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g096",
    "title": "ذاكرة المزرعة",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g097",
    "title": "توصيل الحديقة",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g098",
    "title": "تلوين الزهور",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g099",
    "title": "تحدي حروف النجوم",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g100",
    "title": "عدّ الأشكال",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g101",
    "title": "أحجية الألوان",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g102",
    "title": "ذكاء الحروف العربية",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g103",
    "title": "مغامرة الأرقام",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g104",
    "title": "ذاكرة المهن",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g105",
    "title": "توصيل الرياضة",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g106",
    "title": "تلوين البيت",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g107",
    "title": "تحدي حروف المدرسة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g108",
    "title": "عدّ الأدوات",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g109",
    "title": "أحجية الطيور",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g110",
    "title": "ذكاء الأسماك",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g111",
    "title": "مغامرة الغابة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g112",
    "title": "ذاكرة الصحراء",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g113",
    "title": "توصيل الجبال",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g114",
    "title": "تلوين الملابس",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g115",
    "title": "تحدي حروف الألعاب",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g116",
    "title": "عدّ الحلويات",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g117",
    "title": "أحجية الطعام الصحي",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g118",
    "title": "ذكاء الطقس",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g119",
    "title": "مغامرة الفصول الأربعة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g120",
    "title": "ذاكرة الحيوانات",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g121",
    "title": "توصيل الفواكه",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g122",
    "title": "تلوين الخضروات",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g123",
    "title": "تحدي حروف وسائل النقل",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g124",
    "title": "عدّ الفضاء",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g125",
    "title": "أحجية البحر",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g126",
    "title": "ذكاء المزرعة",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g127",
    "title": "مغامرة الحديقة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g128",
    "title": "ذاكرة الزهور",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g129",
    "title": "توصيل النجوم",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g130",
    "title": "تلوين الأشكال",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g131",
    "title": "تحدي حروف الألوان",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g132",
    "title": "عدّ الحروف العربية",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g133",
    "title": "أحجية الأرقام",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g134",
    "title": "ذكاء المهن",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g135",
    "title": "مغامرة الرياضة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g136",
    "title": "ذاكرة البيت",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g137",
    "title": "توصيل المدرسة",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g138",
    "title": "تلوين الأدوات",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g139",
    "title": "تحدي حروف الطيور",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g140",
    "title": "عدّ الأسماك",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g141",
    "title": "أحجية الغابة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g142",
    "title": "ذكاء الصحراء",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g143",
    "title": "مغامرة الجبال",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g144",
    "title": "ذاكرة الملابس",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g145",
    "title": "توصيل الألعاب",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g146",
    "title": "تلوين الحلويات",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g147",
    "title": "تحدي حروف الطعام الصحي",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g148",
    "title": "عدّ الطقس",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g149",
    "title": "أحجية الفصول الأربعة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g150",
    "title": "ذكاء الحيوانات",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g151",
    "title": "مغامرة الفواكه",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g152",
    "title": "ذاكرة الخضروات",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g153",
    "title": "توصيل وسائل النقل",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g154",
    "title": "تلوين الفضاء",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g155",
    "title": "تحدي حروف البحر",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g156",
    "title": "عدّ المزرعة",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g157",
    "title": "أحجية الحديقة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g158",
    "title": "ذكاء الزهور",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g159",
    "title": "مغامرة النجوم",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g160",
    "title": "ذاكرة الأشكال",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g161",
    "title": "توصيل الألوان",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g162",
    "title": "تلوين الحروف العربية",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g163",
    "title": "تحدي حروف الأرقام",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g164",
    "title": "عدّ المهن",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g165",
    "title": "أحجية الرياضة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g166",
    "title": "ذكاء البيت",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g167",
    "title": "مغامرة المدرسة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g168",
    "title": "ذاكرة الأدوات",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g169",
    "title": "توصيل الطيور",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g170",
    "title": "تلوين الأسماك",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g171",
    "title": "تحدي حروف الغابة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g172",
    "title": "عدّ الصحراء",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g173",
    "title": "أحجية الجبال",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g174",
    "title": "ذكاء الملابس",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g175",
    "title": "مغامرة الألعاب",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g176",
    "title": "ذاكرة الحلويات",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g177",
    "title": "توصيل الطعام الصحي",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g178",
    "title": "تلوين الطقس",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g179",
    "title": "تحدي حروف الفصول الأربعة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g180",
    "title": "عدّ الحيوانات",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g181",
    "title": "أحجية الفواكه",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g182",
    "title": "ذكاء الخضروات",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g183",
    "title": "مغامرة وسائل النقل",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g184",
    "title": "ذاكرة الفضاء",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g185",
    "title": "توصيل البحر",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g186",
    "title": "تلوين المزرعة",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g187",
    "title": "تحدي حروف الحديقة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g188",
    "title": "عدّ الزهور",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g189",
    "title": "أحجية النجوم",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g190",
    "title": "ذكاء الأشكال",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g191",
    "title": "مغامرة الألوان",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g192",
    "title": "ذاكرة الحروف العربية",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g193",
    "title": "توصيل الأرقام",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g194",
    "title": "تلوين المهن",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g195",
    "title": "تحدي حروف الرياضة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g196",
    "title": "عدّ البيت",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g197",
    "title": "أحجية المدرسة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g198",
    "title": "ذكاء الأدوات",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g199",
    "title": "مغامرة الطيور",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g200",
    "title": "ذاكرة الأسماك",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g201",
    "title": "توصيل الغابة",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g202",
    "title": "تلوين الصحراء",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g203",
    "title": "تحدي حروف الجبال",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g204",
    "title": "عدّ الملابس",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g205",
    "title": "أحجية الألعاب",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g206",
    "title": "ذكاء الحلويات",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g207",
    "title": "مغامرة الطعام الصحي",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g208",
    "title": "ذاكرة الطقس",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g209",
    "title": "توصيل الفصول الأربعة",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g210",
    "title": "تلوين الحيوانات",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g211",
    "title": "تحدي حروف الفواكه",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g212",
    "title": "عدّ الخضروات",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g213",
    "title": "أحجية وسائل النقل",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g214",
    "title": "ذكاء الفضاء",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g215",
    "title": "مغامرة البحر",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g216",
    "title": "ذاكرة المزرعة",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g217",
    "title": "توصيل الحديقة",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g218",
    "title": "تلوين الزهور",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g219",
    "title": "تحدي حروف النجوم",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g220",
    "title": "عدّ الأشكال",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g221",
    "title": "أحجية الألوان",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g222",
    "title": "ذكاء الحروف العربية",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g223",
    "title": "مغامرة الأرقام",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g224",
    "title": "ذاكرة المهن",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g225",
    "title": "توصيل الرياضة",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g226",
    "title": "تلوين البيت",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g227",
    "title": "تحدي حروف المدرسة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g228",
    "title": "عدّ الأدوات",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g229",
    "title": "أحجية الطيور",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g230",
    "title": "ذكاء الأسماك",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g231",
    "title": "مغامرة الغابة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g232",
    "title": "ذاكرة الصحراء",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g233",
    "title": "توصيل الجبال",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g234",
    "title": "تلوين الملابس",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g235",
    "title": "تحدي حروف الألعاب",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g236",
    "title": "عدّ الحلويات",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g237",
    "title": "أحجية الطعام الصحي",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g238",
    "title": "ذكاء الطقس",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g239",
    "title": "مغامرة الفصول الأربعة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g240",
    "title": "ذاكرة الحيوانات",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g241",
    "title": "توصيل الفواكه",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g242",
    "title": "تلوين الخضروات",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g243",
    "title": "تحدي حروف وسائل النقل",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g244",
    "title": "عدّ الفضاء",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g245",
    "title": "أحجية البحر",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g246",
    "title": "ذكاء المزرعة",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g247",
    "title": "مغامرة الحديقة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g248",
    "title": "ذاكرة الزهور",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g249",
    "title": "توصيل النجوم",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g250",
    "title": "تلوين الأشكال",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g251",
    "title": "تحدي حروف الألوان",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g252",
    "title": "عدّ الحروف العربية",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g253",
    "title": "أحجية الأرقام",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g254",
    "title": "ذكاء المهن",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g255",
    "title": "مغامرة الرياضة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g256",
    "title": "ذاكرة البيت",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g257",
    "title": "توصيل المدرسة",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g258",
    "title": "تلوين الأدوات",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g259",
    "title": "تحدي حروف الطيور",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g260",
    "title": "عدّ الأسماك",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g261",
    "title": "أحجية الغابة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g262",
    "title": "ذكاء الصحراء",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g263",
    "title": "مغامرة الجبال",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g264",
    "title": "ذاكرة الملابس",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g265",
    "title": "توصيل الألعاب",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g266",
    "title": "تلوين الحلويات",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g267",
    "title": "تحدي حروف الطعام الصحي",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g268",
    "title": "عدّ الطقس",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g269",
    "title": "أحجية الفصول الأربعة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g270",
    "title": "ذكاء الحيوانات",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g271",
    "title": "مغامرة الفواكه",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g272",
    "title": "ذاكرة الخضروات",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g273",
    "title": "توصيل وسائل النقل",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g274",
    "title": "تلوين الفضاء",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g275",
    "title": "تحدي حروف البحر",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g276",
    "title": "عدّ المزرعة",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g277",
    "title": "أحجية الحديقة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g278",
    "title": "ذكاء الزهور",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g279",
    "title": "مغامرة النجوم",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g280",
    "title": "ذاكرة الأشكال",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g281",
    "title": "توصيل الألوان",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g282",
    "title": "تلوين الحروف العربية",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g283",
    "title": "تحدي حروف الأرقام",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g284",
    "title": "عدّ المهن",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g285",
    "title": "أحجية الرياضة",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g286",
    "title": "ذكاء البيت",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g287",
    "title": "مغامرة المدرسة",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g288",
    "title": "ذاكرة الأدوات",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g289",
    "title": "توصيل الطيور",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g290",
    "title": "تلوين الأسماك",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g291",
    "title": "تحدي حروف الغابة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 4,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g292",
    "title": "عدّ الصحراء",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 5,
    "emoji": "🔢",
    "mode": "memory"
  },
  {
    "id": "g293",
    "title": "أحجية الجبال",
    "category": "puzzle",
    "difficulty": "medium",
    "minutes": 6,
    "emoji": "🧩",
    "mode": "quiz"
  },
  {
    "id": "g294",
    "title": "ذكاء الملابس",
    "category": "logic",
    "difficulty": "easy",
    "minutes": 7,
    "emoji": "💡",
    "mode": "puzzle"
  },
  {
    "id": "g295",
    "title": "مغامرة الألعاب",
    "category": "arcade",
    "difficulty": "medium",
    "minutes": 8,
    "emoji": "🎮",
    "mode": "coloring"
  },
  {
    "id": "g296",
    "title": "ذاكرة الحلويات",
    "category": "memory",
    "difficulty": "easy",
    "minutes": 9,
    "emoji": "🧠",
    "mode": "memory"
  },
  {
    "id": "g297",
    "title": "توصيل الطعام الصحي",
    "category": "matching",
    "difficulty": "medium",
    "minutes": 10,
    "emoji": "🔗",
    "mode": "quiz"
  },
  {
    "id": "g298",
    "title": "تلوين الطقس",
    "category": "coloring",
    "difficulty": "easy",
    "minutes": 11,
    "emoji": "🎨",
    "mode": "puzzle"
  },
  {
    "id": "g299",
    "title": "تحدي حروف الفصول الأربعة",
    "category": "letters",
    "difficulty": "medium",
    "minutes": 12,
    "emoji": "🔤",
    "mode": "coloring"
  },
  {
    "id": "g300",
    "title": "عدّ الحيوانات",
    "category": "numbers",
    "difficulty": "easy",
    "minutes": 3,
    "emoji": "🔢",
    "mode": "memory"
  }
];