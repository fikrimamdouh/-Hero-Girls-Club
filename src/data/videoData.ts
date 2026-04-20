export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeId: string;
  category: 'quran_full' | 'interpretation' | 'sunnah' | 'prophets_stories' | 'nasheeds' | 'stories' | 'educational';
  subcategory?: string;
  duration: string;
  description?: string;
  reciter?: string;
}

export const VIDEOS: Video[] = [
  {
    "id": "qf1",
    "title": "سورة الفاتحة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/KCnCpyXWeKI/maxresdefault.jpg",
    "youtubeId": "KCnCpyXWeKI",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الفاتحة بترديد الأطفال."
  },
  {
    "id": "qf2",
    "title": "سورة البقرة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/ZqpSSEtrKw4/maxresdefault.jpg",
    "youtubeId": "ZqpSSEtrKw4",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة البقرة بترديد الأطفال."
  },
  {
    "id": "qf3",
    "title": "سورة آل عمران - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/DzwIRzD7da4/maxresdefault.jpg",
    "youtubeId": "DzwIRzD7da4",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة آل عمران بترديد الأطفال."
  },
  {
    "id": "qf4",
    "title": "سورة النساء - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/ZqpSSEtrKw4/maxresdefault.jpg",
    "youtubeId": "ZqpSSEtrKw4",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة النساء بترديد الأطفال."
  },
  {
    "id": "qf5",
    "title": "سورة المائدة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة المائدة بترديد الأطفال."
  },
  {
    "id": "qf6",
    "title": "سورة الأنعام - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الأنعام بترديد الأطفال."
  },
  {
    "id": "qf7",
    "title": "سورة الأعراف - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الأعراف بترديد الأطفال."
  },
  {
    "id": "qf8",
    "title": "سورة الأنفال - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الأنفال بترديد الأطفال."
  },
  {
    "id": "qf9",
    "title": "سورة التوبة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة التوبة بترديد الأطفال."
  },
  {
    "id": "qf10",
    "title": "سورة يونس - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة يونس بترديد الأطفال."
  },
  {
    "id": "qf11",
    "title": "سورة هود - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة هود بترديد الأطفال."
  },
  {
    "id": "qf12",
    "title": "سورة يوسف - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة يوسف بترديد الأطفال."
  },
  {
    "id": "qf13",
    "title": "سورة الرعد - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الرعد بترديد الأطفال."
  },
  {
    "id": "qf14",
    "title": "سورة إبراهيم - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة إبراهيم بترديد الأطفال."
  },
  {
    "id": "qf15",
    "title": "سورة الحجر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الحجر بترديد الأطفال."
  },
  {
    "id": "qf16",
    "title": "سورة النحل - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة النحل بترديد الأطفال."
  },
  {
    "id": "qf17",
    "title": "سورة الإسراء - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الإسراء بترديد الأطفال."
  },
  {
    "id": "qf18",
    "title": "سورة الكهف - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/ZGdPnQtf3Z4/maxresdefault.jpg",
    "youtubeId": "ZGdPnQtf3Z4",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الكهف بترديد الأطفال."
  },
  {
    "id": "qf19",
    "title": "سورة مريم - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/DzwIRzD7da4/maxresdefault.jpg",
    "youtubeId": "DzwIRzD7da4",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة مريم بترديد الأطفال."
  },
  {
    "id": "qf20",
    "title": "سورة طه - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة طه بترديد الأطفال."
  },
  {
    "id": "qf21",
    "title": "سورة الأنبياء - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الأنبياء بترديد الأطفال."
  },
  {
    "id": "qf22",
    "title": "سورة الحج - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الحج بترديد الأطفال."
  },
  {
    "id": "qf23",
    "title": "سورة المؤمنون - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة المؤمنون بترديد الأطفال."
  },
  {
    "id": "qf24",
    "title": "سورة النور - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة النور بترديد الأطفال."
  },
  {
    "id": "qf25",
    "title": "سورة الفرقان - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الفرقان بترديد الأطفال."
  },
  {
    "id": "qf26",
    "title": "سورة الشعراء - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الشعراء بترديد الأطفال."
  },
  {
    "id": "qf27",
    "title": "سورة النمل - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة النمل بترديد الأطفال."
  },
  {
    "id": "qf28",
    "title": "سورة القصص - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة القصص بترديد الأطفال."
  },
  {
    "id": "qf29",
    "title": "سورة العنكبوت - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة العنكبوت بترديد الأطفال."
  },
  {
    "id": "qf30",
    "title": "سورة الروم - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الروم بترديد الأطفال."
  },
  {
    "id": "qf31",
    "title": "سورة لقمان - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة لقمان بترديد الأطفال."
  },
  {
    "id": "qf32",
    "title": "سورة السجدة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة السجدة بترديد الأطفال."
  },
  {
    "id": "qf33",
    "title": "سورة الأحزاب - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الأحزاب بترديد الأطفال."
  },
  {
    "id": "qf34",
    "title": "سورة سبأ - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة سبأ بترديد الأطفال."
  },
  {
    "id": "qf35",
    "title": "سورة فاطر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة فاطر بترديد الأطفال."
  },
  {
    "id": "qf36",
    "title": "سورة يس - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/ZqpSSEtrKw4/maxresdefault.jpg",
    "youtubeId": "ZqpSSEtrKw4",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة يس بترديد الأطفال."
  },
  {
    "id": "qf37",
    "title": "سورة الصافات - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الصافات بترديد الأطفال."
  },
  {
    "id": "qf38",
    "title": "سورة ص - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة ص بترديد الأطفال."
  },
  {
    "id": "qf39",
    "title": "سورة الزمر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الزمر بترديد الأطفال."
  },
  {
    "id": "qf40",
    "title": "سورة غافر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة غافر بترديد الأطفال."
  },
  {
    "id": "qf41",
    "title": "سورة فصلت - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة فصلت بترديد الأطفال."
  },
  {
    "id": "qf42",
    "title": "سورة الشورى - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الشورى بترديد الأطفال."
  },
  {
    "id": "qf43",
    "title": "سورة الزخرف - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الزخرف بترديد الأطفال."
  },
  {
    "id": "qf44",
    "title": "سورة الدخان - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الدخان بترديد الأطفال."
  },
  {
    "id": "qf45",
    "title": "سورة الجاثية - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الجاثية بترديد الأطفال."
  },
  {
    "id": "qf46",
    "title": "سورة الأحقاف - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الأحقاف بترديد الأطفال."
  },
  {
    "id": "qf47",
    "title": "سورة محمد - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة محمد بترديد الأطفال."
  },
  {
    "id": "qf48",
    "title": "سورة الفتح - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الفتح بترديد الأطفال."
  },
  {
    "id": "qf49",
    "title": "سورة الحجرات - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الحجرات بترديد الأطفال."
  },
  {
    "id": "qf50",
    "title": "سورة ق - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة ق بترديد الأطفال."
  },
  {
    "id": "qf51",
    "title": "سورة الذاريات - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الذاريات بترديد الأطفال."
  },
  {
    "id": "qf52",
    "title": "سورة الطور - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الطور بترديد الأطفال."
  },
  {
    "id": "qf53",
    "title": "سورة النجم - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة النجم بترديد الأطفال."
  },
  {
    "id": "qf54",
    "title": "سورة القمر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة القمر بترديد الأطفال."
  },
  {
    "id": "qf55",
    "title": "سورة الرحمن - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/KCnCpyXWeKI/maxresdefault.jpg",
    "youtubeId": "KCnCpyXWeKI",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الرحمن بترديد الأطفال."
  },
  {
    "id": "qf56",
    "title": "سورة الواقعة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الواقعة بترديد الأطفال."
  },
  {
    "id": "qf57",
    "title": "سورة الحديد - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الحديد بترديد الأطفال."
  },
  {
    "id": "qf58",
    "title": "سورة المجادلة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة المجادلة بترديد الأطفال."
  },
  {
    "id": "qf59",
    "title": "سورة الحشر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الحشر بترديد الأطفال."
  },
  {
    "id": "qf60",
    "title": "سورة الممتحنة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الممتحنة بترديد الأطفال."
  },
  {
    "id": "qf61",
    "title": "سورة الصف - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الصف بترديد الأطفال."
  },
  {
    "id": "qf62",
    "title": "سورة الجمعة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الجمعة بترديد الأطفال."
  },
  {
    "id": "qf63",
    "title": "سورة المنافقون - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة المنافقون بترديد الأطفال."
  },
  {
    "id": "qf64",
    "title": "سورة التغابن - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة التغابن بترديد الأطفال."
  },
  {
    "id": "qf65",
    "title": "سورة الطلاق - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الطلاق بترديد الأطفال."
  },
  {
    "id": "qf66",
    "title": "سورة التحريم - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة التحريم بترديد الأطفال."
  },
  {
    "id": "qf67",
    "title": "سورة الملك - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/ZqpSSEtrKw4/maxresdefault.jpg",
    "youtubeId": "ZqpSSEtrKw4",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الملك بترديد الأطفال."
  },
  {
    "id": "qf68",
    "title": "سورة القلم - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة القلم بترديد الأطفال."
  },
  {
    "id": "qf69",
    "title": "سورة الحاقة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الحاقة بترديد الأطفال."
  },
  {
    "id": "qf70",
    "title": "سورة المعارج - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة المعارج بترديد الأطفال."
  },
  {
    "id": "qf71",
    "title": "سورة نوح - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة نوح بترديد الأطفال."
  },
  {
    "id": "qf72",
    "title": "سورة الجن - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الجن بترديد الأطفال."
  },
  {
    "id": "qf73",
    "title": "سورة المزمل - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة المزمل بترديد الأطفال."
  },
  {
    "id": "qf74",
    "title": "سورة المدثر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة المدثر بترديد الأطفال."
  },
  {
    "id": "qf75",
    "title": "سورة القيامة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة القيامة بترديد الأطفال."
  },
  {
    "id": "qf76",
    "title": "سورة الإنسان - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الإنسان بترديد الأطفال."
  },
  {
    "id": "qf77",
    "title": "سورة المرسلات - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة المرسلات بترديد الأطفال."
  },
  {
    "id": "qf78",
    "title": "سورة النبأ - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/7CLccP_tElk/maxresdefault.jpg",
    "youtubeId": "7CLccP_tElk",
    "category": "quran_full",
    "subcategory": "المصحف كامل",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة النبأ بترديد الأطفال."
  },
  {
    "id": "qf79",
    "title": "سورة النازعات - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة النازعات بترديد الأطفال."
  },
  {
    "id": "qf80",
    "title": "سورة عبس - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة عبس بترديد الأطفال."
  },
  {
    "id": "qf81",
    "title": "سورة التكوير - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة التكوير بترديد الأطفال."
  },
  {
    "id": "qf82",
    "title": "سورة الانفطار - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الانفطار بترديد الأطفال."
  },
  {
    "id": "qf83",
    "title": "سورة المطففين - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة المطففين بترديد الأطفال."
  },
  {
    "id": "qf84",
    "title": "سورة الانشقاق - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الانشقاق بترديد الأطفال."
  },
  {
    "id": "qf85",
    "title": "سورة البروج - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة البروج بترديد الأطفال."
  },
  {
    "id": "qf86",
    "title": "سورة الطارق - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الطارق بترديد الأطفال."
  },
  {
    "id": "qf87",
    "title": "سورة الأعلى - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الأعلى بترديد الأطفال."
  },
  {
    "id": "qf88",
    "title": "سورة الغاشية - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الغاشية بترديد الأطفال."
  },
  {
    "id": "qf89",
    "title": "سورة الفجر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الفجر بترديد الأطفال."
  },
  {
    "id": "qf90",
    "title": "سورة البلد - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة البلد بترديد الأطفال."
  },
  {
    "id": "qf91",
    "title": "سورة الشمس - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الشمس بترديد الأطفال."
  },
  {
    "id": "qf92",
    "title": "سورة الليل - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الليل بترديد الأطفال."
  },
  {
    "id": "qf93",
    "title": "سورة الضحى - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الضحى بترديد الأطفال."
  },
  {
    "id": "qf94",
    "title": "سورة الشرح - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الشرح بترديد الأطفال."
  },
  {
    "id": "qf95",
    "title": "سورة التين - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة التين بترديد الأطفال."
  },
  {
    "id": "qf96",
    "title": "سورة العلق - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة العلق بترديد الأطفال."
  },
  {
    "id": "qf97",
    "title": "سورة القدر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة القدر بترديد الأطفال."
  },
  {
    "id": "qf98",
    "title": "سورة البينة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة البينة بترديد الأطفال."
  },
  {
    "id": "qf99",
    "title": "سورة الزلزلة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الزلزلة بترديد الأطفال."
  },
  {
    "id": "qf100",
    "title": "سورة العاديات - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة العاديات بترديد الأطفال."
  },
  {
    "id": "qf101",
    "title": "سورة القارعة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة القارعة بترديد الأطفال."
  },
  {
    "id": "qf102",
    "title": "سورة التكاثر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة التكاثر بترديد الأطفال."
  },
  {
    "id": "qf103",
    "title": "سورة العصر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة العصر بترديد الأطفال."
  },
  {
    "id": "qf104",
    "title": "سورة الهمزة - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الهمزة بترديد الأطفال."
  },
  {
    "id": "qf105",
    "title": "سورة الفيل - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الفيل بترديد الأطفال."
  },
  {
    "id": "qf106",
    "title": "سورة قريش - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة قريش بترديد الأطفال."
  },
  {
    "id": "qf107",
    "title": "سورة الماعون - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الماعون بترديد الأطفال."
  },
  {
    "id": "qf108",
    "title": "سورة الكوثر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الكوثر بترديد الأطفال."
  },
  {
    "id": "qf109",
    "title": "سورة الكافرون - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الكافرون بترديد الأطفال."
  },
  {
    "id": "qf110",
    "title": "سورة النصر - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة النصر بترديد الأطفال."
  },
  {
    "id": "qf111",
    "title": "سورة المسد - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/PDxBFA4XwY0/maxresdefault.jpg",
    "youtubeId": "PDxBFA4XwY0",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة المسد بترديد الأطفال."
  },
  {
    "id": "qf112",
    "title": "سورة الإخلاص - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/Uufkkk6D2lk/maxresdefault.jpg",
    "youtubeId": "Uufkkk6D2lk",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الإخلاص بترديد الأطفال."
  },
  {
    "id": "qf113",
    "title": "سورة الفلق - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/-3an_itxNNQ/maxresdefault.jpg",
    "youtubeId": "-3an_itxNNQ",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الفلق بترديد الأطفال."
  },
  {
    "id": "qf114",
    "title": "سورة الناس - المصحف المعلم",
    "thumbnail": "https://img.youtube.com/vi/VMRUZG7jGfg/maxresdefault.jpg",
    "youtubeId": "VMRUZG7jGfg",
    "category": "quran_full",
    "subcategory": "المصحف المعلم",
    "duration": "متنوع",
    "description": "تلاوة تعليمية لسورة الناس بترديد الأطفال."
  },
  {
    "id": "ps1",
    "title": "قصة نبي الله نوح عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن نوح."
  },
  {
    "id": "ps2",
    "title": "قصة نبي الله هود عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن هود."
  },
  {
    "id": "ps3",
    "title": "قصة نبي الله صالح عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن صالح."
  },
  {
    "id": "ps4",
    "title": "قصة نبي الله إبراهيم عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن إبراهيم."
  },
  {
    "id": "ps5",
    "title": "قصة نبي الله لوط عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن لوط."
  },
  {
    "id": "ps6",
    "title": "قصة نبي الله إسماعيل عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن إسماعيل."
  },
  {
    "id": "ps7",
    "title": "قصة نبي الله إسحاق عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن إسحاق."
  },
  {
    "id": "ps8",
    "title": "قصة نبي الله يعقوب عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن يعقوب."
  },
  {
    "id": "ps9",
    "title": "قصة نبي الله يوسف عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن يوسف."
  },
  {
    "id": "ps10",
    "title": "قصة نبي الله أيوب عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن أيوب."
  },
  {
    "id": "ps11",
    "title": "قصة نبي الله ذو الكفل عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن ذو الكفل."
  },
  {
    "id": "ps12",
    "title": "قصة نبي الله يونس عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن يونس."
  },
  {
    "id": "ps13",
    "title": "قصة نبي الله شعيب عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن شعيب."
  },
  {
    "id": "ps14",
    "title": "قصة نبي الله موسى عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن موسى."
  },
  {
    "id": "ps15",
    "title": "قصة نبي الله هارون عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن هارون."
  },
  {
    "id": "ps16",
    "title": "قصة نبي الله داوود عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن داوود."
  },
  {
    "id": "ps17",
    "title": "قصة نبي الله سليمان عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن سليمان."
  },
  {
    "id": "ps18",
    "title": "قصة نبي الله إلياس عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن إلياس."
  },
  {
    "id": "ps19",
    "title": "قصة نبي الله اليسع عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن اليسع."
  },
  {
    "id": "ps20",
    "title": "قصة نبي الله زكريا عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن زكريا."
  },
  {
    "id": "ps21",
    "title": "قصة نبي الله يحيى عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن يحيى."
  },
  {
    "id": "ps22",
    "title": "قصة نبي الله عيسى عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن عيسى."
  },
  {
    "id": "ps23",
    "title": "قصة نبي الله محمد ﷺ عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن محمد ﷺ."
  },
  {
    "id": "ps24",
    "title": "قصة نبي الله آدم عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "قصص الأنبياء",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن آدم."
  },
  {
    "id": "ps25",
    "title": "قصة نبي الله نوح عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن نوح."
  },
  {
    "id": "ps26",
    "title": "قصة نبي الله هود عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن هود."
  },
  {
    "id": "ps27",
    "title": "قصة نبي الله صالح عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن صالح."
  },
  {
    "id": "ps28",
    "title": "قصة نبي الله إبراهيم عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن إبراهيم."
  },
  {
    "id": "ps29",
    "title": "قصة نبي الله لوط عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن لوط."
  },
  {
    "id": "ps30",
    "title": "قصة نبي الله إسماعيل عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن إسماعيل."
  },
  {
    "id": "ps31",
    "title": "قصة نبي الله إسحاق عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن إسحاق."
  },
  {
    "id": "ps32",
    "title": "قصة نبي الله يعقوب عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن يعقوب."
  },
  {
    "id": "ps33",
    "title": "قصة نبي الله يوسف عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن يوسف."
  },
  {
    "id": "ps34",
    "title": "قصة نبي الله أيوب عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن أيوب."
  },
  {
    "id": "ps35",
    "title": "قصة نبي الله ذو الكفل عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن ذو الكفل."
  },
  {
    "id": "ps36",
    "title": "قصة نبي الله يونس عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن يونس."
  },
  {
    "id": "ps37",
    "title": "قصة نبي الله شعيب عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن شعيب."
  },
  {
    "id": "ps38",
    "title": "قصة نبي الله موسى عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن موسى."
  },
  {
    "id": "ps39",
    "title": "قصة نبي الله هارون عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن هارون."
  },
  {
    "id": "ps40",
    "title": "قصة نبي الله داوود عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن داوود."
  },
  {
    "id": "ps41",
    "title": "قصة نبي الله سليمان عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن سليمان."
  },
  {
    "id": "ps42",
    "title": "قصة نبي الله إلياس عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن إلياس."
  },
  {
    "id": "ps43",
    "title": "قصة نبي الله اليسع عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن اليسع."
  },
  {
    "id": "ps44",
    "title": "قصة نبي الله زكريا عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن زكريا."
  },
  {
    "id": "ps45",
    "title": "قصة نبي الله يحيى عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن يحيى."
  },
  {
    "id": "ps46",
    "title": "قصة نبي الله عيسى عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن عيسى."
  },
  {
    "id": "ps47",
    "title": "قصة نبي الله محمد ﷺ عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن محمد ﷺ."
  },
  {
    "id": "ps48",
    "title": "قصة نبي الله آدم عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن آدم."
  },
  {
    "id": "ps49",
    "title": "قصة نبي الله نوح عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/DzsYjdntMrU/maxresdefault.jpg",
    "youtubeId": "DzsYjdntMrU",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن نوح."
  },
  {
    "id": "ps50",
    "title": "قصة نبي الله هود عليه السلام",
    "thumbnail": "https://img.youtube.com/vi/beQDZCnTVXM/maxresdefault.jpg",
    "youtubeId": "beQDZCnTVXM",
    "category": "prophets_stories",
    "subcategory": "مغامرات إيمانية",
    "duration": "15:00",
    "description": "حلقة ممتعة من قصص الأنبياء للأطفال عن هود."
  },
  {
    "id": "t1",
    "title": "تفسير سورة الفلق للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الفلق بأسلوب كرتوني مبسط."
  },
  {
    "id": "t2",
    "title": "تفسير سورة الإخلاص للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الإخلاص بأسلوب كرتوني مبسط."
  },
  {
    "id": "t3",
    "title": "تفسير سورة المسد للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة المسد بأسلوب كرتوني مبسط."
  },
  {
    "id": "t4",
    "title": "تفسير سورة النصر للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة النصر بأسلوب كرتوني مبسط."
  },
  {
    "id": "t5",
    "title": "تفسير سورة الكافرون للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الكافرون بأسلوب كرتوني مبسط."
  },
  {
    "id": "t6",
    "title": "تفسير سورة الكوثر للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الكوثر بأسلوب كرتوني مبسط."
  },
  {
    "id": "t7",
    "title": "تفسير سورة الماعون للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الماعون بأسلوب كرتوني مبسط."
  },
  {
    "id": "t8",
    "title": "تفسير سورة قريش للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة قريش بأسلوب كرتوني مبسط."
  },
  {
    "id": "t9",
    "title": "تفسير سورة الفيل للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الفيل بأسلوب كرتوني مبسط."
  },
  {
    "id": "t10",
    "title": "تفسير سورة الهمزة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الهمزة بأسلوب كرتوني مبسط."
  },
  {
    "id": "t11",
    "title": "تفسير سورة العصر للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة العصر بأسلوب كرتوني مبسط."
  },
  {
    "id": "t12",
    "title": "تفسير سورة التكاثر للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة التكاثر بأسلوب كرتوني مبسط."
  },
  {
    "id": "t13",
    "title": "تفسير سورة القارعة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة القارعة بأسلوب كرتوني مبسط."
  },
  {
    "id": "t14",
    "title": "تفسير سورة العاديات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة العاديات بأسلوب كرتوني مبسط."
  },
  {
    "id": "t15",
    "title": "تفسير سورة الزلزلة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الزلزلة بأسلوب كرتوني مبسط."
  },
  {
    "id": "t16",
    "title": "تفسير سورة البينة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة البينة بأسلوب كرتوني مبسط."
  },
  {
    "id": "t17",
    "title": "تفسير سورة القدر للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة القدر بأسلوب كرتوني مبسط."
  },
  {
    "id": "t18",
    "title": "تفسير سورة العلق للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة العلق بأسلوب كرتوني مبسط."
  },
  {
    "id": "t19",
    "title": "تفسير سورة التين للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة التين بأسلوب كرتوني مبسط."
  },
  {
    "id": "t20",
    "title": "تفسير سورة الشرح للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الشرح بأسلوب كرتوني مبسط."
  },
  {
    "id": "t21",
    "title": "تفسير سورة الضحى للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الضحى بأسلوب كرتوني مبسط."
  },
  {
    "id": "t22",
    "title": "تفسير سورة الليل للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الليل بأسلوب كرتوني مبسط."
  },
  {
    "id": "t23",
    "title": "تفسير سورة الشمس للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة الشمس بأسلوب كرتوني مبسط."
  },
  {
    "id": "t24",
    "title": "تفسير سورة البلد للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير مبسط",
    "duration": "08:00",
    "description": "شرح معاني سورة البلد بأسلوب كرتوني مبسط."
  },
  {
    "id": "t25",
    "title": "تفسير سورة الفجر للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الفجر بأسلوب كرتوني مبسط."
  },
  {
    "id": "t26",
    "title": "تفسير سورة الغاشية للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الغاشية بأسلوب كرتوني مبسط."
  },
  {
    "id": "t27",
    "title": "تفسير سورة الأعلى للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الأعلى بأسلوب كرتوني مبسط."
  },
  {
    "id": "t28",
    "title": "تفسير سورة الطارق للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الطارق بأسلوب كرتوني مبسط."
  },
  {
    "id": "t29",
    "title": "تفسير سورة البروج للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة البروج بأسلوب كرتوني مبسط."
  },
  {
    "id": "t30",
    "title": "تفسير سورة الناس للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الناس بأسلوب كرتوني مبسط."
  },
  {
    "id": "t31",
    "title": "تفسير سورة الفلق للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الفلق بأسلوب كرتوني مبسط."
  },
  {
    "id": "t32",
    "title": "تفسير سورة الإخلاص للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الإخلاص بأسلوب كرتوني مبسط."
  },
  {
    "id": "t33",
    "title": "تفسير سورة المسد للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة المسد بأسلوب كرتوني مبسط."
  },
  {
    "id": "t34",
    "title": "تفسير سورة النصر للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة النصر بأسلوب كرتوني مبسط."
  },
  {
    "id": "t35",
    "title": "تفسير سورة الكافرون للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الكافرون بأسلوب كرتوني مبسط."
  },
  {
    "id": "t36",
    "title": "تفسير سورة الكوثر للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الكوثر بأسلوب كرتوني مبسط."
  },
  {
    "id": "t37",
    "title": "تفسير سورة الماعون للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الماعون بأسلوب كرتوني مبسط."
  },
  {
    "id": "t38",
    "title": "تفسير سورة قريش للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة قريش بأسلوب كرتوني مبسط."
  },
  {
    "id": "t39",
    "title": "تفسير سورة الفيل للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الفيل بأسلوب كرتوني مبسط."
  },
  {
    "id": "t40",
    "title": "تفسير سورة الهمزة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الهمزة بأسلوب كرتوني مبسط."
  },
  {
    "id": "t41",
    "title": "تفسير سورة العصر للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة العصر بأسلوب كرتوني مبسط."
  },
  {
    "id": "t42",
    "title": "تفسير سورة التكاثر للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة التكاثر بأسلوب كرتوني مبسط."
  },
  {
    "id": "t43",
    "title": "تفسير سورة القارعة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة القارعة بأسلوب كرتوني مبسط."
  },
  {
    "id": "t44",
    "title": "تفسير سورة العاديات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة العاديات بأسلوب كرتوني مبسط."
  },
  {
    "id": "t45",
    "title": "تفسير سورة الزلزلة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الزلزلة بأسلوب كرتوني مبسط."
  },
  {
    "id": "t46",
    "title": "تفسير سورة البينة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة البينة بأسلوب كرتوني مبسط."
  },
  {
    "id": "t47",
    "title": "تفسير سورة القدر للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة القدر بأسلوب كرتوني مبسط."
  },
  {
    "id": "t48",
    "title": "تفسير سورة العلق للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة العلق بأسلوب كرتوني مبسط."
  },
  {
    "id": "t49",
    "title": "تفسير سورة التين للأطفال",
    "thumbnail": "https://img.youtube.com/vi/GRw-NyED_PA/maxresdefault.jpg",
    "youtubeId": "GRw-NyED_PA",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة التين بأسلوب كرتوني مبسط."
  },
  {
    "id": "t50",
    "title": "تفسير سورة الشرح للأطفال",
    "thumbnail": "https://img.youtube.com/vi/EK5ELGOL3Fg/maxresdefault.jpg",
    "youtubeId": "EK5ELGOL3Fg",
    "category": "interpretation",
    "subcategory": "تفسير السور القصيرة",
    "duration": "08:00",
    "description": "شرح معاني سورة الشرح بأسلوب كرتوني مبسط."
  },
  {
    "id": "s1",
    "title": "أذكار الصباح - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم أذكار الصباح من سنة النبي ﷺ."
  },
  {
    "id": "s2",
    "title": "بر الوالدين - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم بر الوالدين من سنة النبي ﷺ."
  },
  {
    "id": "s3",
    "title": "الصدق - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم الصدق من سنة النبي ﷺ."
  },
  {
    "id": "s4",
    "title": "الأمانة - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم الأمانة من سنة النبي ﷺ."
  },
  {
    "id": "s5",
    "title": "آداب المسجد - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم آداب المسجد من سنة النبي ﷺ."
  },
  {
    "id": "s6",
    "title": "الوضوء - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم الوضوء من سنة النبي ﷺ."
  },
  {
    "id": "s7",
    "title": "الصلاة - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم الصلاة من سنة النبي ﷺ."
  },
  {
    "id": "s8",
    "title": "أذكار النوم - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم أذكار النوم من سنة النبي ﷺ."
  },
  {
    "id": "s9",
    "title": "إماطة الأذى - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم إماطة الأذى من سنة النبي ﷺ."
  },
  {
    "id": "s10",
    "title": "آداب الطعام - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم آداب الطعام من سنة النبي ﷺ."
  },
  {
    "id": "s11",
    "title": "أذكار الصباح - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم أذكار الصباح من سنة النبي ﷺ."
  },
  {
    "id": "s12",
    "title": "بر الوالدين - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم بر الوالدين من سنة النبي ﷺ."
  },
  {
    "id": "s13",
    "title": "الصدق - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم الصدق من سنة النبي ﷺ."
  },
  {
    "id": "s14",
    "title": "الأمانة - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم الأمانة من سنة النبي ﷺ."
  },
  {
    "id": "s15",
    "title": "آداب المسجد - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم آداب المسجد من سنة النبي ﷺ."
  },
  {
    "id": "s16",
    "title": "الوضوء - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم الوضوء من سنة النبي ﷺ."
  },
  {
    "id": "s17",
    "title": "الصلاة - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم الصلاة من سنة النبي ﷺ."
  },
  {
    "id": "s18",
    "title": "أذكار النوم - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم أذكار النوم من سنة النبي ﷺ."
  },
  {
    "id": "s19",
    "title": "إماطة الأذى - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم إماطة الأذى من سنة النبي ﷺ."
  },
  {
    "id": "s20",
    "title": "آداب الطعام - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم آداب الطعام من سنة النبي ﷺ."
  },
  {
    "id": "s21",
    "title": "أذكار الصباح - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم أذكار الصباح من سنة النبي ﷺ."
  },
  {
    "id": "s22",
    "title": "بر الوالدين - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم بر الوالدين من سنة النبي ﷺ."
  },
  {
    "id": "s23",
    "title": "الصدق - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم الصدق من سنة النبي ﷺ."
  },
  {
    "id": "s24",
    "title": "الأمانة - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "آداب يومية",
    "duration": "05:00",
    "description": "تعلم الأمانة من سنة النبي ﷺ."
  },
  {
    "id": "s25",
    "title": "آداب المسجد - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم آداب المسجد من سنة النبي ﷺ."
  },
  {
    "id": "s26",
    "title": "الوضوء - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم الوضوء من سنة النبي ﷺ."
  },
  {
    "id": "s27",
    "title": "الصلاة - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم الصلاة من سنة النبي ﷺ."
  },
  {
    "id": "s28",
    "title": "أذكار النوم - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم أذكار النوم من سنة النبي ﷺ."
  },
  {
    "id": "s29",
    "title": "إماطة الأذى - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم إماطة الأذى من سنة النبي ﷺ."
  },
  {
    "id": "s30",
    "title": "آداب الطعام - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم آداب الطعام من سنة النبي ﷺ."
  },
  {
    "id": "s31",
    "title": "أذكار الصباح - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم أذكار الصباح من سنة النبي ﷺ."
  },
  {
    "id": "s32",
    "title": "بر الوالدين - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم بر الوالدين من سنة النبي ﷺ."
  },
  {
    "id": "s33",
    "title": "الصدق - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم الصدق من سنة النبي ﷺ."
  },
  {
    "id": "s34",
    "title": "الأمانة - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم الأمانة من سنة النبي ﷺ."
  },
  {
    "id": "s35",
    "title": "آداب المسجد - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم آداب المسجد من سنة النبي ﷺ."
  },
  {
    "id": "s36",
    "title": "الوضوء - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم الوضوء من سنة النبي ﷺ."
  },
  {
    "id": "s37",
    "title": "الصلاة - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم الصلاة من سنة النبي ﷺ."
  },
  {
    "id": "s38",
    "title": "أذكار النوم - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم أذكار النوم من سنة النبي ﷺ."
  },
  {
    "id": "s39",
    "title": "إماطة الأذى - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم إماطة الأذى من سنة النبي ﷺ."
  },
  {
    "id": "s40",
    "title": "آداب الطعام - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم آداب الطعام من سنة النبي ﷺ."
  },
  {
    "id": "s41",
    "title": "أذكار الصباح - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم أذكار الصباح من سنة النبي ﷺ."
  },
  {
    "id": "s42",
    "title": "بر الوالدين - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم بر الوالدين من سنة النبي ﷺ."
  },
  {
    "id": "s43",
    "title": "الصدق - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم الصدق من سنة النبي ﷺ."
  },
  {
    "id": "s44",
    "title": "الأمانة - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم الأمانة من سنة النبي ﷺ."
  },
  {
    "id": "s45",
    "title": "آداب المسجد - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم آداب المسجد من سنة النبي ﷺ."
  },
  {
    "id": "s46",
    "title": "الوضوء - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم الوضوء من سنة النبي ﷺ."
  },
  {
    "id": "s47",
    "title": "الصلاة - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم الصلاة من سنة النبي ﷺ."
  },
  {
    "id": "s48",
    "title": "أذكار النوم - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم أذكار النوم من سنة النبي ﷺ."
  },
  {
    "id": "s49",
    "title": "إماطة الأذى - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/ZUCS_cR9cY8/maxresdefault.jpg",
    "youtubeId": "ZUCS_cR9cY8",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم إماطة الأذى من سنة النبي ﷺ."
  },
  {
    "id": "s50",
    "title": "آداب الطعام - أخلاق المسلم الصغير",
    "thumbnail": "https://img.youtube.com/vi/J7q8f6g0UMw/maxresdefault.jpg",
    "youtubeId": "J7q8f6g0UMw",
    "category": "sunnah",
    "subcategory": "أخلاق المسلم",
    "duration": "05:00",
    "description": "تعلم آداب الطعام من سنة النبي ﷺ."
  },
  {
    "id": "ed1",
    "title": "تعلم الأرقام للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الأرقام."
  },
  {
    "id": "ed2",
    "title": "تعلم الألوان للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الألوان."
  },
  {
    "id": "ed3",
    "title": "تعلم الأشكال للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الأشكال."
  },
  {
    "id": "ed4",
    "title": "تعلم الحواس الخمس للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الحواس الخمس."
  },
  {
    "id": "ed5",
    "title": "تعلم الفواكه للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الفواكه."
  },
  {
    "id": "ed6",
    "title": "تعلم الخضروات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الخضروات."
  },
  {
    "id": "ed7",
    "title": "تعلم فصول السنة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن فصول السنة."
  },
  {
    "id": "ed8",
    "title": "تعلم أعضاء الجسم للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن أعضاء الجسم."
  },
  {
    "id": "ed9",
    "title": "تعلم وسائل المواصلات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن وسائل المواصلات."
  },
  {
    "id": "ed10",
    "title": "تعلم الحروف العربية للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الحروف العربية."
  },
  {
    "id": "ed11",
    "title": "تعلم الأرقام للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الأرقام."
  },
  {
    "id": "ed12",
    "title": "تعلم الألوان للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الألوان."
  },
  {
    "id": "ed13",
    "title": "تعلم الأشكال للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الأشكال."
  },
  {
    "id": "ed14",
    "title": "تعلم الحواس الخمس للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الحواس الخمس."
  },
  {
    "id": "ed15",
    "title": "تعلم الفواكه للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الفواكه."
  },
  {
    "id": "ed16",
    "title": "تعلم الخضروات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الخضروات."
  },
  {
    "id": "ed17",
    "title": "تعلم فصول السنة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن فصول السنة."
  },
  {
    "id": "ed18",
    "title": "تعلم أعضاء الجسم للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن أعضاء الجسم."
  },
  {
    "id": "ed19",
    "title": "تعلم وسائل المواصلات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن وسائل المواصلات."
  },
  {
    "id": "ed20",
    "title": "تعلم الحروف العربية للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الحروف العربية."
  },
  {
    "id": "ed21",
    "title": "تعلم الأرقام للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الأرقام."
  },
  {
    "id": "ed22",
    "title": "تعلم الألوان للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الألوان."
  },
  {
    "id": "ed23",
    "title": "تعلم الأشكال للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الأشكال."
  },
  {
    "id": "ed24",
    "title": "تعلم الحواس الخمس للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الحواس الخمس."
  },
  {
    "id": "ed25",
    "title": "تعلم الفواكه للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الفواكه."
  },
  {
    "id": "ed26",
    "title": "تعلم الخضروات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الخضروات."
  },
  {
    "id": "ed27",
    "title": "تعلم فصول السنة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن فصول السنة."
  },
  {
    "id": "ed28",
    "title": "تعلم أعضاء الجسم للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن أعضاء الجسم."
  },
  {
    "id": "ed29",
    "title": "تعلم وسائل المواصلات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن وسائل المواصلات."
  },
  {
    "id": "ed30",
    "title": "تعلم الحروف العربية للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الحروف العربية."
  },
  {
    "id": "ed31",
    "title": "تعلم الأرقام للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الأرقام."
  },
  {
    "id": "ed32",
    "title": "تعلم الألوان للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الألوان."
  },
  {
    "id": "ed33",
    "title": "تعلم الأشكال للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الأشكال."
  },
  {
    "id": "ed34",
    "title": "تعلم الحواس الخمس للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الحواس الخمس."
  },
  {
    "id": "ed35",
    "title": "تعلم الفواكه للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الفواكه."
  },
  {
    "id": "ed36",
    "title": "تعلم الخضروات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الخضروات."
  },
  {
    "id": "ed37",
    "title": "تعلم فصول السنة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن فصول السنة."
  },
  {
    "id": "ed38",
    "title": "تعلم أعضاء الجسم للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن أعضاء الجسم."
  },
  {
    "id": "ed39",
    "title": "تعلم وسائل المواصلات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن وسائل المواصلات."
  },
  {
    "id": "ed40",
    "title": "تعلم الحروف العربية للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الحروف العربية."
  },
  {
    "id": "ed41",
    "title": "تعلم الأرقام للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الأرقام."
  },
  {
    "id": "ed42",
    "title": "تعلم الألوان للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الألوان."
  },
  {
    "id": "ed43",
    "title": "تعلم الأشكال للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الأشكال."
  },
  {
    "id": "ed44",
    "title": "تعلم الحواس الخمس للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الحواس الخمس."
  },
  {
    "id": "ed45",
    "title": "تعلم الفواكه للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الفواكه."
  },
  {
    "id": "ed46",
    "title": "تعلم الخضروات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الخضروات."
  },
  {
    "id": "ed47",
    "title": "تعلم فصول السنة للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن فصول السنة."
  },
  {
    "id": "ed48",
    "title": "تعلم أعضاء الجسم للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن أعضاء الجسم."
  },
  {
    "id": "ed49",
    "title": "تعلم وسائل المواصلات للأطفال",
    "thumbnail": "https://img.youtube.com/vi/a2HHHQrnPlY/maxresdefault.jpg",
    "youtubeId": "a2HHHQrnPlY",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن وسائل المواصلات."
  },
  {
    "id": "ed50",
    "title": "تعلم الحروف العربية للأطفال",
    "thumbnail": "https://img.youtube.com/vi/7i68cD70dEE/maxresdefault.jpg",
    "youtubeId": "7i68cD70dEE",
    "category": "educational",
    "subcategory": "محتوى تعليمي",
    "duration": "10:00",
    "description": "فيديو تعليمي تفاعلي عن الحروف العربية."
  },
  {
    "id": "n_st1",
    "title": "أنشودة وقصة البطلة رقم 1",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st2",
    "title": "أنشودة وقصة البطلة رقم 2",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st3",
    "title": "أنشودة وقصة البطلة رقم 3",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st4",
    "title": "أنشودة وقصة البطلة رقم 4",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st5",
    "title": "أنشودة وقصة البطلة رقم 5",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st6",
    "title": "أنشودة وقصة البطلة رقم 6",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st7",
    "title": "أنشودة وقصة البطلة رقم 7",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st8",
    "title": "أنشودة وقصة البطلة رقم 8",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st9",
    "title": "أنشودة وقصة البطلة رقم 9",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st10",
    "title": "أنشودة وقصة البطلة رقم 10",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st11",
    "title": "أنشودة وقصة البطلة رقم 11",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st12",
    "title": "أنشودة وقصة البطلة رقم 12",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st13",
    "title": "أنشودة وقصة البطلة رقم 13",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st14",
    "title": "أنشودة وقصة البطلة رقم 14",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st15",
    "title": "أنشودة وقصة البطلة رقم 15",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st16",
    "title": "أنشودة وقصة البطلة رقم 16",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st17",
    "title": "أنشودة وقصة البطلة رقم 17",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st18",
    "title": "أنشودة وقصة البطلة رقم 18",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st19",
    "title": "أنشودة وقصة البطلة رقم 19",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st20",
    "title": "أنشودة وقصة البطلة رقم 20",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st21",
    "title": "أنشودة وقصة البطلة رقم 21",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st22",
    "title": "أنشودة وقصة البطلة رقم 22",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st23",
    "title": "أنشودة وقصة البطلة رقم 23",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st24",
    "title": "أنشودة وقصة البطلة رقم 24",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "nasheeds",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st25",
    "title": "أنشودة وقصة البطلة رقم 25",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st26",
    "title": "أنشودة وقصة البطلة رقم 26",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st27",
    "title": "أنشودة وقصة البطلة رقم 27",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st28",
    "title": "أنشودة وقصة البطلة رقم 28",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st29",
    "title": "أنشودة وقصة البطلة رقم 29",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st30",
    "title": "أنشودة وقصة البطلة رقم 30",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st31",
    "title": "أنشودة وقصة البطلة رقم 31",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st32",
    "title": "أنشودة وقصة البطلة رقم 32",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st33",
    "title": "أنشودة وقصة البطلة رقم 33",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st34",
    "title": "أنشودة وقصة البطلة رقم 34",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st35",
    "title": "أنشودة وقصة البطلة رقم 35",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st36",
    "title": "أنشودة وقصة البطلة رقم 36",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st37",
    "title": "أنشودة وقصة البطلة رقم 37",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st38",
    "title": "أنشودة وقصة البطلة رقم 38",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st39",
    "title": "أنشودة وقصة البطلة رقم 39",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st40",
    "title": "أنشودة وقصة البطلة رقم 40",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st41",
    "title": "أنشودة وقصة البطلة رقم 41",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st42",
    "title": "أنشودة وقصة البطلة رقم 42",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st43",
    "title": "أنشودة وقصة البطلة رقم 43",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st44",
    "title": "أنشودة وقصة البطلة رقم 44",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st45",
    "title": "أنشودة وقصة البطلة رقم 45",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st46",
    "title": "أنشودة وقصة البطلة رقم 46",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st47",
    "title": "أنشودة وقصة البطلة رقم 47",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st48",
    "title": "أنشودة وقصة البطلة رقم 48",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st49",
    "title": "أنشودة وقصة البطلة رقم 49",
    "thumbnail": "https://img.youtube.com/vi/Nm4VE9yGRsY/maxresdefault.jpg",
    "youtubeId": "Nm4VE9yGRsY",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  },
  {
    "id": "n_st50",
    "title": "أنشودة وقصة البطلة رقم 50",
    "thumbnail": "https://img.youtube.com/vi/TGAfKdy-fgg/maxresdefault.jpg",
    "youtubeId": "TGAfKdy-fgg",
    "category": "stories",
    "duration": "06:00",
    "description": "محتوى ترفيهي هادف للبطلات الصغيرات."
  }
];
