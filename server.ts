import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { sendEmail } from "./src/utils/replitmail";
import { startFcmWatcher } from "./server/fcmWatcher";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;
  const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const MAX_INPUT_LENGTH = 500;

  const sanitizeText = (value: unknown, fallback = "") => {
    if (typeof value !== "string") return fallback;
    return value.replace(/[<>`$]/g, "").trim().slice(0, MAX_INPUT_LENGTH);
  };

  const buildSafeDesignFallback = (childName: string, prompt: string, persona: string) => {
    const assistantName = persona || "🛡️ البطل مالك";
    return `مرحباً يا ${childName} 🌟\nأنا ${assistantName} وسأساعدك الآن بخطة سريعة!\n\n1) الفكرة الأساسية:\n${prompt || "تصميم بسيط ومبهج يناسب طفلة مبدعة"}\n\n2) الألوان المقترحة:\nوردي فاتح + بنفسجي + لمسة سماوي.\n\n3) العناصر الجميلة:\nنجوم صغيرة، مكتب مرتب، لوحة إلهام، نبات لطيف.\n\n4) خطوات التنفيذ:\n- ارسم/ي مخططاً بسيطاً.\n- حددي 3 ألوان رئيسية.\n- أضيفي عنصرين مميزين.\n- راجعي الفكرة واكتبي اسم تصميمك.\n\n5) نصيحة تعليمية صغيرة:\nالتخطيط أولاً يجعل أي فكرة أجمل وأسهل ✨`;
  };

  const buildSafeResearchFallback = (title: string) => ({
    title: title || "بحث مدرسي مبسط",
    introduction: "هذا بحث مدرسي مبسط يشرح الفكرة بطريقة سهلة وممتعة ومناسبة للطلاب.",
    sections: [
      {
        heading: "تعريف الموضوع",
        content: "في هذا الجزء نتعرف على الموضوع بشكل بسيط ولماذا هو مهم في حياتنا اليومية.",
        bullets: ["فهم المعنى الأساسي", "أهمية الموضوع", "أمثلة قريبة من حياتنا"]
      },
      {
        heading: "معلومات أساسية",
        content: "نجمع حقائق واضحة وقصيرة تساعدنا على فهم الموضوع دون تعقيد.",
        bullets: ["حقائق مبسطة", "أمثلة مدرسية", "مقارنة صغيرة"]
      },
      {
        heading: "تطبيقات عملية",
        content: "كيف نستفيد من الموضوع في البيت أو المدرسة بطريقة مفيدة وآمنة.",
        bullets: ["تطبيق في المدرسة", "تطبيق في المنزل", "فكرة نشاط صغير"]
      }
    ],
    conclusion: "في النهاية تعلمنا أن المعرفة تبدأ بخطوات بسيطة، وأن البحث يساعدنا على التفكير بشكل أفضل.",
    whatWeLearned: ["رتبنا أفكارنا", "تعلمنا حقائق جديدة", "عرفنا تطبيقات عملية مفيدة"],
    imageQueries: [title || "school research", "education kids", "classroom learning"]
  });

  // ── نوع نتيجة المحادثة ──
  type ChatResult = { text: string; riddleAnswer?: string };

  // ── بنوك المحتوى ──
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
    'سؤال: ليه الجرو قعد قدام الكمبيوتر؟ 🐶\nالجواب: لأنه سمع إن فيه فأرة جوّاه! 😂🤣',
    'طالب سأل المعلم: ليه السمكة بتسبح في المية؟ 🐟\nالمعلم: لأن الحمام بعيد عليها! 🤣😂',
    'ولد قال لأبوه: بابا مش هروح المدرسة النهارده!\nالأب: ليه؟\nالولد: عشان المعلم قال في الفصل شيطان!\nالأب: ومالك؟\nالولد: ماقالش مين! 😂🤣',
    'معلمة: مين يقدر يقولي على حيوان بيبدأ بحرف الألف؟\nطالب: أسد!\nالمعلمة: تاني؟\nالطالب: أسدين! 🤣😂',
    'سؤال: إيه الفرق بين الفيل والكتاب المدرسي؟ 🐘📚\nالجواب: الكتاب أتقل! 😂🤣',
    'سؤال: ليه البومة صاحية طول الليل؟ 🦉\nالجواب: عشان بتذاكر للامتحان! 😂🤣',
    'طالبة قالت للمعلمة: يا مس أنا مش فاهمة حاجة!\nالمعلمة: ليه؟\nالطالبة: لأني فاهمة كل حاجة غلط! 😂🤣',
    'سؤال: إيه الشيء اللي بيكبر كل ما أكلته؟ 🤔\nالجواب: النار! بس متاكلهاش في البيت! 😂🤣',
    'معلم: قولي مثال على شيء طويل!\nطالب: الواجب!\nالمعلم: مثال على شيء أطول!\nالطالب: أسبوع الامتحانات! 😂🤣',
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
    'عنترة بن شداد كان عبداً فأصبح أعظم فارس في التاريخ — الشجاعة تصنع الأبطال! ⚔️🦸‍♂️',
    'صلاح الدين الأيوبي حرر القدس بالحكمة قبل السيف — البطل الذكي ينتصر! 🏰⚡',
    'سيف ذو يزن سافر آلاف الأميال ليحرر وطنه — البطل لا يستسلم أبداً! 🗡️💪',
    'أنتِ تتعلمين الدروس = تتدربين زي الأبطال! كل واجب هو تدريب قوة! 🦸‍♀️',
  ];

  const SONGS_BANK = [
    '🎵 **عصفورة**\nعصفورة عصفورة / طيري يا عصفورة\nفوق الغصن غنّي / والعالم زيّني\nبصوتك الحلو / وجناحك الملوّن 🌈',
    '🎵 **واحد اتنين**\nواحد اتنين / إيدي في إيدين\nثلاثة أربعة / نعيش في سعادة\nخمسة ستة / الدنيا حلوة\nسبعة ثمانية / نلعب ونغنّي 🎶',
    '🎵 **أنا بطلة**\nأنا بطلة صغيرة / شجاعتي كبيرة\nأتعلم كل يوم / وأكبر وأصير\nطبيبة أو مهندسة / أو رائدة فضاء\nطموحي بلا حدود / وهدفي السماء! ⭐',
    '🎵 **المدرسة**\nأحب مدرستي / وأحب كتابي\nمعلمتي تحبني / وأنا أحبها\nكل يوم أتعلم / شيئاً جديداً\nالعلم هو طريقي / لمستقبل مشرق 📚',
    '🎵 **الألوان**\nأحمر وأصفر / وأخضر وأزرق\nألوان قوس قزح / في السماء تلمع\nكل لون يقول / أنا جميل أنا هنا\nوالعالم بألوانه / يملأ قلبنا 🌈',
  ];

  // كلمة اليوم — دوّارة بحسب يوم الأسبوع (0=أحد .. 6=سبت)
  const WORD_OF_DAY = [
    { word: 'شجاعة', meaning: 'أن تفعلي الصواب حتى لو خفتِ', example: 'البطلة تُظهر **شجاعة** حين تدافع عن صديقتها 🦁' },
    { word: 'كَرَم', meaning: 'أن تعطي من تحبّ دون انتظار مقابل', example: 'سارة أظهرت **كَرَماً** حين شاركت غداءها 🌸' },
    { word: 'صِدق', meaning: 'قول الحقيقة دائماً حتى لو كانت صعبة', example: 'البطلة الحقيقية تتكلم بـ**صِدق** دائماً ✨' },
    { word: 'إبداع', meaning: 'التفكير بطريقة جديدة ومختلفة', example: 'رسمتِ لوحة بـ**إبداع** رائع! 🎨' },
    { word: 'صَبر', meaning: 'الانتظار بهدوء حتى تتحقق الأهداف', example: 'الـ**صَبر** جعل البطلة تنجح في آخر المطاف 🌟' },
    { word: 'تَعاوُن', meaning: 'العمل مع الآخرين لتحقيق هدف واحد', example: 'بـ**التَعاوُن** بنينا برجاً رائعاً! 🏗️' },
    { word: 'احترام', meaning: 'تقدير الآخرين والاستماع إليهم', example: 'الـ**احترام** يجعل الجميع يحبونكِ 💜' },
  ];

  // تحدي اليوم — يتغير بحسب يوم الأسبوع
  const DAILY_CHALLENGE = [
    '🎯 **مهمة الأحد:**\nاكتبي 3 أشياء تحبينها في نفسكِ ⭐\n(مثال: أنا ذكية، أنا طيبة، أنا مبدعة)',
    '🎯 **مهمة الاثنين:**\nقولي لأمكِ جملة واحدة تعبّر عن حبكِ لها 💕\n(مثال: "أحبكِ أكثر من النجوم!")',
    '🎯 **مهمة الثلاثاء:**\nتعلّمي كلمة إنجليزية جديدة واستخدميها 3 مرات اليوم 🌍\n(مثال: Brave = شجاعة)',
    '🎯 **مهمة الأربعاء:**\nارسمي شيئاً يجعلكِ سعيدة 🎨\nأرسلي الصورة لصديقتكِ المفضلة!',
    '🎯 **مهمة الخميس:**\nساعدي شخصاً في المنزل بعمل صغير 🏠\n(ترتيب الغرفة، تحضير الطاولة...)',
    '🎯 **مهمة الجمعة:**\nاحفظي آية قرآنية جديدة اليوم 📖\n(اقرئيها لأهلكِ في المساء)',
    '🎯 **مهمة السبت:**\nالعبي لعبة تقوية الذاكرة لمدة 10 دقائق 🧠\n(البطل يدرّب عقله كما يدرّب جسمه!)',
  ];

  const buildSafeChatFallback = (assistantName: string, childName: string, message: string): ChatResult => {
    return smartLocalChat(assistantName, childName, message);
  };

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
              ? `${greet}\n${a} ${op} ${b} = **${answer}** 🔢⚡\nعنترة وسبايدرمان كلاهما كانوا يتدربون! 😄 جربي مسألة أصعب!`
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
            ? `${greet}\n**صح تماماً!! 🎉⚡**\nيا ${name} أنتِ أذكى من سبايدرمان وعنترة معاً! 🦸‍♀️💥\nالجواب كان **${riddleContext}** — أصبتِ!\nلغز جديد؟ قولي: لغز! 🏆`
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
          ? `${greet}\nحاضر! مالك لا يرفض أي مهمة! 💥🦸‍♂️\nأنا أحسن من سبايدرمان وسيف ذو يزن بالرسم! 😂\nستظهر الصورة في ثواني! ⚡`
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
              `${greet}\nالبطل وصل! 🦸‍♂️💥\nسبايدرمان وعنترة بعتوا يسلموا عليكِ! 😄⚔️\nإيه التحدي اللي تريدين تكسريه؟ ⚡`,
              `${greet}\nتقدري تطلبي: درس، لغز، رسم، حساب، نكتة! 💪\nأنا مالك جاهز! 🦸‍♂️`,
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
    if (/إنجليزي|انجليزي|english|ترجم|كلمة إنجليزية|أبجدية|حروف إنجليزية/i.test(ml)) {
      return {
        text: isMalik
          ? `${greet}\nإنجليزي؟ لغة الأبطال الدولية! 🦸‍♂️🌍\nسبايدرمان بيتكلم إنجليزي — وعنترة كان شاعراً! أنا أعلمكِ الاثنين!\n\n🔤 A = أ، B = ب، C = ك\n💬 I am a hero = أنا بطلة!\n\nقوليلي الكلمة أو الجملة! ⚡`
          : isReena
          ? `${greet}\nاللغة الإنجليزية مدخل للعالم. 🌙\n\n📖 كلمات مفيدة:\n• Book = كتاب\n• Knowledge = معرفة\n• Wisdom = حكمة\n\nأخبريني بالكلمة التي تريدين تعلمها. 💎`
          : `${greet}\nإنجليزي؟ اللغة اللي بتخليكِ تتكلمي مع العالم! 😄🌍\nFun fact: كلمة Homework = العدو رقم واحد! 😂\n\nقوليلي إيه الكلمة وأترجمها! 🎉`,
      };
    }

    // ── رياضة ──
    if (/رياضة|كرة قدم|كرة السلة|سباحة|جري|تنس|كرة يد|فريق|ملعب/i.test(ml)) {
      return {
        text: isMalik
          ? `${greet}\nرياضة؟ تدريب الأبطال! 🦸‍♂️⚽\nسبايدرمان = تسلق + جري!\nباتمان = كاراتيه + سباحة!\nعنترة = فروسية + رماح! ⚔️\n\nأنتِ بتتدربين زيهم! إيه الرياضة اللي بتمارسيها؟ 💪⚡`
          : isReena
          ? `${greet}\n"الجسم السليم في العقل السليم." 🌙\nالرياضة انضباط، والانضباط حكمة. 💎\n\nأي رياضة تمارسين؟ سنتحدث عن فوائدها. 📖`
          : `${greet}\nرياضة؟ أنا بحب أتفرج عليها أكتر من ما بلعب! 😂\nبس بجد الرياضة بتخليكِ أقوى وأصح!\n\nإيه الرياضة المفضلة عندكِ؟ 🎉`,
      };
    }

    // ── تشجيع ومدح ──
    if (/مش قادر|مش قادرة|تعبت|صعب جداً|فشل|فشلت|مش فاهم|مش فاهمة|يأس|خايف|صعب عليّ|مش هينفع/i.test(ml)) {
      return {
        text: isMalik
          ? `${greet}\nوقفي! البطل ما يستسلمش أبداً! 🦸‍♂️💛\n\nتذكري:\n⭐ سبايدرمان فشل ألف مرة قبل ما ينجح!\n⭐ صلاح الدين خسر معارك وعاد أقوى! ⚔️\n⭐ أنتِ أقوى مما تتخيلين!\n⭐ أنا مالك معكِ حتى آخر لحظة! 💪\n\nقوليلي إيه الصعب وهنواجهه مع بعض! ⚡`
          : isReena
          ? `${greet}\nالصعوبة ليست نهاية الطريق، بل بداية القوة الحقيقية. 🌙\n\n"الصبر شجرة جذورها مرّة وثمارها حلوة." 💎\nكل شيء صعب تتخطينه يجعلك أحكم.\n\nأخبريني بما يصعبكِ وسنفكر فيه معاً بهدوء. 📖`
          : `${greet}\nيا حبيبتي قوليلي! 😊💛\nحتى ماريا بتيأس أحياناً من الواجب! 😂\nبس بعدها بتعدي — وتضحك على نفسها!\n\nإيه اللي صعّبك؟ هنشيله مع بعض! 🎉`,
      };
    }

    // ── رياضيات بالكلام ──
    if (/جمع|طرح|ضرب|قسمة|رياضيات|حساب|عدد|أرقام|مسألة|كسور/i.test(ml)) {
      return {
        text: isMalik
          ? pick([
              `${greet}\nرياضيات؟ المعركة المفضلة! 🦸‍♂️🔢\nكتبي المسألة وأنا أحلها معاكِ! 💥`,
              `${greet}\nسبايدرمان بيحسب زوايا تأرجحه وسيف ذو يزن كان يحسب حركات المعارك! 😄⚡\nقوليلي المسألة!`,
              `${greet}\nخطة الهجوم:\n⚡ الجمع = ضم القوى\n⚡ الطرح = حسم العوائق\n⚡ الضرب = مضاعفة القوة!\nقوليلي المسألة! 💪`,
            ])
          : isReena
          ? pick([
              `${greet}\nالرياضيات منطق وجمال. 🌙\nأخبريني بالمسألة وسنحلها بهدوء خطوة خطوة. 💎`,
              `${greet}\nالأرقام لغة الكون. 🌙\nالحكيم يحل المسألة مرتين: بعقله ثم بقلمه. 📖\nأخبريني بالمسألة.`,
            ])
          : pick([
              `${greet}\nرياضيات؟ اللي اخترع الضرب كان بيضحك على الجمع! 😂\nبس ماريا هتساعدك! قوليلي المسألة! 😄`,
              `${greet}\nاللي مش فاهمة في الرياضيات تسأل ماريا! 🤣\nقوليلي وهنخلص بسرعة! 🎉`,
            ]),
      };
    }

    // ── علوم ──
    if (/علوم|تجربة|كيمياء|فيزياء|أحياء|نبات|جاذبية|ضوء|طاقة|حيوانات|مناخ|بيئة/i.test(ml)) {
      return {
        text: isMalik
          ? pick([
              `${greet}\nعلوم = أفعال خارقة حقيقية! 🔬🦸‍♂️\nقوليلي الموضوع! 🚀`,
              `${greet}\nكل تجربة علمية = مهمة سرية! 🔬⚡\nأخبريني بالموضوع ونبدأ! 💪`,
              `${greet}\n${pick(MALIK_HERO_FACTS)}\nإيه موضوع العلوم؟ 🔬`,
            ])
          : isReena
          ? pick([
              `${greet}\nالعلوم محادثة بين الإنسان والكون. 🌙\nكل ظاهرة تسأل سؤالاً، والعالِم يسمع بقلبه. 💎\nما الموضوع؟`,
              `${greet}\nالطبيعة كتاب مفتوح. 💎\nمن أمعن النظر تعلم. 🌙\nأخبريني بالموضوع.`,
            ])
          : pick([
              `${greet}\nعلوم؟ بحب العلوم لأنها بتفسرلي ليه السما زرقا مش بنفسجي! 😂\nقوليلي الموضوع! 😄`,
              `${greet}\nعلوم؟ تمام! هنشرح بطريقة مضحكة! 😂🔬\nإيه الموضوع؟ 🎉`,
            ]),
      };
    }

    // ── لغة وقصص ──
    if (/عربي|لغة|قواعد|نحو|قصة|إملاء|كتابة|قراءة|نص|فقرة|تعبير|أدب/i.test(ml)) {
      return {
        text: isMalik
          ? pick([
              `${greet}\nاللغة العربية سلاح البطل الحقيقي! ⚔️🦸‍♂️\nالكلمة الصحيحة أقوى من أي ضربة!\nقوليلي السؤال! 💥`,
              `${greet}\nعنترة كان شاعراً فارساً — اللغة العربية سلاح الأبطال الأصيل! ⚔️😄\nقوليلي السؤال! 💪`,
            ])
          : isReena
          ? pick([
              `${greet}\nاللغة العربية لؤلؤة الحضارات. 🌙\nكما قال المتنبي: "أنام ملء جفوني عن شواردها." 💎\nما الذي تودين تعلمه؟ 📖`,
              `${greet}\nكل كلمة عربية لها روح وتاريخ. 💎\nأخبريني بالسؤال وسنتأمل اللغة معاً. 🌙`,
            ])
          : pick([
              `${greet}\nلغة عربية؟ أنا اخترعت جملة "الواجب صعب"! 😂\nبس ماريا تساعدك! قوليلي! 😄`,
              `${greet}\nعربي؟ تعالي نخلص منه بضحكة! 🤣\nإيه السؤال؟ 🎉`,
            ]),
      };
    }

    // ── واجبات ومذاكرة ──
    if (/واجب|درس|مذاكر|امتحان|اختبار|مادة|مدرسة|معلمة|حصة/i.test(ml)) {
      return {
        text: isMalik
          ? pick([
              `${greet}\nامتحان؟ معركة! مذاكرة؟ تدريب! 🦸‍♂️💥\nباتمان ذاكر كل حاجة قبل ما يحارب — وصلاح الدين كان يخطط قبل كل معركة! ⚔️😄\n\nخطة التدريب:\n⚡ 25 دقيقة تركيز\n⚡ 5 دقيقة راحة\n⚡ راجعي المعلومات!\n\nأي مادة نبدأ؟ 💪`,
              `${greet}\nكل درس تذاكريه = تدريب قوة! 🦸‍♂️⚡\nأي مادة؟ 💪`,
              `${greet}\n${pick(MALIK_HERO_FACTS)}\nكلهم ذاكروا! أنتِ زيهم! 💪\nأي مادة الصعبة؟ ⚡`,
            ])
          : isReena
          ? pick([
              `${greet}\nالامتحان اختبار للعقل لا للذاكرة فقط. 🌙\nالحكيم يفهم ثم يحفظ. 💎\nأخبريني بالمادة وسندرسها بعمق. 📖`,
              `${greet}\n"من طلب العلا سهر الليالي." 🌙\nالمذاكرة استثمار للمستقبل. 💎\nما المادة التي تريدين فهمها؟`,
            ])
          : pick([
              `${greet}\nامتحان؟ 😱😂\nأنا أول ما سمعت امتحان قلت امتي المحان؟ 🤣\nبس ماريا هتساعدك! إيه المادة؟ 😄`,
              `${greet}\nواجب؟ عدو ماريا الأول! 😂\nبس بنحاربه مع بعض! قوليلي المادة! 🎉`,
            ]),
      };
    }

    // ── مشاعر ──
    if (/شعور|حزين|زعلان|خايف|متوتر|قلق|مبسوط|سعيد|وحيد|تعبان|فرحان|زعلت|بكي/i.test(ml)) {
      return {
        text: isMalik
          ? pick([
              `${greet}\nحتى سبايدرمان وعنترة حسوا بخوف! 🦸‍♂️💛⚔️\nبس البطل بيقول خايف بس رايح!\nقوليلي إيه اللي بتحسي بيه! ⚡`,
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

    // ── أغنية / نشيد ──
    if (/أغنية|اغنية|نشيد|غنيلي|غني لي|غنّي|أنشودة|انشودة/i.test(ml)) {
      const song = pick(SONGS_BANK);
      return {
        text: isMalik
          ? `${greet}\nالأبطال يحبون الأغاني! 🎵⚡\n\n${song}\n\nعجبتكِ؟ 🎶`
          : isReena
          ? `${greet}\nالموسيقى غذاء الروح. 🌙🎵\n\n${song}\n\nتأملي الكلمات. 💎`
          : `${greet}\nيلا نغني مع بعض! 😄🎵\n\n${song}\n\nهههه! أحلى أغنية في الكون! 🤣🎶`,
      };
    }

    // ── كلمة اليوم ──
    if (/كلمة.*يوم|يوم.*كلمة|كلمة جديدة|علميني كلمة|كلمة اليوم/i.test(ml)) {
      const day = new Date().getDay();
      const w = WORD_OF_DAY[day];
      return {
        text: isMalik
          ? `${greet}\n📚 **كلمة اليوم البطولية:**\n\n🌟 **${w.word}**\nمعناها: ${w.meaning}\n\n${w.example}\n\nاستخدميها اليوم 3 مرات تصبح من قاموسكِ! ⚡`
          : isReena
          ? `${greet}\n📖 **كلمة اليوم:**\n\n✨ **${w.word}**\nمعناها: ${w.meaning}\n\n${w.example}\n\nالكلمة الجميلة تزيّن الكلام. 💎`
          : `${greet}\n🎉 **كلمة اليوم الحلوة:**\n\n💫 **${w.word}**\nيعني: ${w.meaning}\n\n${w.example}\n\nقوليها لأمكِ وشوفي ردة فعلها! 😂`,
      };
    }

    // ── تحدي اليوم / مهمة اليوم ──
    if (/تحدي.*يوم|يوم.*تحدي|تحدي اليوم|مهمة اليوم|مهمة اليوم|مهمتي/i.test(ml)) {
      const day = new Date().getDay();
      const challenge = DAILY_CHALLENGE[day];
      return {
        text: isMalik
          ? `${greet}\n**مهمة اليوم البطولية!** 🦸‍♂️💥\n\n${challenge}\n\nالبطل الحقيقي ينفذ مهمته! هل ستنجزينها؟ 💪⚡`
          : isReena
          ? `${greet}\n**تحدي اليوم الحكيم:** 🌙\n\n${challenge}\n\nكل يوم خطوة، وكل خطوة تقرّبكِ من هدفكِ. 💎`
          : `${greet}\n**مهمة اليوم! جاهزة؟!** 😄🎯\n\n${challenge}\n\nلو نفّذتيها أنتِ أحلى بطلة في الكون! 🤣🏆`,
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
            `${greet}\nتقدري تسأليني عن: درس، حكمة، لغز، رسم..\nأنا هنا بهدوء لكِ. 💎`,
          ])
        : pick([
            `${greet}\nسؤال؟ جاهزة أضحك وأشرح! 😄\nتقدري تطلبي: نكتة، لغز، رسم، درس، أي حاجة! 🎉`,
            `${greet}\nأوه سؤال؟ تمام تمام! 😄\nقوليلي إيه اللي في بالك! 🎉`,
            `${greet}\nماريا موجودة! 😂 قوليلي! 🎉`,
            `${greet}\nيلا بينا! 😄 إيه اللي في بالك؟ 🎉`,
          ]),
    };
  };

  const generateTextWithAI = async (prompt: string, options?: { scribbleData?: string }) => {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (openaiKey && openaiKey.trim() && openai) {
      const hasImage = !!options?.scribbleData;
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 0.4,
        messages: [
          hasImage
            ? {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: options?.scribbleData || "" } }
                ]
              } as any
            : { role: "user", content: prompt }
        ]
      });
      return completion.choices?.[0]?.message?.content?.trim() || "";
    }

    if (geminiKey && geminiKey.trim()) {
      if (options?.scribbleData) {
        const base64Data = options.scribbleData.split(',')[1];
        const result = await (ai as any).models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType: 'image/png' } }
            ]
          }]
        });
        return String(result.text || "");
      }

      const result = await (ai as any).models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      return String(result.text || "");
    }

    throw new Error("No AI provider configured");
  };

  app.use(express.json());
  app.use(cors());

  // Diagnostic Endpoint
  app.get("/api/ping", (req, res) => {
    res.json({ pong: true, time: new Date().toISOString(), status: "running" });
  });

  // Contact form — sends an email to the platform owner via Replit Mail
  app.post("/api/contact", async (req, res) => {
    try {
      const name = sanitizeText(req.body?.name);
      const email = sanitizeText(req.body?.email);
      const phone = sanitizeText(req.body?.phone);
      const subject = sanitizeText(req.body?.subject);
      const message = typeof req.body?.message === "string"
        ? req.body.message.replace(/[<>`$]/g, "").trim().slice(0, 5000)
        : "";

      if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: "الاسم والإيميل والرسالة مطلوبة" });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: "الإيميل غير صحيح" });
      }

      const finalSubject = `[تواصل من نادي البطلات] ${subject || "رسالة جديدة من " + name}`;
      const text = `رسالة جديدة من نموذج تواصل نادي البطلات الصغيرات\n\n` +
        `الاسم: ${name}\n` +
        `الإيميل: ${email}\n` +
        `الهاتف: ${phone || "—"}\n` +
        `الموضوع: ${subject || "—"}\n\n` +
        `الرسالة:\n${message}\n\n` +
        `— أرسلت في ${new Date().toLocaleString("ar-EG")}`;

      const html = `
        <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff5f7;padding:24px;border-radius:16px;border:1px solid #fbcfe8">
          <div style="background:linear-gradient(135deg,#f472b6,#ec4899);color:white;padding:16px 20px;border-radius:12px;margin-bottom:20px;text-align:center">
            <h2 style="margin:0;font-size:20px">رسالة جديدة من نادي البطلات الصغيرات ✨</h2>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#831843">
            <tr><td style="padding:8px;font-weight:bold;width:100px">الاسم:</td><td style="padding:8px">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">الإيميل:</td><td style="padding:8px"><a href="mailto:${email}" style="color:#ec4899">${email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold">الهاتف:</td><td style="padding:8px">${phone || "—"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">الموضوع:</td><td style="padding:8px">${subject || "—"}</td></tr>
          </table>
          <div style="margin-top:20px;background:white;padding:16px;border-radius:12px;border-right:4px solid #ec4899">
            <div style="font-weight:bold;color:#831843;margin-bottom:8px">الرسالة:</div>
            <div style="color:#4c0519;line-height:1.8;white-space:pre-wrap">${message.replace(/\n/g, "<br/>")}</div>
          </div>
          <div style="margin-top:16px;text-align:center;font-size:12px;color:#9d174d">
            أُرسلت تلقائياً من نموذج التواصل · ${new Date().toLocaleString("ar-EG")}
          </div>
        </div>
      `;

      try {
        const result = await sendEmail({ subject: finalSubject, text, html });
        res.json({ success: true, messageId: result.messageId });
      } catch (mailErr: any) {
        console.error("Replit Mail failed, falling back to nodemailer:", mailErr?.message);
        // Fallback: try nodemailer if SMTP is configured
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          });
          const info = await transporter.sendMail({
            from: `"نادي البطلات" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_EMAIL || "rorofikri@gmail.com",
            replyTo: email,
            subject: finalSubject,
            text,
            html,
          });
          return res.json({ success: true, messageId: info.messageId });
        }
        throw mailErr;
      }
    } catch (err: any) {
      console.error("/api/contact error:", err);
      res.status(500).json({ success: false, error: err?.message || "فشل إرسال الرسالة" });
    }
  });

  // Simple in-memory rate limiter for recovery endpoint (per IP)
  const recoveryAttempts = new Map<string, number[]>();
  const RECOVERY_WINDOW_MS = 10 * 60 * 1000;
  const RECOVERY_MAX = 3;

  app.post("/api/send-recovery", async (req, res) => {
    try {
      // Origin check — only accept requests coming from the app itself
      const origin = String(req.headers.origin || req.headers.referer || "");
      const host = String(req.headers.host || "");
      const allowed = !origin || origin.includes(host) || origin.includes("replit.dev") || origin.includes("replit.app") || origin.includes("localhost");
      if (!allowed) {
        return res.status(403).json({ success: false, error: "غير مسموح" });
      }

      // Rate limit per IP
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
      const now = Date.now();
      const arr = (recoveryAttempts.get(ip) || []).filter((t) => now - t < RECOVERY_WINDOW_MS);
      if (arr.length >= RECOVERY_MAX) {
        return res.status(429).json({ success: false, error: "حاولتِ كثيراً، انتظري قليلاً ثم أعيدي المحاولة" });
      }
      arr.push(now);
      recoveryAttempts.set(ip, arr);

      const to = sanitizeText(req.body?.to);
      const childName = sanitizeText(req.body?.childName);
      const pin = sanitizeText(req.body?.pin);
      const parentName = sanitizeText(req.body?.parentName) || "ولي الأمر";

      if (!to || !childName || !pin) {
        return res.status(400).json({ success: false, error: "بيانات ناقصة" });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return res.status(400).json({ success: false, error: "إيميل غير صحيح" });
      }
      if (!/^[0-9]{3,8}$/.test(pin)) {
        return res.status(400).json({ success: false, error: "رمز غير صالح" });
      }

      const subject = `🔐 استعادة الرمز السري للبطلة ${childName} — نادي البطلات الصغيرات`;
      const text =
        `مرحباً ${parentName}،\n\n` +
        `طلبت البطلة ${childName} استعادة رمزها السري لدخول نادي البطلات الصغيرات.\n\n` +
        `الرمز السري: ${pin}\n\n` +
        `يمكنك مساعدتها على الدخول باستخدام هذا الرمز، أو تغييره من لوحة تحكم ولي الأمر.\n\n` +
        `— نادي البطلات الصغيرات\n${new Date().toLocaleString("ar-EG")}`;
      const html = `
        <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff5f7;padding:24px;border-radius:16px;border:1px solid #fbcfe8">
          <div style="background:linear-gradient(135deg,#f472b6,#ec4899);color:white;padding:18px 20px;border-radius:14px;margin-bottom:20px;text-align:center">
            <h2 style="margin:0;font-size:20px">🔐 استعادة الرمز السري</h2>
            <p style="margin:6px 0 0;font-size:13px;opacity:0.95">نادي البطلات الصغيرات ✨</p>
          </div>
          <p style="color:#831843;font-size:15px;line-height:1.9">مرحباً <strong>${parentName}</strong>،</p>
          <p style="color:#4c0519;font-size:14px;line-height:1.9">
            طلبت البطلة <strong style="color:#be185d">${childName}</strong> استعادة رمزها السري لدخول نادي البطلات الصغيرات.
          </p>
          <div style="margin:20px 0;background:white;padding:18px;border-radius:14px;border-right:4px solid #ec4899;text-align:center">
            <div style="color:#9d174d;font-size:12px;margin-bottom:8px;font-weight:bold">الرمز السري</div>
            <div style="font-size:32px;font-weight:900;letter-spacing:8px;color:#831843;font-family:'Courier New',monospace">${pin}</div>
          </div>
          <p style="color:#4c0519;font-size:13px;line-height:1.8">
            يمكنك مساعدتها على الدخول باستخدام هذا الرمز، أو تغييره من لوحة تحكم ولي الأمر.
          </p>
          <div style="margin-top:20px;text-align:center;font-size:11px;color:#9d174d;border-top:1px dashed #fbcfe8;padding-top:12px">
            أُرسلت تلقائياً · ${new Date().toLocaleString("ar-EG")}
          </div>
        </div>
      `;

      // 1. Try SMTP first to deliver directly to parent's email
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          });
          const info = await transporter.sendMail({
            from: `"نادي البطلات الصغيرات" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
          });
          return res.json({ success: true, channel: "smtp", messageId: info.messageId });
        } catch (smtpErr: any) {
          console.error("SMTP recovery send failed:", smtpErr?.message);
        }
      }

      // 2. Fallback: Replit Mail to admin (verified Replit email) with parent address in subject
      const adminSubject = `[تحويل إلى ${to}] ${subject}`;
      const adminHtml =
        `<div dir="rtl" style="background:#fef3c7;border:2px solid #fbbf24;padding:14px;border-radius:12px;margin-bottom:16px;font-family:Tahoma">` +
        `<strong>⚠️ تنبيه إداري:</strong> طلب استعادة رمز. يرجى تحويل هذه الرسالة يدوياً إلى ولي الأمر: ` +
        `<a href="mailto:${to}" style="color:#b45309">${to}</a></div>` + html;
      try {
        const result = await sendEmail({ subject: adminSubject, text: `تحويل إلى: ${to}\n\n` + text, html: adminHtml });
        return res.json({ success: true, channel: "admin-relay", messageId: result.messageId });
      } catch (mailErr: any) {
        console.error("Replit Mail fallback failed:", mailErr?.message);
        throw mailErr;
      }
    } catch (err: any) {
      console.error("/api/send-recovery error:", err);
      res.status(500).json({ success: false, error: err?.message || "فشل إرسال الرمز" });
    }
  });

  app.get("/api/admin/check-config", (req, res) => {
    res.json({
      openai_key_present: !!process.env.OPENAI_API_KEY,
      openai_key_prefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 5) + "..." : "missing",
      env_keys: Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY') || k.includes('USER'))
    });
  });

  // Email transporter setup
  const EMAIL_USER = process.env.EMAIL_USER || "";
  const EMAIL_PASS = process.env.EMAIL_PASS || "";
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  app.get("/api/mail-status", async (req, res) => {
    try {
      await transporter.verify();
      res.json({ status: "connected" });
    } catch (error) {
      console.error("Transporter verify failed:", error);
      res.json({ status: "disconnected", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/send-test-email", async (req, res) => {
    const user = process.env.EMAIL_USER || "";
    const pass = process.env.EMAIL_PASS || "";

    if (!user || !pass) {
      return res.status(500).json({ success: false, error: "Email credentials not set" });
    }

    const mailOptions = {
      from: user,
      to: user,
      subject: "🚀 إمكانيات منصة نادي البطلات الصغيرات 🚀",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; padding: 30px; background-color: #fdf2f8; border-radius: 30px; border: 3px solid #db2777;">
          <h1 style="color: #db2777; border-bottom: 2px solid #fbcfe8; padding-bottom: 10px;">مرحباً يا مدير المنصة! ✨</h1>
          <p style="font-size: 18px; color: #4b5563;">هذا تقرير سريع حول الإمكانيات المذهلة التي تمتلكها منصتك الآن:</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 20px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #7c3aed;">1. نظام إدارة البطلات (CRM) 👧</h2>
            <p>تحكم كامل في ملفات الأطفال، تعديل الأسماء، القوى الخارقة، والرموز السرية.</p>
            
            <h2 style="color: #7c3aed;">2. لوحة تحكم ولي الأمر 🛡️</h2>
            <p>متابعة حية للنشاط، سجلات الدخول، وتخصيص المهام اليومية.</p>
            
            <h2 style="color: #7c3aed;">3. عالم البطلة السحري 🏰</h2>
            <p>بيئة تفاعلية للطفلة تشمل (قرية البطلات، استوديو الشخصيات، عالم القصص، وأكاديمية السحر).</p>
            
            <h2 style="color: #7c3aed;">4. نظام التنبيهات الذكي 📧</h2>
            <p>إرسال إيميلات تلقائية عند التسجيل، القبول، أو تحقيق إنجازات جديدة.</p>
            
            <h2 style="color: #7c3aed;">5. لوحة الإدارة العليا (Super Admin) 📊</h2>
            <p>إحصائيات شاملة، إدارة جميع المستخدمين، ومراقبة أمان المنصة بالكامل.</p>
          </div>
          
          <p style="margin-top: 30px; font-weight: bold; color: #db2777;">المنصة الآن جاهزة للانطلاق والنمو! 🚀</p>
          <p style="font-size: 12px; color: #9ca3af;">&copy; 2026 Hero Girls Club - Powered by AI Studio</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Test email sent successfully" });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ success: false, error: "Failed to send test email" });
    }
  });

  // API route for general notifications (e.g., approval)
  app.post("/api/notify", async (req, res) => {
    const { email, type, data } = req.body;
    
    const user = process.env.EMAIL_USER || "";
    const pass = process.env.EMAIL_PASS || "";

    if (!user || !pass) {
      return res.json({ success: true, message: "Email credentials not set" });
    }

    const mailOptions = {
      from: user,
      to: email,
      subject: type === 'approval' ? "✨ تمت الموافقة على انضمامك لنادي البطلات! ✨" : 
               type === 'pin_change' ? "🔐 تحديث الرمز السري - نادي البطلات" : 
               "تنبيه من نادي البطلات",
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; background-color: #fff5f7; border-radius: 20px; border: 2px solid #ff85a2;">
          <h1 style="color: #ff85a2;">مرحباً يا بطلة ${data.name}!</h1>
          <p style="font-size: 18px; color: #a4508b;">${data.message}</p>
          <div style="background-color: white; padding: 15px; border-radius: 15px; margin-top: 20px;">
            <p><strong>اسم البطولة:</strong> ${data.heroName}</p>
            <p>يمكنكِ الآن الدخول إلى عالمك السحري باستخدام اسمك والرمز السري الخاص بكِ.</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #ff85a2;">&copy; 2026 نادي البطلات الصغيرات</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  });

  // API route for registration notification
  app.post("/api/notify-registration", async (req, res) => {
    const { name, email, heroName, phone } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "";
    
    const user = process.env.EMAIL_USER || "";
    const pass = process.env.EMAIL_PASS || "";

    if (!user || !pass) {
      return res.json({ success: true, message: "Email credentials not set" });
    }

    const mailOptions = {
      from: user,
      to: adminEmail,
      subject: "✨ تسجيل جديد في Hero Girls Club ✨",
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; background-color: #fff5f7; border-radius: 20px;">
          <h1 style="color: #ff85a2;">مرحباً رورو!</h1>
          <p style="font-size: 18px;">هناك بطلة جديدة انضمت إلينا:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>الاسم:</strong> ${name}</li>
            <li><strong>الايميل:</strong> ${email}</li>
            <li><strong>اسم البطلة:</strong> ${heroName}</li>
            <li><strong>الجوال:</strong> ${phone || 'غير متوفر'}</li>
          </ul>
          <p style="color: #a4508b; font-weight: bold;">يرجى مراجعة الحساب وتفعيله من لوحة التحكم.</p>
        </div>
      `,
    };

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Notification sent" });
      } else {
        console.warn("Email credentials not set. Skipping notification.");
        res.json({ success: true, message: "Email credentials not set" });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "Failed to send notification" });
    }
  });

  /* ── Free image generation via Pollinations.ai (no API key needed) ── */
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
    if (/قمر|ليل|نوم/i.test(m)) return "cute cartoon night sky moon stars for children";
    if (/مبهج|جميل|حلو|مفرح/i.test(m)) return "cheerful colorful cartoon illustration for children happy";
    return "cute colorful cartoon illustration for children happy kawaii style";
  };

  const makePollinationsUrl = (prompt: string): string => {
    const seed = Math.floor(Math.random() * 9999999);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${seed}&nologo=true&model=flux`;
  };

  // Returns true if the message hits a known local-chat keyword category
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
      /أغنية|اغنية|نشيد|غنيلي|غني لي|أنشودة/.test(m) ||
      /كلمة.*يوم|يوم.*كلمة|كلمة جديدة|علميني كلمة|كلمة اليوم/.test(m) ||
      /تحدي.*يوم|يوم.*تحدي|تحدي اليوم|مهمة اليوم|مهمتي/.test(m) ||
      IMAGE_TRIGGERS.test(m)
    );
  };

  // AI fallback: called when local chat has no specific answer
  const generateChatAIResponse = async (
    assistantName: string,
    childName: string,
    msg: string,
    chatHistory: Array<{ role: string; content: string }>
  ): Promise<string | null> => {
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
      const answer = await generateTextWithAI(fullPrompt);
      return answer?.trim() || null;
    } catch (e) {
      console.log("[chat] AI fallback failed:", (e as Error).message);
      return null;
    }
  };

  // Chat route — local keywords first, AI fallback for real questions
  app.post("/api/chat", async (req, res) => {
    const { messages: chatHistory, assistantData, childName, riddleContext } = req.body;
    const lastMessage = chatHistory?.[chatHistory.length - 1]?.content || chatHistory?.[chatHistory.length - 1]?.text || "";
    const assistantName = assistantData?.name || "مالك";
    const safeChildName = sanitizeText(childName, "بطلتنا");
    const safeMsg = sanitizeText(lastMessage);
    const safeRiddle = typeof riddleContext?.answer === 'string' ? riddleContext.answer.slice(0, 60) : undefined;

    const imgPrompt = buildImagePrompt(safeMsg);
    const imageUrl = imgPrompt ? makePollinationsUrl(imgPrompt) : undefined;
    const chatResult = smartLocalChat(assistantName, safeChildName, safeMsg, safeRiddle);

    // If no specific local category matched and the message is a real question → use AI
    let finalText = chatResult.text;
    if (
      !chatResult.riddleAnswer &&
      !hasSpecificCategory(safeMsg) &&
      safeMsg.length > 4
    ) {
      const aiText = await generateChatAIResponse(assistantName, safeChildName, safeMsg, chatHistory || []);
      if (aiText) finalText = aiText;
    }

    res.json({
      text: finalText,
      ...(imageUrl ? { imageUrl } : {}),
      ...(chatResult.riddleAnswer ? { riddleAnswer: chatResult.riddleAnswer } : {}),
    });
  });

  // AI Design Studio Proxy
  app.post("/api/design", async (req, res) => {
    console.log("Design request received for child:", req.body.childName);
    const prompt = sanitizeText(req.body.prompt);
    const childName = sanitizeText(req.body.childName, "بطلتنا");
    const persona = sanitizeText(req.body.persona, "🛡️ البطل مالك");
    const scribbleData = typeof req.body.scribbleData === "string" ? req.body.scribbleData : "";
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      const seed = Math.floor(Math.random() * 1000000);
      const cleanPrompt = (prompt || "magic fantasy art for kids")
        .replace(/[^\w\s]/gi, '')
        .substring(0, 100);
      return res.json({
        text: buildSafeDesignFallback(childName, prompt, persona),
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + " highly detailed digital art for children magical vibrant colors") + "?seed=" + seed + "&width=1024&height=1024&nologo=true"}`
      });
    }

    try {
      let aiResponseText = "";
      
      if (scribbleData) {
        // Multi-modal (Vision) request
        aiResponseText = await generateTextWithAI(`أنت مساعد تصميم ذكي للأطفال باسم ${persona}. تحدث دائماً بالعربية الفصحى المبسطة وبأسلوب طفل آمن.
قواعد الأمان: امنع أي محتوى عنيف/مخيف/غير مناسب للأطفال، وإذا طُلب محتوى غير آمن فاعتذر بلطف واقترح بديلاً تعليمياً.
اكتب الرد بصيغة واضحة من 5 فقرات قصيرة بعناوين:
1) الفكرة الأساسية
2) الألوان المقترحة
3) العناصر الجميلة
4) خطوات التنفيذ
5) نصيحة تعليمية صغيرة
نادي الطفلة باسم "${childName}".
حللي هذه الشخبطة وقدمي أفكاراً مناسبة للطلب: ${prompt || "اجعليها رائعة ومناسبة للمدرسة"}.`, { scribbleData });
      } else {
        aiResponseText = await generateTextWithAI(`أنت مساعد تصميم ذكي للأطفال باسم ${persona}. تحدث بالعربية الفصحى المبسطة.
قواعد الأمان: امنع المحتوى العنيف/المخيف/غير المناسب للأطفال مع إعادة توجيه لطيفة نحو أفكار آمنة.
اكتبي إجابة قصيرة إلى متوسطة ومنظمة بعناوين:
1) الفكرة الأساسية
2) الألوان المقترحة
3) العناصر الجميلة
4) خطوات التنفيذ
5) نصيحة تعليمية صغيرة
الطفلة اسمها "${childName}" ونص طلبها: ${prompt || "أريد فكرة تصميم ممتعة"}.
اجعلي النبرة تعليمية ومشجعة وممتعة للأطفال.`);
      }

      // Generate a dynamic image using a free service like Pollinations.ai for "real" magic feel
      const seed = Math.floor(Math.random() * 1000000);
      const cleanPrompt = (prompt || "magic fantasy art for kids")
        .replace(/[^\w\s]/gi, '')
        .substring(0, 100);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + " highly detailed digital art for children magical vibrant colors") + "?seed=" + seed + "&width=1024&height=1024&nologo=true"}`;

      res.json({ 
        text: aiResponseText,
        imageUrl: imageUrl
      });
    } catch (error: any) {
      console.error("Design API error:", error);
      const seed = Math.floor(Math.random() * 1000000);
      const cleanPrompt = (prompt || "magic fantasy art for kids")
        .replace(/[^\w\s]/gi, '')
        .substring(0, 100);
      res.json({
        text: buildSafeDesignFallback(childName, prompt, persona),
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + " highly detailed digital art for children magical vibrant colors") + "?seed=" + seed + "&width=1024&height=1024&nologo=true"}`
      });
    }
  });

  app.post("/api/research", async (req, res) => {
    const studentName = sanitizeText(req.body.studentName);
    const schoolName = sanitizeText(req.body.schoolName);
    const grade = sanitizeText(req.body.grade);
    const title = sanitizeText(req.body.title);
    const lengthLevel = sanitizeText(req.body.lengthLevel, "متوسط");
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!studentName || !schoolName || !grade || !title) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة." });
    }

    const isUnsafeTopic = /(عنف|قتل|دم|سلاح|مخدر|جنس|رعب|تطرف|كره)/i.test(title);
    if (isUnsafeTopic) {
      return res.status(400).json({
        error: "عنوان البحث غير مناسب لعمر الأطفال. جربي موضوعاً مدرسياً آمناً مثل: النظام الشمسي أو الماء أو الحيوانات."
      });
    }

    try {
      const prompt = `
أنت مساعد أبحاث مدرسية للأطفال. اكتب بحثاً عربياً مناسباً للطلبة الصغار، واضحاً وممتعاً وقابلاً للطباعة.
المدخلات:
- اسم الطالب/الطالبة: ${studentName}
- المدرسة: ${schoolName}
- الصف/السنة: ${grade}
- عنوان البحث: ${title}
- مستوى الطول المطلوب: ${lengthLevel}

الشروط:
1) الناتج بالعربية فقط.
2) مناسب للأطفال، حقائق بسيطة، لا مصطلحات جامعية معقدة.
3) منظم ليطبع في حدود 4-5 صفحات A4 تقريباً.
4) أعد الناتج بصيغة JSON فقط بدون أي نص خارج JSON.
5) بنية JSON:
{
  "title": "...",
  "introduction": "...",
  "sections": [
    { "heading": "...", "content": "...", "bullets": ["...","..."] }
  ],
  "conclusion": "...",
  "whatWeLearned": ["...", "...", "..."],
  "imageQueries": ["...", "...", "..."]
}
6) اجعل sections بين 3 و5 أقسام.
7) اجعل imageQueries بين 2 و4 عناصر فقط.
`;

      const parsed = !apiKey
        ? buildSafeResearchFallback(title)
        : (() => {
            const localPrompt = prompt;
            return (async () => {
              const raw = String(await generateTextWithAI(localPrompt) || "").trim();
              const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
              return JSON.parse(cleaned);
            })();
          })();

      const resolvedParsed = parsed instanceof Promise ? await parsed : parsed;

      const imageQueries = Array.isArray(resolvedParsed.imageQueries) ? resolvedParsed.imageQueries.slice(0, 4) : [];
      const images = imageQueries
        .filter((q: unknown) => typeof q === "string" && q.trim())
        .slice(0, 4)
        .map((q: string) => ({
          caption: q,
          url: `https://source.unsplash.com/1280x720/?${encodeURIComponent(`${q},education,kids`)}`
        }));

      res.json({
        report: {
          title: sanitizeText(resolvedParsed.title, title),
          introduction: sanitizeText(resolvedParsed.introduction, ""),
          sections: Array.isArray(resolvedParsed.sections) ? resolvedParsed.sections.slice(0, 5) : [],
          conclusion: sanitizeText(resolvedParsed.conclusion, ""),
          whatWeLearned: Array.isArray(resolvedParsed.whatWeLearned) ? resolvedParsed.whatWeLearned.slice(0, 5) : [],
          images
        }
      });
    } catch (error: any) {
      console.error("Research API error:", error);
      const fallback = buildSafeResearchFallback(title);
      const images = fallback.imageQueries.slice(0, 4).map((q) => ({
        caption: q,
        url: `https://source.unsplash.com/1280x720/?${encodeURIComponent(`${q},education,kids`)}`
      }));
      res.json({
        report: {
          title: fallback.title,
          introduction: fallback.introduction,
          sections: fallback.sections,
          conclusion: fallback.conclusion,
          whatWeLearned: fallback.whatWeLearned,
          images
        }
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global crash prevented:", err);
    res.status(500).json({ 
      error: "حدث خطأ في الخادم!", 
      details: process.env.NODE_ENV === "production" ? "Internal error" : err.message 
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
      startFcmWatcher();
    } catch (e) {
      console.warn("[fcm] watcher start failed:", (e as Error).message);
    }
  });
}

startServer();
