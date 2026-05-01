import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const sanitizeText = (value: unknown, fallback = ''): string => {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[<>`$]/g, '').trim().slice(0, 500);
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

// ══════════════════════════════════════════════════════════
//  بنوك المحتوى
// ══════════════════════════════════════════════════════════

const RIDDLE_BANK = [
  { q: 'ما الشيء الذي يحمل بيته أينما سار؟ 🐢', a: 'سلحفاة', hint: 'حيوان بطيء جداً' },
  { q: 'لها أسنان ولا تعض — ما هي؟ 🔧', a: 'مشط', hint: 'تستخدمينها للشعر' },
  { q: 'كلما أخذتَ منها كبُرت — ما هي؟ ⛏️', a: 'حفرة', hint: 'في الأرض' },
  { q: 'تملأ الغرفة ولا تأخذ مكاناً — ما هو؟ ✨', a: 'ضوء', hint: 'يجعلك ترين' },
  { q: 'له عينان ولا يرى — ما هو؟ 🧵', a: 'إبرة', hint: 'تستخدم للخياطة' },
  { q: 'تعدو بلا أرجل وتطير بلا أجنحة — ما هي؟ ☁️', a: 'سحابة', hint: 'في السماء' },
  { q: 'له قلب ولا يحب، وفم ولا يتكلم — ما هو؟ 📚', a: 'كتاب', hint: 'تقرئينه في المدرسة' },
  { q: 'تصعد دائماً ولا تنزل — ما هو؟ ⏳', a: 'العمر', hint: 'يزيد كل سنة' },
  { q: 'ما الشيء الذي تراه مرة في الدقيقة؟ 🔤', a: 'حرف النون', hint: 'حرف عربي' },
  { q: 'ما الشيء الذي يمشي بصمت؟ 🐜', a: 'نملة', hint: 'حشرة صغيرة جداً' },
  { q: 'لها بداية ولا نهاية لها — ما هي؟ ⭕', a: 'دائرة', hint: 'شكل هندسي' },
  { q: 'كلما أسرعتَ فيه طال — ما هو؟ 🌅', a: 'ظل', hint: 'يتبعك في الشمس' },
  { q: 'ما الشيء الذي لو قلتَ اسمه كسرته؟ 🤫', a: 'صمت', hint: 'هدوء تام' },
  { q: 'يأتي بلا دعوة ويذهب بلا إذن — ما هو؟ 😴', a: 'نوم', hint: 'في الليل' },
  { q: 'طار بلا ريش، واحترق بلا نار — ما هو؟ 💭', a: 'خيال', hint: 'في رأسك' },
];

const JOKES_BANK = [
  'سؤال: إيه الحيوان اللي بيكره الأكل؟ 🤔\nالجواب: الكرش! عشانه بيشتغل طول اليوم من غير أجازة! 🤣',
  'طالب قال للمعلمة: الكلب أكل واجبي! 😱\nالمعلمة: هل الكلب يقرأ؟!\nالطالب: لأ... بس بيحب الورق بالبصل! 😂',
  'سؤال: إيه أسرع حاجة في الكون؟ 🚀\nالجواب: الواجب المدرسي — بيخلص في يوم الإجازة بس! 🤣',
  'ولد قال لأمه: أنا بذاكر!\nالأم: قولي 7 × 8؟\nالولد: 56!\nالأم: برافو!\nالولد: آه أنا حافظها من زمان، دي اللي وقعت في الامتحان! 😂',
  'المعلمة: قولي جملة فيها كلمة إن!\nالطالب: إن جبت فين... وسبت المدرسة! 🤣',
  'سؤال: إيه الشيء اللي لما ترميه بيرجعلك؟ 🤔\nالجواب: الواجب! ومعاه تصحيح المعلمة كمان! 😂',
  'طالبة قالت: يا مس أنا ذكية جداً!\nالمعلمة: قولي عاصمة مصر؟\nالطالبة: القاهرة!\nالمعلمة: ممتاز!\nالطالبة: شفتي؟ عرفتها من غير ما أذاكر! 🤣',
  'سؤال: إيه الفرق بين الكتاب والمعلم؟ 🤔\nالجواب: الكتاب ما بيصرخش عليك! 😂',
];

const REENA_WISDOM = [
  'العلم نور يضيء الطريق، والجهل ظلام يُضلّ الخطى.',
  'من طلب العلا سهر الليالي.',
  'التأمل في الكون عبادة، والتفكير فريضة.',
  'خير الكلام ما قلّ ودلّ.',
  'الصبر شجرة جذورها مرّة وثمارها حلوة.',
  'لا يُدرك العلم براحة الجسم.',
  'العقل الهادئ يرى ما لا يراه المتسرع.',
  'من سأل فهم، ومن فهم تقدّم.',
];

const MALIK_HERO_FACTS = [
  'سبايدرمان اخترع خيوطه العلمية بنفسه قبل ما يكون بطلاً — كان عالماً صغيراً! 🔬⚡',
  'باتمان مش عنده قوى خارقة! اتدرب 15 سنة عشان يبقى أقوى إنسان! 💪',
  'سوبرمان الصغير كان بيتدرب كل يوم عشان يتحكم في قواه! 🌽🦸',
  'الكابتن أمريكا كان ضعيف جداً — بس شجاعته جعلت منه الأبطال يختاروه! 💛',
  'وندر وومان تعلمت أكتر من 100 لغة — اللغة سلاح بطولي! 🌍⚡',
  'أنتِ تتعلمين الدروس = تتدربين زي الأبطال! كل واجب هو تدريب قوة! 🦸‍♀️',
];

// ══════════════════════════════════════════════════════════
//  نوع النتيجة
// ══════════════════════════════════════════════════════════

type ChatResult = { text: string; riddleAnswer?: string };

// ══════════════════════════════════════════════════════════
//  المساعد الذكي المحلي
// ══════════════════════════════════════════════════════════

const smartLocalChat = (
  assistantName: string,
  childName: string,
  msg: string,
  riddleContext?: string,
): ChatResult => {
  const name = childName || 'بطلتنا';
  const assistant = assistantName || 'مالك';
  const m = (msg || '').trim();
  const ml = m.toLowerCase();

  const hour = new Date().getHours();
  const isMalik = /مالك/i.test(assistant);
  const isReena = /رينة|ريناء|رينا/i.test(assistant);

  const timeGreet = hour < 12 ? 'صباح النور' : hour < 17 ? 'مساء الخير' : 'مساء النور';

  const self  = isMalik ? 'أنا مالك! 🦸‍♂️⚡'
              : isReena ? 'أنا رينا. 🌙💎'
                        : 'أنا ماريا! 😄🎉';
  const hey   = isMalik ? `${timeGreet} يا ${name}! وقت المهمة!`
              : isReena ? `${timeGreet} يا ${name}.`
                        : `${timeGreet} يا ${name} يا حبيبتي! 😂`;
  const greet = `${self}\n${hey}`;

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const pickRiddle = () => RIDDLE_BANK[Math.floor(Math.random() * RIDDLE_BANK.length)];

  // ── حساب رياضيات فعلي ──
  const mathMatch = m.match(/(\d+)\s*([+\-×x*÷/])\s*(\d+)/);
  if (mathMatch) {
    const a = parseInt(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseInt(mathMatch[3]);
    const ops: Record<string, (x: number, y: number) => number> = {
      '+': (x, y) => x + y,
      '-': (x, y) => x - y,
      '×': (x, y) => x * y,
      'x': (x, y) => x * y,
      '*': (x, y) => x * y,
      '÷': (x, y) => (y !== 0 ? x / y : NaN),
      '/': (x, y) => (y !== 0 ? x / y : NaN),
    };
    const fn = ops[op];
    if (fn) {
      const result = fn(a, b);
      if (!isNaN(result)) {
        const answer = Number.isInteger(result) ? String(result) : result.toFixed(2);
        return {
          text: isMalik
            ? `${greet}\n${a} ${op} ${b} = **${answer}** 🔢⚡\nسبايدرمان بيحسب أسرع! 😄 جربي مسألة أصعب!`
            : isReena
            ? `${greet}\n${a} ${op} ${b} = **${answer}** 💎\nالحساب الصحيح. هل تريدين مسألة أصعب؟ 📖`
            : `${greet}\n${a} ${op} ${b} = **${answer}** 😄🎉\nوصلنا! رياضيات سهلة زي الفطار! 🤣 هاتي تانية!`,
        };
      }
    }
  }

  // ── تحقق من إجابة اللغز ──
  if (riddleContext) {
    const answerNorm = riddleContext.replace(/ال/g, '').toLowerCase();
    const msgNorm    = ml.replace(/ال/g, '');
    const isReveal   = /لا أعرف|مش عارف|ما عرفت|اكشف|الجواب|قولي|مش فاهم|استسلم|هنت/i.test(ml);
    const isCorrect  = !isReveal && (msgNorm.includes(answerNorm) || answerNorm.includes(msgNorm.slice(0, 3)));

    if (isReveal) {
      return {
        text: isMalik
          ? `${greet}\nلا بأس! البطل الذكي يطلب المساعدة! 🦸‍♂️\nالجواب هو: **${riddleContext}** 🎯\nلغز جديد؟ قولي: لغز! ⚡`
          : isReena
          ? `الجواب يا ${name} هو: **${riddleContext}** 💎\nلا تحزني — المهم أنكِ فكرتِ. هل تريدين لغزاً آخر؟ 📖`
          : `هههه مش عارفة؟ عادي! 😂\nالجواب: **${riddleContext}** 🎉\nهاتي لغز تاني! 😄`,
      };
    }

    if (isCorrect) {
      return {
        text: isMalik
          ? `${greet}\n**صح تماماً!! 🎉⚡**\nيا ${name} أنتِ أذكى من سبايدرمان! 🦸‍♀️💥\nالجواب كان **${riddleContext}** — أصبتِ!\nلغز جديد؟ قولي: لغز! 🏆`
          : isReena
          ? `**أجبتِ بشكل صحيح. 💎**\nالجواب: **${riddleContext}**.\nالعقل المتأمل يصل دائماً. 🌙\nهل تريدين لغزاً آخر؟`
          : `**واوووو صح!!!! 🎉🤣**\nأنتِ خرّيجة جامعة الألغاز! 😂🏆\nالجواب **${riddleContext}** — معاكِ بالظبط!\nهاتي لغز تاني! 😄`,
      };
    }

    return {
      text: isMalik
        ? `${greet}\nمش الجواب الصحيح! بس البطل لا يستسلم! 💪\nتلميح: الجواب يبدأ بـ **${riddleContext[0]}** 🎯`
        : isReena
        ? `ليس الجواب الصحيح. 🌙\nتلميح: الجواب من **${riddleContext.length}** أحرف. 💎`
        : `مش الجواب! بس قربتِ! 😂\nتلميح: بيبدأ بـ **${riddleContext[0]}** 😄\nجربي تاني! 🎉`,
      riddleAnswer: riddleContext,
    };
  }

  // ── طلب صورة ──
  if (IMAGE_TRIGGERS.test(ml)) {
    return {
      text: isMalik
        ? `${greet}\nحاضر! مالك لا يرفض أي مهمة! 💥🦸‍♂️\nبس أنا أحسن من سبايدرمان بالرسم! 😂\nستظهر الصورة في ثواني! ⚡`
        : isReena
        ? `${greet}\nلحظة من فضلكِ.\nالصورة الجيدة تستحق الانتظار. 🌙\nسأعرضها عليكِ الآن. تأملي فيها بهدوء. 💎`
        : `${greet}\nرسمة؟! أنا بحب الرسم! 😄🎨\nهاجيبلك صورة حلوة جداً! ✨`,
    };
  }

  // ── ألغاز تفاعلية ──
  if (/لغز|أحجية|تحدي|خمن|اسأل|سؤال صعب/i.test(ml)) {
    const riddle = pickRiddle();
    return {
      text: isMalik
        ? `${greet}\nوقت التحدي يا بطلة! 🦸‍♂️🧩\n\n❓ **${riddle.q}**\n\nاكتبي جوابك! مالك ينتظر! ⚡\n_(تلميح: ${riddle.hint})_`
        : isReena
        ? `${greet}\nسأطرح عليكِ سؤالاً يستحق التأمل. 🌙\n\n❓ **${riddle.q}**\n\nفكري بهدوء... الجواب في عقلكِ. 💎\n_(تلميح: ${riddle.hint})_`
        : `${greet}\nيلا بينا لغز! 😄🧩\n\n❓ **${riddle.q}**\n\nاتفضلي فكري! وأنا بستنى! 😂\n_(تلميح: ${riddle.hint})_`,
      riddleAnswer: riddle.a,
    };
  }

  // ── نكتة ──
  if (/نكتة|نكته|ضحكني|اضحكيني|فكاهة|طرفة|هزر|اضحك/i.test(ml)) {
    const joke = pick(JOKES_BANK);
    return {
      text: isMalik
        ? `${greet}\nمالك مش متخصص نكات — شغلته البطولة! 😄\nبس خد هذه:\n\n${joke}`
        : isReena
        ? `${greet}\nالضحك دواء. 🌙 هذه لطيفة:\n\n${joke}\n\n💎 ${pick(REENA_WISDOM)}`
        : `${greet}\nآه جيتِ في الوقت المناسب! 😂\n\n${joke}\n\nكفاية أو تريدين أكتر؟ 🤣`,
    };
  }

  // ── تحية ──
  if (/مرحب|هاي|أهلا|اهلا|كيف حال|هلا|هلو|سلام|أزيك|ازيك/i.test(ml)) {
    return {
      text: isMalik
        ? pick([
            `${greet}\nالبطل وصل! 🦸‍♂️💥\nسبايدرمان بعت يسلم عليكِ، وباتمان بيستنى الأوامر! 😄\nإيه التحدي اللي تريدين تكسريه؟ ⚡`,
            `${greet}\nتقدري تطلبي: درس، لغز، رسم، حساب، نكتة، أي حاجة! 💪\nأنا مالك جاهز! 🦸‍♂️`,
            `${greet}\n${pick(MALIK_HERO_FACTS)}\nإيه اللي عايزاه النهارده؟ ⚡`,
            `${greet}\nإشارة النجدة وصلتني! 🦸‍♂️⚡\nبماذا تأمرين اليوم يا ${name}؟ 💪`,
          ])
        : isReena
        ? pick([
            `${greet}\n${pick(REENA_WISDOM)} 🌙\nما الذي يشغل تفكيركِ اليوم؟`,
            `${greet}\nيسعدني أن تكوني هنا. 🌙\nما الذي تودين التفكير فيه معاً؟ 📖`,
            `${greet}\nكما قال الحكيم: "السؤال الجيد نصف الإجابة." 💎\nما الذي يُحيّركِ يا ${name}؟`,
            `${greet}\nدعيني أسمعك. 💎 ما الذي في ذهنكِ الآن؟ 🌙`,
          ])
        : pick([
            `${greet}\nيا نهارك أبيض! 😂\nهنا أضحكك وأساعدك في نفس الوقت! 😄`,
            `${greet}\nآخيراً وصلتِ! كنت بفكر فيكِ! 😂\nإيه اللي نعمله النهارده؟ 🎉`,
            `${greet}\nتقدري تطلبي: نكتة، لغز، رسم، درس، أي حاجة! 😄`,
            `${greet}\nأهلاً يا ضي عيني! 😂\nكيف حالك؟ بجد ولا هزار؟ 🎉`,
          ]),
    };
  }

  // ── دين وقرآن ──
  if (/قرآن|إسلام|دين|صلاة|نبي|رسول|سورة|آية|حديث|الله|دعاء|جنة|رمضان|وضوء|زكاة/i.test(ml)) {
    return {
      text: isMalik
        ? `${greet}\nسؤال عن الدين؟ أقوى سلاح للبطل المسلم! ☪️🦸‍♂️\n\n🌟 أذكارك الصباحية قوة خارقة!\n🌟 القرآن نور في الظلام!\n🌟 الصلاة تشحن طاقة البطل!\n\nقوليلي السؤال وأنا معكِ! ⚡`
        : isReena
        ? `${greet}\nالدين حكمة السماء. 🌙\n"اقرأ باسم ربك الذي خلق" — أول آية في القرآن الكريم. 💎\nالعلم والإيمان طريقان يكتملان معاً.\n\nأخبريني بسؤالك وسنتأمل الإجابة معاً. 📖`
        : `${greet}\nسؤال عن الدين! ماريا بتحب الدين! 😊☪️\nاللي يتعلم دينه بيبقى إنسان حلو!\n\nقوليلي إيه اللي عايزاه وأنا أساعدك! 🎉`,
    };
  }

  // ── إنجليزي ──
  if (/إنجليزي|انجليزي|english|spell|ترجم|كلمة إنجليزية|أبجدية|حروف إنجليزية/i.test(ml)) {
    return {
      text: isMalik
        ? `${greet}\nإنجليزي؟ لغة الأبطال الدولية! 🦸‍♂️🌍\nسبايدرمان بيتكلم إنجليزي وأنا أعلمكِ!\n\n🔤 A = أ، B = ب، C = ك\n💬 I am a hero = أنا بطلة!\n\nقوليلي الكلمة أو الجملة! ⚡`
        : isReena
        ? `${greet}\nاللغة الإنجليزية مدخل للعالم. 🌙\n\n📖 كلمات مفيدة:\n• Book = كتاب\n• Knowledge = معرفة\n• Wisdom = حكمة\n• Study = مذاكرة\n\nأخبريني بالكلمة التي تريدين تعلمها. 💎`
        : `${greet}\nإنجليزي؟ اللغة اللي بتخليكِ تتكلمي مع العالم كله! 😄🌍\n\nFun fact: كلمة Hello = أهلاً!\nكلمة Homework = العدو رقم واحد! 😂\n\nقوليلي إيه الكلمة وأترجمها! 🎉`,
    };
  }

  // ── رياضة ──
  if (/رياضة|كرة قدم|كرة السلة|سباحة|جري|تنس|كرة يد|بطل رياضي|فريق|ملعب/i.test(ml)) {
    return {
      text: isMalik
        ? `${greet}\nرياضة؟ تدريب الأبطال! 🦸‍♂️⚽\nسبايدرمان = تسلق + جري!\nباتمان = كاراتيه + سباحة!\n\nأنتِ بتتدربين زيهم! إيه الرياضة اللي بتمارسيها؟ 💪⚡`
        : isReena
        ? `${greet}\n"الجسم السليم في العقل السليم." 🌙\nالرياضة انضباط، والانضباط حكمة. 💎\n\nأي رياضة تمارسين؟ سنتحدث عن فوائدها. 📖`
        : `${greet}\nرياضة؟ أنا بحب أتفرج عليها أكتر من ما بلعب! 😂\nبس بجد الرياضة بتخليكِ أقوى وأصح!\n\nإيه الرياضة المفضلة عندكِ؟ 🎉`,
    };
  }

  // ── تشجيع ومدح ──
  if (/مش قادر|مش قادرة|تعبت|صعب جداً|فشل|فشلت|مش فاهم|مش فاهمة|يأس|خايف|صعب عليّ|مش هينفع/i.test(ml)) {
    return {
      text: isMalik
        ? `${greet}\nوقفي! البطل ما يستسلمش أبداً! 🦸‍♂️💛\n\nتذكري:\n⭐ سبايدرمان فشل ألف مرة قبل ما ينجح!\n⭐ أنتِ أقوى مما تتخيلين!\n⭐ أنا مالك معكِ حتى آخر لحظة! 💪\n\nقوليلي إيه الصعب وهنواجهه مع بعض! ⚡`
        : isReena
        ? `${greet}\nالصعوبة ليست نهاية الطريق، بل بداية القوة الحقيقية. 🌙\n\n"الصبر شجرة جذورها مرّة وثمارها حلوة." 💎\nكل شيء صعب تتخطينه يجعلك أحكم.\n\nأخبريني بما يصعبكِ وسنفكر فيه معاً بهدوء. 📖`
        : `${greet}\nيا حبيبتي قوليلي! 😊💛\nحتى ماريا بتيأس أحياناً من الواجب! 😂\nبس بعدها بتعدي — وتضحك على نفسها!\n\nإيه اللي صعّبك؟ هنشيله مع بعض! 🎉`,
    };
  }

  // ── رياضيات بالكلام ──
  if (/جمع|طرح|ضرب|قسمة|رياضيات|حساب|عدد|أرقام|مسألة|كسور|المعادلة/i.test(ml)) {
    return {
      text: isMalik
        ? pick([
            `${greet}\nرياضيات؟ المعركة المفضلة! 🦸‍♂️🔢\nكتبي المسألة وأنا أحلها معاكِ! 💥`,
            `${greet}\nسبايدرمان بيحسب زوايا تأرجحه — وأنا بحسب معاكِ! 😄⚡\nقوليلي المسألة!`,
            `${greet}\nخطة الهجوم على الأرقام:\n⚡ الجمع = ضم القوى\n⚡ الطرح = حسم العوائق\n⚡ الضرب = مضاعفة القوة!\nقوليلي المسألة! 💪`,
            `${greet}\n${pick(MALIK_HERO_FACTS)}\nكلهم ذاكروا الرياضيات! قوليلي المسألة! ⚡`,
          ])
        : isReena
        ? pick([
            `${greet}\nالرياضيات منطق وجمال. 🌙\nأخبريني بالمسألة وسنحلها بهدوء خطوة خطوة. 💎`,
            `${greet}\nالأرقام لغة الكون. 🌙\nالحكيم يحل المسألة مرتين: بعقله ثم بقلمه. 📖\nأخبريني بالمسألة.`,
            `${greet}\nلنفكر معاً. 💎 ما المسألة التي تريدين فهمها؟ 📖`,
          ])
        : pick([
            `${greet}\nرياضيات؟ اللي اخترع الضرب كان بيضحك على الجمع! 😂\nبس ماريا هتساعدك! قوليلي المسألة! 😄`,
            `${greet}\nاللي مش فاهمة في الرياضيات تسأل ماريا! 🤣\nقوليلي وهنخلص بسرعة! 🎉`,
            `${greet}\nرياضيات؟ أنا وأنتِ هنحلها مع الضحكة! 😄\nقوليلي المسألة! 🎉`,
          ]),
    };
  }

  // ── علوم ──
  if (/علوم|تجربة|كيمياء|فيزياء|أحياء|نبات|جاذبية|ضوء|طاقة|حيوانات|مناخ|بيئة/i.test(ml)) {
    return {
      text: isMalik
        ? pick([
            `${greet}\nعلوم = أفعال خارقة حقيقية! 🔬🦸‍♂️\nالجاذبية دي اللي سبايدرمان بيتحداها!\nقوليلي الموضوع! 🚀`,
            `${greet}\nكل تجربة علمية = مهمة سرية! 🔬⚡\nأخبريني بالموضوع ونبدأ العملية! 💪`,
            `${greet}\n${pick(MALIK_HERO_FACTS)}\nإيه موضوع العلوم؟ 🔬`,
          ])
        : isReena
        ? pick([
            `${greet}\nالعلوم محادثة بين الإنسان والكون. 🌙\nكل ظاهرة تسأل سؤالاً، والعالِم يسمع بقلبه. 💎\nما الموضوع؟`,
            `${greet}\nالطبيعة كتاب مفتوح. 💎\nمن أمعن النظر تعلم. 🌙\nأخبريني بالموضوع وسنتأمله معاً.`,
            `${greet}\n${pick(REENA_WISDOM)}\nما الذي تريدين فهمه علمياً؟ 📖`,
          ])
        : pick([
            `${greet}\nعلوم؟ بحب العلوم لأنها بتفسرلي ليه السما زرقا مش بنفسجي! 😂\nقوليلي الموضوع! 😄`,
            `${greet}\nعلوم؟ تمام! ماريا موجودة! 🎉\nهنشرح بطريقة مضحكة! 😄`,
            `${greet}\nالعلوم ممتعة لما تتشرح بأسلوب ماريا! 😂🔬\nإيه الموضوع؟ 🎉`,
          ]),
    };
  }

  // ── لغة وقصص ──
  if (/عربي|لغة|قواعد|نحو|قصة|إملاء|كتابة|قراءة|نص|فقرة|تعبير|أدب/i.test(ml)) {
    return {
      text: isMalik
        ? pick([
            `${greet}\nاللغة العربية سلاح البطل الحقيقي! ⚔️🦸‍♂️\nالكلمة الصحيحة أقوى من أي ضربة! قوليلي السؤال! 💥`,
            `${greet}\nحتى سبايدرمان لو اتكلم عربي كان أقوى بكتير! 😄\nقوليلي السؤال ونفتح ملف المهمة! 💪`,
            `${greet}\nعربي؟ دي لغة القرآن والأبطال! 🦸‍♂️\nقوليلي السؤال! ⚡`,
          ])
        : isReena
        ? pick([
            `${greet}\nاللغة العربية لؤلؤة الحضارات. 🌙\nكما قال المتنبي: "أنام ملء جفوني عن شواردها." 💎\nما الذي تودين تعلمه؟ 📖`,
            `${greet}\nكل كلمة عربية لها روح وتاريخ. 💎\nأخبريني بالسؤال وسنتأمل اللغة معاً. 🌙`,
            `${greet}\nاللغة مرآة الحضارة. 🌙\n${pick(REENA_WISDOM)}\nما سؤالك؟ 📖`,
          ])
        : pick([
            `${greet}\nلغة عربية؟ أنا اخترعت جملة "الواجب صعب"! 😂\nبس ماريا تساعدك! قوليلي السؤال! 😄`,
            `${greet}\nعربي؟ تعالي نخلص منه بضحكة! 🤣\nإيه السؤال؟ 🎉`,
            `${greet}\nاللغة العربية حلوة لما تتشرح بطريقة ماريا! 😂\nقوليلي! 😄`,
          ]),
    };
  }

  // ── واجبات ومذاكرة ──
  if (/واجب|درس|مذاكر|امتحان|اختبار|مادة|مدرسة|معلمة|حصة|منهج/i.test(ml)) {
    return {
      text: isMalik
        ? pick([
            `${greet}\nامتحان؟ معركة! مذاكرة؟ تدريب! 🦸‍♂️💥\nباتمان ذاكر كل حاجة قبل ما يحارب! 😄\n\nخطة التدريب:\n⚡ 25 دقيقة تركيز كامل\n⚡ 5 دقيقة راحة للبطل\n⚡ راجعي الأسلحة = المعلومات!\n\nأي مادة نبدأ؟ 💪`,
            `${greet}\nكل درس تذاكريه = تدريب قوة! 🦸‍♂️⚡\nالبطل اللي ما بيذاكرش بيخسر المعركة! 😄\nأي مادة؟ 💪`,
            `${greet}\n${pick(MALIK_HERO_FACTS)}\nكلهم ذاكروا وتعلموا! أنتِ زيهم! 💪\nأي مادة الصعبة؟ ⚡`,
          ])
        : isReena
        ? pick([
            `${greet}\nالامتحان اختبار للعقل لا للذاكرة فقط. 🌙\nالحكيم يفهم ثم يحفظ. 💎\nأخبريني بالمادة وسندرسها بعمق. 📖`,
            `${greet}\n"من طلب العلا سهر الليالي." 🌙\nالمذاكرة استثمار للمستقبل. 💎\nما المادة التي تريدين فهمها؟`,
            `${greet}\nالفهم العميق أفضل من الحفظ السريع. 💎\nأخبريني بالموضوع وسنبني الفهم خطوة خطوة. 🌙`,
          ])
        : pick([
            `${greet}\nامتحان؟ 😱😂\nأنا أول ما سمعت امتحان قلت امتي المحان؟ 🤣\nبس ماريا هتساعدك! إيه المادة؟ 😄`,
            `${greet}\nواجب؟ عدو ماريا الأول! 😂\nبس بنحاربه مع بعض! قوليلي المادة! 🎉`,
            `${greet}\nمذاكرة؟ خليها مضحكة زي ما ماريا بتعمل! 😄\nإيه المادة؟ 🎉`,
          ]),
    };
  }

  // ── مشاعر ──
  if (/شعور|حزين|زعلان|خايف|متوتر|قلق|مبسوط|سعيد|وحيد|تعبان|فرحان|زعلت|بكي/i.test(ml)) {
    return {
      text: isMalik
        ? pick([
            `${greet}\nحتى سبايدرمان بيحس بخوف أحياناً! 🦸‍♂️💛\nبس البطل بيقول خايف بس رايح!\nقوليلي إيه اللي بتحسي بيه! ⚡`,
            `${greet}\nالمشاعر مش ضعف — دي إنسانية! 💛🦸‍♂️\nأنا مالك ومعاكِ! قوليلي! 💪`,
          ])
        : isReena
        ? pick([
            `${greet}\nالمشاعر رسائل من الداخل. 🌙\nالحزن يُعلّمنا قيمة الفرح. 💎\nأخبريني بهدوء... ماذا تحملين؟ 📖`,
            `${greet}\nكل شعور له معنى يستحق التأمل. 💎\nالعقل الهادئ يرى ما وراء المشاعر. 🌙\nأخبريني. 📖`,
          ])
        : pick([
            `${greet}\nيا حبيبتي قوليلي! 😊💛\nحتى ماريا بتحس بكل حاجة بس بتخبيها ورا الضحكة! 😂\nإيه اللي في قلبك؟ 🎉`,
            `${greet}\nأنا هنا! 😊💛\nقوليلي وهنتكلم بجدية — ماريا بتعرف تبقى جدية أحياناً! 😂`,
          ]),
    };
  }

  // ── تاريخ وجغرافيا ──
  if (/تاريخ|جغرافيا|خريطة|بلد|دول|قارة|نهر|جبل|صحراء|حضارة|فراعنة|ملوك|عرب/i.test(ml)) {
    return {
      text: isMalik
        ? pick([
            `${greet}\nتاريخ؟ يعني قصص أبطال حقيقيين! 🏰⚔️🦸‍♂️\nصلاح الدين أقوى من باتمان! 💥\nقوليلي الموضوع ونسافر في الزمن! 🚀`,
            `${greet}\nالمقاتلون الأبطال في التاريخ العربي أقوى من أي سوبرهيرو! 💥\nإيه الموضوع؟ 🦸‍♂️`,
          ])
        : isReena
        ? pick([
            `${greet}\nالتاريخ ذاكرة الأمم. 🌙\nمن لا يعرف ماضيه لا يملك مستقبله. 💎\nما الحضارة التي تودين فهمها؟ 📖`,
            `${greet}\nكل حضارة تركت حكمة للبشرية. 🌙\n${pick(REENA_WISDOM)}\nما الموضوع؟ 💎`,
          ])
        : pick([
            `${greet}\nتاريخ؟ أنا بحب التاريخ لأن فيه ناس ميتين مش بتلاوش! 😂\nبجد ممتع! إيه الموضوع؟ 🎬😄`,
            `${greet}\nتاريخ؟ يلا أحكيه زي قصة فيلم! 🎬😄\nإيه الموضوع؟ 🎉`,
          ]),
    };
  }

  // ── من أنت؟ ──
  if (/مين أنت|من أنت|عرفيني|هتساعد|بتقدر|تقدري|قولي عن نفسك/i.test(ml)) {
    return {
      text: isMalik
        ? `${greet}\nأنا مالك! بطل خارق في خدمتكِ! 🦸‍♂️⚡\n\nقدراتي:\n💥 أحسب الرياضيات فوراً\n💥 أحكيلك ألغاز وأحجيات\n💥 أرسم لكِ صور مجاناً 🎨\n💥 أشرح العلوم والتاريخ والدين\n💥 أشجعك لما تتعبي 💛\n\nلا مهمة مستحيلة يا ${name}! 💪`
        : isReena
        ? `${greet}\nأنا رينا. 🌙\nأؤمن بأن الهدوء قوة، والتفكير سلاح، والصبر حكمة.\n\nأساعدكِ في:\n📖 الدروس والمعرفة\n💎 الحكمة والتأمل\n🌙 الأسئلة العميقة\n🎨 الصور والإبداع\n🧩 الألغاز الفكرية\n\nما الذي تحتاجين فهمه يا ${name}؟`
        : `${greet}\nأنا ماريا! 😄\nبيميزني:\n😂 بضحكك وأشرحلك في نفس الوقت\n🤣 عندي نكات وألغاز\n😄 بشرح الدروس الصعبة بطريقة مضحكة\n🎨 بجيبلك رسومات حلوة!\n\nجربيني يا ${name}! 🎉`,
    };
  }

  // ── ردود عامة ──
  return {
    text: isMalik
      ? pick([
          `${greet}\nكل سؤال مهمة جديدة! 🦸‍♂️💥\nتقدري تطلبي: درس، لغز، رسم، نكتة، حساب!\nإيه اللي عايزاه؟ 💪`,
          `${greet}\nمهمة جديدة! 🦸‍♂️⚡\nقوليلي:\n❓ إيه الموضوع؟\n❓ إيه الجزء الصعب؟\nهنحله مع بعض! 💪`,
          `${greet}\nإشارة النجدة وصلتني! 🦸‍♂️⚡\nما الذي تحتاجين مساعدة فيه؟`,
          `${greet}\n${pick(MALIK_HERO_FACTS)}\nإيه سؤالك؟ ⚡`,
        ])
      : isReena
      ? pick([
          `${greet}\nكل سؤال يستحق التأمل. 🌙\n"العجلة من الشيطان، والتأني من الرحمن." 💎\nأخبريني ماذا تودين معرفته. 📖`,
          `${greet}\nالسؤال الغامض يفتح أكبر الأبواب. 🌙\nما الذي تريدين التفكير فيه معاً؟ 💎`,
          `${greet}\n${pick(REENA_WISDOM)} 🌙\nما سؤالك يا ${name}؟ 📖`,
          `${greet}\nتقدري تسأليني عن: درس، حكمة، لغز، رسم...\nأنا هنا بهدوء لكِ. 💎`,
        ])
      : pick([
          `${greet}\nسؤال؟ جاهزة أضحك وأشرح! 😄\nتقدري تطلبي: نكتة، لغز، رسم، درس، أي حاجة! 🎉`,
          `${greet}\nأوه سؤال؟ تمام تمام! 😄\nقوليلي إيه اللي في بالك! 🎉`,
          `${greet}\nماريا موجودة! 😂 قوليلي! 🎉`,
          `${greet}\nيلا بينا! 😄 إيه اللي في بالك؟ 🎉`,
        ]),
  };
};

// ══════════════════════════════════════════════════════════
//  AI Fallback helpers
// ══════════════════════════════════════════════════════════

const hasSpecificCategory = (msg: string): boolean => {
  const m = msg;
  return (
    /لغز|أحجية|تحدي|خمن/.test(m) ||
    /نكتة|نكته|ضحكني|اضحكيني|اضحكني/.test(m) ||
    /مرحب|هاي|أهلا|اهلا|كيف حال|هلا|هلو|سلام عليكم|صباح|مساء|ازيك|ازيكِ/.test(m) ||
    /قرآن|إسلام|دين|صلاة|صلوا|نبي|رسول|الله|سبحان|بسملة|حديث/.test(m) ||
    /إنجليزي|انجليزي|english/i.test(m) ||
    /رياضة|كرة قدم|كرة السلة|كرة|سباحة|جري/.test(m) ||
    /مش قادر|مش قادرة|تعبت|صعب جداً|صعب جدا|فشل|فشلت|استسلم/.test(m) ||
    /جمع|طرح|ضرب|قسمة|رياضيات|حساب/.test(m) ||
    /\d+\s*[+\-×x*÷/]\s*\d+/.test(m) ||
    /علوم|تجربة|كيمياء|فيزياء/.test(m) ||
    /عربي|لغة|قواعد|نحو|إملاء/.test(m) ||
    /واجب|درس|مذاكر|امتحان|دراسة/.test(m) ||
    /شعور|حزين|زعلان|خايف|خوف|حزن/.test(m) ||
    /تاريخ|جغرافيا|خريطة/.test(m) ||
    /مين أنت|من أنت|عرفيني|اعرفيني/.test(m) ||
    /قصة|احكيلي|حكاية/.test(m) ||
    IMAGE_TRIGGERS.test(m)
  );
};

const generateChatAIResponse = async (
  assistantName: string,
  childName: string,
  msg: string,
  chatHistory: Array<{ role: string; content: string }>
): Promise<string | null> => {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  if (!geminiKey) return null;

  const isMalik = /مالك/.test(assistantName);
  const isReena = /رينا|ريناء|رينة/.test(assistantName);
  const persona = isMalik
    ? "أنت مالك، مساعد ذكي مرح يحب الأبطال الخارقين، تشرح بأسلوب حماسي ومثير للأطفال."
    : isReena
    ? "أنت رينا، مساعدة حكيمة وهادئة، تشرح بأسلوب تأملي بسيط مناسب للأطفال."
    : "أنت ماريا، مساعدة مرحة وخفيفة الدم، تشرح بأسلوب مضحك وممتع للأطفال.";

  const recentContext = (chatHistory || [])
    .filter(m => m.role === "user" || m.role === "assistant")
    .slice(-4)
    .map(m => `${m.role === "user" ? "الطفلة" : "المساعد"}: ${m.content}`)
    .join("\n");

  const fullPrompt =
    `${persona}\n` +
    `تتحدثين مع طفلة اسمها ${childName} عمرها 6-12 سنة.\n` +
    `القواعد: رد بالعربية البسيطة، الرد قصير (2-4 جمل فقط)، لا تذكر أنك برنامج، محتوى مناسب للأطفال.\n` +
    (recentContext ? `\nسياق المحادثة:\n${recentContext}\n` : "") +
    `\nالطفلة تسأل الآن: ${msg}\n` +
    `اجب مباشرة باختصار:`;

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await (ai as any).models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });
    return response.text?.trim() || null;
  } catch (e) {
    console.log("[chat] AI fallback failed:", (e as Error).message);
    return null;
  }
};

// ══════════════════════════════════════════════════════════
//  Vercel Handler
// ══════════════════════════════════════════════════════════

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const chatHistory = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const assistantName = sanitizeText(req.body?.assistantData?.name, 'مالك');
  const childName     = sanitizeText(req.body?.childName, 'بطلتنا');
  const lastMessage   = sanitizeText(
    chatHistory?.[chatHistory.length - 1]?.content ||
    chatHistory?.[chatHistory.length - 1]?.text || ''
  );
  const riddleContext = typeof req.body?.riddleContext?.answer === 'string'
    ? req.body.riddleContext.answer.slice(0, 60)
    : undefined;

  const imgPrompt = buildImagePrompt(lastMessage);
  const imageUrl  = imgPrompt ? makePollinationsUrl(imgPrompt) : undefined;
  const result    = smartLocalChat(assistantName, childName, lastMessage, riddleContext);

  let finalText = result.text;
  if (!result.riddleAnswer && !hasSpecificCategory(lastMessage) && lastMessage.length > 4) {
    const aiText = await generateChatAIResponse(assistantName, childName, lastMessage, chatHistory);
    if (aiText) finalText = aiText;
  }

  return res.status(200).json({
    text: finalText,
    ...(imageUrl ? { imageUrl } : {}),
    ...(result.riddleAnswer ? { riddleAnswer: result.riddleAnswer } : {}),
  });
}
