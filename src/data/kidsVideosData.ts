export type VideoCategory = 'all' | 'songs' | 'letters' | 'stories' | 'fun' | 'islamic';

export interface KidsVideo {
  id: string;
  title: string;
  channel: string;
  category: VideoCategory;
  youtubeId: string;
  thumb: string;
  featured?: boolean;
}

export const VIDEO_CATEGORIES: { id: VideoCategory; label: string; icon: string }[] = [
  { id: 'all',      label: 'الكل',         icon: '🌟' },
  { id: 'songs',    label: 'أناشيد',       icon: '🎵' },
  { id: 'letters',  label: 'حروف وأرقام',  icon: '🔤' },
  { id: 'stories',  label: 'قصص',          icon: '📖' },
  { id: 'fun',      label: 'مرح',          icon: '😂' },
  { id: 'islamic',  label: 'إسلامية',      icon: '🕌' },
];

const yt = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export const KIDS_VIDEOS: KidsVideo[] = [
  // ─── طيور الجنة - عصومي ووليد ───
  { id: 'tj-1', title: 'عصومي ووليد - المصعد',          channel: 'طيور الجنة', category: 'fun',     youtubeId: 'mgCKboofY18', thumb: yt('mgCKboofY18'), featured: true },
  { id: 'tj-2', title: 'عصومي ووليد - أسناني واوا',     channel: 'طيور الجنة', category: 'fun',     youtubeId: 'GZCofNw5U60', thumb: yt('GZCofNw5U60') },
  { id: 'tj-3', title: 'عصومي ووليد - لما طلعوا',       channel: 'طيور الجنة', category: 'fun',     youtubeId: 'Jyc8UiAvWOk', thumb: yt('Jyc8UiAvWOk') },
  { id: 'tj-4', title: 'الأمورة جنى',                    channel: 'طيور الجنة', category: 'songs',   youtubeId: 'E0KSqRrV_gM', thumb: yt('E0KSqRrV_gM'), featured: true },
  { id: 'tj-5', title: 'سلسلة أغاني المهن',              channel: 'طيور الجنة', category: 'songs',   youtubeId: 'bO4R3FJmvaM', thumb: yt('bO4R3FJmvaM') },
  { id: 'tj-6', title: 'عصومي وليد - بدايتهم',           channel: 'طيور الجنة', category: 'fun',     youtubeId: 'BNQ-DHhoYFA', thumb: yt('BNQ-DHhoYFA') },
  { id: 'tj-7', title: 'بابا جابلي بالون',               channel: 'طيور الجنة', category: 'songs',   youtubeId: '_LkB6dgVKXM', thumb: yt('_LkB6dgVKXM') },
  { id: 'tj-8', title: 'يا قمر يا قمري',                 channel: 'طيور الجنة', category: 'songs',   youtubeId: 'gYW0LXKYxpw', thumb: yt('gYW0LXKYxpw') },
  { id: 'tj-9', title: 'بابا فين',                       channel: 'طيور الجنة', category: 'songs',   youtubeId: 'eRn4q7Y1Kbo', thumb: yt('eRn4q7Y1Kbo') },
  { id: 'tj-10', title: 'حلويات',                         channel: 'طيور الجنة', category: 'songs',   youtubeId: 'LjkqWk6PKqE', thumb: yt('LjkqWk6PKqE') },
  { id: 'tj-11', title: 'بسبس يا بسبوس',                  channel: 'طيور الجنة', category: 'songs',   youtubeId: 'D4fJh51SYaA', thumb: yt('D4fJh51SYaA') },

  // ─── كراميش - الحروف والأرقام ───
  { id: 'km-1', title: 'أنشودة الحروف - ألف أرنب',       channel: 'كراميش',     category: 'letters', youtubeId: '5j_UCxIEgj4', thumb: yt('5j_UCxIEgj4'), featured: true },
  { id: 'km-2', title: 'أنشودة الحروف - نسخة جديدة',     channel: 'كراميش',     category: 'letters', youtubeId: '2Au1BxQLPVE', thumb: yt('2Au1BxQLPVE') },
  { id: 'km-3', title: 'حروف الأبجدية بدون موسيقى',     channel: 'كراميش',     category: 'letters', youtubeId: 'OQs8g1DN55o', thumb: yt('OQs8g1DN55o') },
  { id: 'km-4', title: 'أغنية الحروف الأبجدية العربية',  channel: 'كراميش',     category: 'letters', youtubeId: 'FjzbP8brR84', thumb: yt('FjzbP8brR84'), featured: true },
  { id: 'km-5', title: 'أنشودة الأرقام بالعربية',         channel: 'كراميش',     category: 'letters', youtubeId: 'YxYP5aQ7vQ4', thumb: yt('YxYP5aQ7vQ4') },
  { id: 'km-6', title: 'أنشودة الألوان',                  channel: 'كراميش',     category: 'songs',   youtubeId: 'iV3pAA_qZcc', thumb: yt('iV3pAA_qZcc') },
  { id: 'km-7', title: 'أيام الأسبوع',                    channel: 'كراميش',     category: 'letters', youtubeId: 'X4Z2j2QVf2g', thumb: yt('X4Z2j2QVf2g') },
  { id: 'km-8', title: 'فصول السنة',                      channel: 'كراميش',     category: 'letters', youtubeId: 'MhfZIO2XUE0', thumb: yt('MhfZIO2XUE0') },

  // ─── مرح ─ كرتون آدم ومشمش ───
  { id: 'am-1', title: 'آدم ومشمش - الجزء 1',             channel: 'آدم ومشمش',  category: 'stories', youtubeId: '5L5kPPUNXTE', thumb: yt('5L5kPPUNXTE'), featured: true },
  { id: 'am-2', title: 'آدم ومشمش - الجزء 2',             channel: 'آدم ومشمش',  category: 'stories', youtubeId: 'pJtbkJBrpdM', thumb: yt('pJtbkJBrpdM') },
  { id: 'am-3', title: 'آدم ومشمش - رمضان',               channel: 'آدم ومشمش',  category: 'islamic', youtubeId: 'h3GxbBQDxF8', thumb: yt('h3GxbBQDxF8') },
  { id: 'am-4', title: 'آدم ومشمش - حلقات متنوعة',         channel: 'آدم ومشمش',  category: 'stories', youtubeId: '3zSUzr2Oqk4', thumb: yt('3zSUzr2Oqk4') },

  // ─── محتوى تعليمي تربوي ───
  { id: 'ed-1', title: 'تعلم الحروف العربية للأطفال',    channel: 'تعليم بالعربية', category: 'letters', youtubeId: 'BjL_Y0gJfYo', thumb: yt('BjL_Y0gJfYo') },
  { id: 'ed-2', title: 'الأرقام من 1 إلى 10 للأطفال',     channel: 'تعليم بالعربية', category: 'letters', youtubeId: 'pPMRVAgyUaY', thumb: yt('pPMRVAgyUaY') },
  { id: 'ed-3', title: 'أشكال هندسية للأطفال',            channel: 'تعليم بالعربية', category: 'letters', youtubeId: 'ZsLQM-gE3iM', thumb: yt('ZsLQM-gE3iM') },
  { id: 'ed-4', title: 'الفاكهة بالعربية',                channel: 'تعليم بالعربية', category: 'letters', youtubeId: 'WlJvMP2f50A', thumb: yt('WlJvMP2f50A') },
  { id: 'ed-5', title: 'الحيوانات بالعربية',              channel: 'تعليم بالعربية', category: 'letters', youtubeId: 'mIQOUrlF1XE', thumb: yt('mIQOUrlF1XE') },

  // ─── إسلامي ───
  { id: 'is-1', title: 'سورة الفاتحة للأطفال',            channel: 'القرآن للأطفال', category: 'islamic', youtubeId: 'fxAKqXWh9HM', thumb: yt('fxAKqXWh9HM'), featured: true },
  { id: 'is-2', title: 'سورة الإخلاص',                     channel: 'القرآن للأطفال', category: 'islamic', youtubeId: 'i2ELJrSt29Y', thumb: yt('i2ELJrSt29Y') },
  { id: 'is-3', title: 'أركان الإسلام',                    channel: 'القرآن للأطفال', category: 'islamic', youtubeId: 'JmUWnDc-3WY', thumb: yt('JmUWnDc-3WY') },
  { id: 'is-4', title: 'دعاء الصباح والمساء',              channel: 'القرآن للأطفال', category: 'islamic', youtubeId: 'M_2-c3kXWA8', thumb: yt('M_2-c3kXWA8') },
  { id: 'is-5', title: 'قصة سيدنا يوسف',                   channel: 'قصص الأنبياء',   category: 'islamic', youtubeId: '5dnDGAwL58g', thumb: yt('5dnDGAwL58g') },
  { id: 'is-6', title: 'قصة سيدنا نوح',                    channel: 'قصص الأنبياء',   category: 'islamic', youtubeId: 'pTm9HbkXnAQ', thumb: yt('pTm9HbkXnAQ') },

  // ─── قصص ───
  { id: 'st-1', title: 'قصة الأرنب والسلحفاة',             channel: 'قصص الأطفال',    category: 'stories', youtubeId: 'q9Q5b_CrVqI', thumb: yt('q9Q5b_CrVqI') },
  { id: 'st-2', title: 'قصة الذئب والخراف السبعة',         channel: 'قصص الأطفال',    category: 'stories', youtubeId: 'NZJN-WX1Dlg', thumb: yt('NZJN-WX1Dlg') },
  { id: 'st-3', title: 'سندريلا',                          channel: 'قصص الأطفال',    category: 'stories', youtubeId: 'Yn7hTm9V96Y', thumb: yt('Yn7hTm9V96Y'), featured: true },
  { id: 'st-4', title: 'الجميلة والوحش',                    channel: 'قصص الأطفال',    category: 'stories', youtubeId: 'aVCG2KjMlmM', thumb: yt('aVCG2KjMlmM') },
  { id: 'st-5', title: 'بياض الثلج',                        channel: 'قصص الأطفال',    category: 'stories', youtubeId: 'XS5GDWwkGRk', thumb: yt('XS5GDWwkGRk') },
  { id: 'st-6', title: 'علاء الدين والمصباح السحري',         channel: 'قصص الأطفال',    category: 'stories', youtubeId: 'mAgdg3iX1mU', thumb: yt('mAgdg3iX1mU') },

  // ─── أناشيد إضافية ───
  { id: 'sg-1', title: 'أنشودة المعلمة',                    channel: 'لونا',           category: 'songs',   youtubeId: 'hY5PkVxhRtA', thumb: yt('hY5PkVxhRtA') },
  { id: 'sg-2', title: 'أنشودة الحضانة',                    channel: 'لونا',           category: 'songs',   youtubeId: 'rIhPoKcbcoA', thumb: yt('rIhPoKcbcoA') },
  { id: 'sg-3', title: 'أنشودة بابا',                        channel: 'لونا',           category: 'songs',   youtubeId: 'b5JpDFwBxzY', thumb: yt('b5JpDFwBxzY') },
  { id: 'sg-4', title: 'أنشودة ماما',                        channel: 'لونا',           category: 'songs',   youtubeId: 'k0bjehRXh84', thumb: yt('k0bjehRXh84') },
  { id: 'sg-5', title: 'كل عام وانتم بخير',                   channel: 'لونا',           category: 'songs',   youtubeId: 'O0HCJD1pj8s', thumb: yt('O0HCJD1pj8s') },

  // ─── مرح إضافي ───
  { id: 'fn-1', title: 'مغامرات أنوار - حلقة 1',             channel: 'أنوار',           category: 'fun',     youtubeId: '7e1VHzEK7zM', thumb: yt('7e1VHzEK7zM') },
  { id: 'fn-2', title: 'سلسلة هل تعلم؟',                     channel: 'هل تعلم',         category: 'fun',     youtubeId: '8x5N1eR_NgU', thumb: yt('8x5N1eR_NgU') },
  { id: 'fn-3', title: 'مغامرات سندباد',                     channel: 'سندباد',          category: 'fun',     youtubeId: 'Wnv5j6Dt_Bk', thumb: yt('Wnv5j6Dt_Bk') },
];
