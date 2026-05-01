import type { VercelRequest, VercelResponse } from '@vercel/node';

const sanitizeText = (value: unknown, fallback = ''): string => {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[<>`$]/g, '').trim().slice(0, 500);
};

const smartLocalChat = (assistantName: string, childName: string, msg: string): string => {
  const name = childName || 'بطلتنا';
  const assistant = assistantName || 'مالك';
  const m = (msg || '').toLowerCase();

  const isMalik = /مالك/i.test(assistant);
  const isReena = /رينة|ريناء|رينا/i.test(assistant);
  // ماريا = default

  const self  = isMalik ? 'أنا مالك البطل الخارق! 🛡️⚡'
              : isReena ? 'أنا رينا الخيالية! 🎨✨'
                        : 'أنا ماريا الذكية! 📘💡';
  const hey   = isMalik ? `هيا يا بطلتي ${name}!`
              : isReena ? `أهلاً يا صديقتي ${name}!`
                        : `معاكِ يا ${name}!`;
  const greet = `${self}\n${hey}`;

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // ── طلب صورة ──
  if (IMAGE_TRIGGERS.test(m)) {
    return isMalik
      ? `${greet}\nمهمة الرسم بدأت! أنا مالك وأنا قادر أرسم لكِ أي شيء ⚡🎨\nستظهر صورتك في لحظات! 🛡️`
      : isReena
      ? `${greet}\nيا سلام! أنا رينا وأعشق الرسم والألوان أكتر من أي شيء! 🌈🎨\nستظهر لوحتك الجميلة هنا 👇 (ثواني فقط!)`
      : `${greet}\nأنا ماريا وسأنظّم لكِ الصورة خطوة بخطوة! 📘🎨\nجاري الإنشاء الآن... ستظهر قريباً ✅`;
  }

  // ── تحية ──
  if (/مرحب|هاي|أهلا|اهلا|كيف حال|صباح|مساء|هلا|هلو/i.test(m)) {
    return isMalik
      ? pick([
          `${greet}\nأنا مالك البطل الخارق وأنا هنا خصيصاً عشانك! 🛡️⚡\nأقدر أساعدك في الواجبات، الأسئلة، الأفكار، والرسم!\nإيه المهمة اللي نبدأ بيها؟ 💪`,
          `${greet}\nأنا مالك! يسعدني أشوفك النهارده يا بطلة! 🌟\nجاهز أساعدك في أي تحدٍّ تواجهينه!\nما الذي تريدين إنجازه اليوم؟ ⚡`,
        ])
      : isReena
      ? pick([
          `${greet}\nأنا رينا الخيالية وأنا سعيدة جداً بوجودك هنا! ✨🎨\nأقدر أساعدك في الدروس بأسلوب ممتع وأرسم لكِ أي شيء!\nإيه اللي في بالك؟ 🌈`,
          `${greet}\nأنا رينا! عالمي مليان ألوان وخيال! 💫\nاسأليني أي سؤال وسأحوّله لمغامرة ممتعة!\nما الذي تودين استكشافه؟ 🌸`,
        ])
      : pick([
          `${greet}\nأنا ماريا الذكية وهنا لمساعدتك بطريقة منظمة ومضمونة! 📘✅\nأقدر أساعدك في الواجبات، المذاكرة، وتنظيم أفكارك.\nإيه الذي تريدين البدء بيه؟ 💡`,
          `${greet}\nأنا ماريا! أحب الترتيب والخطوات الواضحة! 📋\nأقدر أساعدك تفهمي أي درس بطريقة سهلة.\nأخبريني بما تحتاجينه وسنبدأ فوراً! 🌟`,
        ]);
  }

  // ── رياضيات ──
  if (/جمع|طرح|ضرب|قسمة|رياضيات|حساب|عدد|أرقام|\d+\s*[\+\-\*\/]\s*\d+/i.test(m)) {
    return isMalik
      ? `${greet}\nأنا مالك وأقول لكِ: الرياضيات سلاح البطل الخارق! 🔢⚡\n\n✅ الجمع = نضم القوى معاً\n✅ الطرح = نحسم العوائق\n✅ الضرب = نضاعف القوة!\n\nجربي تحلي المسألة بصوت عالٍ وأنا أصحح معكِ! 💪`
      : isReena
      ? `${greet}\nأنا رينا وأقول لكِ: الأرقام مثل الألوان! 🎨🔢\n\n🌸 الجمع = نضيف ألواناً للوحة\n🌸 الطرح = نمحو بلطف\n🌸 الضرب = نكرر النقشة الجميلة\n\nحلي المسألة وكأنكِ ترسمين خطوة بخطوة! ✏️`
      : `${greet}\nأنا ماريا وأقول لكِ: خطتي في الرياضيات لا تفشل! 📘\n\n1️⃣ اقرأي المسألة مرتين\n2️⃣ اكتبي المعطيات\n3️⃣ اختاري العملية الصحيحة\n4️⃣ احسبي بهدوء\n5️⃣ راجعي الإجابة\n\nأخبريني بالمسألة وسأشرحها معكِ! 📝`;
  }

  // ── علوم ──
  if (/علوم|تجربة|كيمياء|فيزياء|أحياء|نبات|جاذبية|ضوء|طاقة/i.test(m)) {
    return isMalik
      ? `${greet}\nأنا مالك وأقول لكِ: العلوم مغامرة حقيقية! 🔬🚀\n\nكل تجربة = مهمة استكشاف!\n🌍 نلاحظ → 🔭 نتساءل → ⚗️ نجرب → 📝 نكتشف!\n\nأخبريني بالموضوع وسنبدأ معاً! ⚡`
      : isReena
      ? `${greet}\nأنا رينا وأقول لكِ: العلوم مثل الفن! 🎨🔬\n\nتخيلي أن الماء يرسم طريقه...\nوالنبات يلوّن نفسه بالأخضر! 🌈\n\nأخبريني بالموضوع وسأحوّله لقصة علمية سحرية! ✨`
      : `${greet}\nأنا ماريا وأقول لكِ: العلوم منظمة مثلي! 📘\n\n1️⃣ التعريف\n2️⃣ الأمثلة من حياتنا\n3️⃣ التجربة البسيطة\n4️⃣ الاستنتاج\n\nأخبريني بالموضوع وسأشرحه بدقة! ✅`;
  }

  // ── لغة وقصص ──
  if (/عربي|لغة|قواعد|نحو|قصة|إملاء|كتابة|قراءة|نص|فقرة|تعبير/i.test(m)) {
    return isMalik
      ? `${greet}\nأنا مالك وأقول لكِ: اللغة العربية أقوى سلاح عند البطل! ⚔️📖\n\n✨ الفعل = القوة والحركة\n✨ الاسم = الهوية\n✨ الجملة = الرسالة الكاملة!\n\nأخبريني بالسؤال وسنفتح كنز اللغة معاً! 💪`
      : isReena
      ? `${greet}\nأنا رينا وأقول لكِ: اللغة العربية أجمل لوحة في التاريخ! 🖊️🌸\n\nكل قصة عمل فني بالكلمات:\n🌹 البداية = الإطار\n🌹 الوسط = الألوان\n🌹 النهاية = اللمسة الأخيرة\n\nإيه اللي تحبين تكتبينه؟ سأساعدك تصنعي تحفة! 🎨`
      : `${greet}\nأنا ماريا وأقول لكِ: اللغة العربية منهجية وأنا أعرفها! 📘\n\n1️⃣ المقدمة: جملتان\n2️⃣ العرض: 3 أفكار مع أمثلة\n3️⃣ الخاتمة: جملة واحدة قوية\n\nأخبريني بالموضوع وسنبنيه معاً! ✅`;
  }

  // ── واجبات ومذاكرة ──
  if (/واجب|درس|مذاكر|امتحان|اختبار|مادة|مدرسة|معلمة|حصة/i.test(m)) {
    return isMalik
      ? `${greet}\nأنا مالك وأقول لكِ: كل امتحان معركة يفوز فيها من يستعد! 💪🛡️\n\nخطة مالك:\n⏱️ 25 دقيقة دراسة\n😴 5 دقائق راحة\n📝 راجعي ما تعلمتِ\n🏆 كافئي نفسك!\n\nأي مادة نفتح معها؟ ⚡`
      : isReena
      ? `${greet}\nأنا رينا وأقول لكِ: المذاكرة رحلة خيالية! ✨📚\n\nطريقتي السحرية:\n🎨 ارسمي الأفكار كخريطة ملوّنة\n🌈 لوّني ملاحظاتك\n⭐ ضعي نجمة على كل فكرة فهمتيها!\n\nإيه الدرس اللي نستكشفه معاً؟ 🌸`
      : `${greet}\nأنا ماريا وأقول لكِ: المذاكرة المنظمة = نتيجة ممتازة! 📘✅\n\n1️⃣ اقرأي الدرس كاملاً\n2️⃣ اكتبي النقاط الرئيسية\n3️⃣ افهمي كل نقطة بمثال\n4️⃣ راجعي بدون الكتاب\n5️⃣ حلي أسئلة تجريبية\n\nأي درس عندكِ؟ نبدأ! 💡`;
  }

  // ── إبداع وفن ──
  if (/فن|تصمي|زخرف|موسيقى|أغني|نشيد|إبداع|اختراع/i.test(m)) {
    return isReena
      ? `${greet}\nأنا رينا وهذا عالمي بالضبط! 💡🎨\n\nنصائح رينا للإبداع:\n🌸 ابدأي بفكرة بسيطة\n🌸 اختاري 3 ألوان أساسية\n🌸 لا تخافي من الأخطاء!\n🌸 وقّعي على كل عمل بفخر 🖌️\n\nأخبريني عن مشروعك! أنا متحمسة! ✨`
      : isMalik
      ? `${greet}\nأنا مالك وأقول لكِ: الإبداع قوة خارقة مثل قوتي! 🛡️🎨\n\nكل رسمة رسالة بطولية!\nكل فكرة جديدة انتصار!\nابدأي صغيرة وستكبر فكرتك 💪\n\nأخبريني بفكرتك! ⚡`
      : `${greet}\nأنا ماريا وأقول لكِ: حتى الفن له خطوات! 📘🎨\n\n1️⃣ حددي الفكرة\n2️⃣ اختاري الأدوات\n3️⃣ من الكبير للصغير\n4️⃣ أضيفي التفاصيل\n\nأخبريني بمشروعك وسأساعدك! ✅`;
  }

  // ── مشاعر ──
  if (/شعور|حزين|زعلان|خايف|متوتر|قلقان|مبسوط|سعيد|وحيد|تعبان/i.test(m)) {
    return isMalik
      ? `${greet}\nأنا مالك وأقول لكِ: البطل الحقيقي يواجه مشاعره بشجاعة! 🛡️💛\n\n⭐ كل يوم صعب يصنع بطلة أقوى\n⭐ أنتِ أقوى مما تتخيلين\n⭐ أنا مالك معكِ دائماً! 💪\n\nكيف أساعدك اليوم؟`
      : isReena
      ? `${greet}\nأنا رينا وأقول لكِ: مشاعرك ألوان لوحتك الداخلية! 🌸✨\n\n💛 الفرح = الأصفر المضيء\n💙 الحزن = الأزرق الهادئ\n🌹 الأمل = الوردي الدافئ\n\nأخبريني ماذا تشعرين وسنحوّله لشيء جميل! 🎨`
      : `${greet}\nأنا ماريا وأقول لكِ: مشاعرك طبيعية ومهمة! 📘💛\n\n1️⃣ تنفسي بعمق 3 مرات\n2️⃣ سمّي الشعور بوضوح\n3️⃣ فكري في سببه\n4️⃣ ابحثي عن حل أو شخص تثقين به\n\nأنا ماريا هنا معكِ! كيف أساعدك؟ 💡`;
  }

  // ── تاريخ وجغرافيا ──
  if (/تاريخ|جغرافيا|خريطة|بلد|دول|قارة|نهر|جبل|صحراء|حضارة/i.test(m)) {
    return isMalik
      ? `${greet}\nأنا مالك وأقول لكِ: التاريخ مليان أبطال حقيقيين! 🏰⚔️\n\nكل حضارة = مغامرة عملاقة!\nأخبريني بالموضوع وسنسافر في الزمن معاً! 🚀`
      : isReena
      ? `${greet}\nأنا رينا وأقول لكِ: التاريخ لوحة ضخمة من الزمن! 🖼️✨\n\nكل حضارة رسمت لوحتها الخاصة...\nأخبريني بالموضوع وسأحكيه كقصة سحرية! 📖🎨`
      : `${greet}\nأنا ماريا وأقول لكِ: التاريخ علم منظم! 📘🗺️\n\n1️⃣ الزمان والمكان\n2️⃣ الأسباب والنتائج\n3️⃣ الشخصيات وأدوارها\n4️⃣ الدرس المستفاد\n\nأي موضوع عندكِ؟ ✅`;
  }

  // ── من أنت؟ ──
  if (/مين أنت|من أنت|عرفيني|هتساعد|بتقدر|تقدري|أقدر|قولي/i.test(m)) {
    return isMalik
      ? `${greet}\nأنا مالك البطل الخارق! 🛡️⚡\n\nأقدر أساعدك في:\n⚡ جميع المواد الدراسية\n⚡ حل الواجبات والمشاريع\n⚡ الأفكار الإبداعية\n⚡ رسم صور جميلة لكِ مجاناً! 🎨\n\nلا يوجد تحدٍّ يصعب علينا يا ${name}! 💪`
      : isReena
      ? `${greet}\nأنا رينا الخيالية! 🎨✨\n\nأقدر أساعدك في:\n🌸 شرح الدروس بأسلوب إبداعي ممتع\n🌸 كتابة القصص والتعبير\n🌸 الأفكار الفنية والموسيقية\n🌸 رسم لوحات ملوّنة لكِ! 🖌️\n\nاسأليني أي شيء يا ${name}! ✨`
      : `${greet}\nأنا ماريا الذكية! 📘💡\n\nأقدر أساعدك في:\n✅ جميع المواد الدراسية\n✅ تنظيم الواجبات وخطط المذاكرة\n✅ تبسيط الدروس الصعبة\n✅ رسم صور تعليمية جميلة! 🎨\n\nأخبريني بما تحتاجين يا ${name} وسنبدأ فوراً! 💡`;
  }

  // ── ردود عامة ──
  return isMalik
    ? pick([
        `${greet}\nأنا مالك وأنا هنا لمساعدتك في أي شيء! 🛡️⚡\n\nأخبريني:\n💭 ما المادة أو الموضوع؟\n💭 ما الجزء الصعب؟\n\nلا تترددي، أنا لا أرفض مساعدة! 💪`,
        `${greet}\nأنا مالك البطل وكل سؤال مهمة جديدة! ⚡\n\nشاركيني التفاصيل:\n- ما المادة؟\n- ما الجزء الصعب؟\n\nمعاً سننجز المهمة! 🛡️`,
      ])
    : isReena
    ? pick([
        `${greet}\nأنا رينا وكل سؤال بداية مغامرة! ✨🌈\n\nأخبريني:\n🌸 ما الموضوع الذي تريدين استكشافه؟\n🌸 ما الجزء الذي يحتاج سحر رينا؟\n\nجاهزة نحوّله لشيء جميل! 🎨`,
        `${greet}\nأنا رينا الخيالية وخيالي بلا حدود! 💫\n\nشاركيني:\n- ما الفكرة أو السؤال؟\n\nسأضيف لمستي السحرية! 🌸`,
      ])
    : pick([
        `${greet}\nأنا ماريا وأحب أفهم سؤالك جيداً قبل أن أجيب! 📘\n\n1️⃣ ما المادة بالضبط؟\n2️⃣ ما الجزء الذي يحتاج توضيحاً؟\n3️⃣ هل حاولتِ الإجابة من قبل؟\n\nسأقدم لكِ شرحاً دقيقاً ومرتباً! ✅`,
        `${greet}\nأنا ماريا الذكية وسؤالك وصلني! 💡\n\nحدّدي:\n- المادة الدراسية\n- السؤال المحدد\n- ما فهمتِه حتى الآن\n\nوسأعطيكِ إجابة واضحة ومنظمة! 📘`,
      ]);
};

const IMAGE_TRIGGERS = /ارسم|صور|رسم|صورة|رسمة|ارسملي|صورلي|أرسم|صوّر|شكل|لوحة|رسومة/i;

const buildImagePrompt = (msg: string): string | null => {
  if (!IMAGE_TRIGGERS.test(msg)) return null;
  const m = msg.toLowerCase();
  if (/قطة|قطط|كيتي/i.test(m)) return "cute cartoon cat for children colorful kawaii style";
  if (/كلب|جرو/i.test(m)) return "cute cartoon puppy dog for children colorful kawaii style";
  if (/أسد|سبع|ليث/i.test(m)) return "cute cartoon lion for children colorful kawaii";
  if (/ديناصور|دينصور/i.test(m)) return "cute friendly cartoon dinosaur for children colorful";
  if (/أرنب|ارنب/i.test(m)) return "cute cartoon rabbit bunny for children colorful kawaii";
  if (/فراشة|فراشات/i.test(m)) return "beautiful colorful butterfly cartoon for children";
  if (/سمكة|أسماك|سمك/i.test(m)) return "cute colorful cartoon fish underwater for children";
  if (/طائر|عصفور|طيور/i.test(m)) return "cute colorful cartoon bird for children kawaii";
  if (/حيوان/i.test(m)) return "cute colorful cartoon animals for children kawaii style";
  if (/فضاء|كوكب|نجوم|نجمة|مجرة/i.test(m)) return "colorful space planets stars cartoon for children educational";
  if (/قمر/i.test(m)) return "cute cartoon moon and stars for children colorful";
  if (/شمس/i.test(m)) return "cute cartoon smiling sun for children colorful";
  if (/زهرة|وردة|زهور/i.test(m)) return "beautiful colorful cartoon flowers for children";
  if (/شجرة|غابة/i.test(m)) return "colorful cartoon tree forest for children kawaii";
  if (/بحر|موج|شاطئ/i.test(m)) return "colorful cartoon ocean beach for children";
  if (/قوس قزح|ألوان/i.test(m)) return "colorful rainbow cartoon for children cheerful";
  if (/مدينة|منزل|بيت/i.test(m)) return "colorful cartoon town houses for children kawaii";
  if (/أميرة|ملكة|حورية/i.test(m)) return "cute cartoon princess for children colorful fantasy";
  if (/بطل|سوبر|خارق/i.test(m)) return "cute cartoon superhero girl for children colorful";
  if (/تنين/i.test(m)) return "cute friendly cartoon dragon for children colorful kawaii";
  if (/قلعة|قصر/i.test(m)) return "colorful cartoon castle for children fantasy kawaii";
  if (/مبهج|جميل|حلو|مفرح/i.test(m)) return "cheerful colorful cartoon illustration for children happy";
  return "cute colorful cartoon illustration for children happy kawaii style";
};

const makePollinationsUrl = (prompt: string): string => {
  const seed = Math.floor(Math.random() * 9999999);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${seed}&nologo=true&model=flux`;
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const chatHistory = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const assistantName = sanitizeText(req.body?.assistantData?.name, 'مالك');
  const childName = sanitizeText(req.body?.childName, 'بطلتنا');
  const lastMessage = sanitizeText(
    chatHistory?.[chatHistory.length - 1]?.content ||
    chatHistory?.[chatHistory.length - 1]?.text || ''
  );

  const imgPrompt = buildImagePrompt(lastMessage);
  const imageUrl = imgPrompt ? makePollinationsUrl(imgPrompt) : undefined;

  return res.status(200).json({
    text: smartLocalChat(assistantName, childName, lastMessage),
    ...(imageUrl ? { imageUrl } : {})
  });
}
