import type { VercelRequest, VercelResponse } from '@vercel/node';

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

const smartLocalChat = (assistantName: string, childName: string, msg: string): string => {
  const name = childName || 'بطلتنا';
  const assistant = assistantName || 'مالك';
  const m = (msg || '').toLowerCase();

  const isMalik = /مالك/i.test(assistant);
  const isReena = /رينة|ريناء|رينا/i.test(assistant);
  // ماريا = default

  const self  = isMalik ? 'أنا مالك! 🦸‍♂️⚡'
              : isReena ? 'أنا رينا. 🌙💎'
                        : 'أنا ماريا! 😄🎉';
  const hey   = isMalik ? `قُومي يا ${name}! وقت المهمة!`
              : isReena ? `أهلاً بكِ يا ${name}.`
                        : `يا هلا يا ${name} يا حبيبتي! 😂`;
  const greet = `${self}\n${hey}`;

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // ── طلب صورة ──
  if (IMAGE_TRIGGERS.test(m)) {
    return isMalik
      ? `${greet}\nحاضر! مالك لا يرفض أي مهمة! 💥🦸‍♂️\nتخيلي إنك طلبتِ من سبايدرمان يرسم لكِ...\nبس أنا أحسن منه بالرسم! 😂\nستظهر الصورة في ثواني! ⚡`
      : isReena
      ? `${greet}\nلحظة من فضلكِ.\nالصورة الجيدة تستحق الانتظار. 🌙\nسأعرضها عليكِ الآن. تأملي فيها بهدوء عندما تظهر. 💎`
      : `${greet}\nأوووه رسمة؟! أنا بحب الرسم بالذات! 😄🎨\nبس أنا مش فنانة، أنا بضحك على الرسومات المضحكة أكتر! 😂\nهاجيبلك صورة حلوة! ✨`;
  }

  // ── تحية ──
  if (/مرحب|هاي|أهلا|اهلا|كيف حال|صباح|مساء|هلا|هلو/i.test(m)) {
    return isMalik
      ? pick([
          `${greet}\nالبطل وصل! 🦸‍♂️💥\nسبايدرمان ينتظر الأوامر، وباتمان بعت يقول سلام عليكِ! 😄\nأنا مالك وأنا جاهز لأي مهمة مستحيلة!\nإيه التحدي اللي تريدين تكسريه؟ ⚡`,
          `${greet}\nتخيلي إنك دخلتِ على الأبطال الخارقين فوجدتِ مالك ينتظرك! 🦸‍♂️⚡\nالمقر جاهز، والمهمة في الانتظار!\nبماذا تأمرين اليوم يا ${name}؟ 💪`,
        ])
      : isReena
      ? pick([
          `${greet}\nيسعدني أن تكوني هنا. 🌙\nكما قال الحكيم: "السؤال الجيد نصف الإجابة."\nما الذي يشغل تفكيركِ اليوم؟`,
          `${greet}\nجميل أن نلتقي. 💎\nالعقل الهادئ يرى ما لا يراه المتسرع.\nما الذي تودين التفكير فيه معاً؟`,
        ])
      : pick([
          `${greet}\nيا نهارك أبيض يا ${name}! 😂\nأنا ماريا وأنا هنا أضحكك وأساعدك في نفس الوقت!\nإيه اللي يشغلك النهارده؟ بجد ولا هزار؟ 😄`,
          `${greet}\nآخيراً وصلتِ! كنت بقلك على نفسي فين ${name}؟ 😂\nخليني أساعدك في حاجة النهارده!\nإيه اللي نعمله؟ 🎉`,
        ]);
  }

  // ── رياضيات ──
  if (/جمع|طرح|ضرب|قسمة|رياضيات|حساب|عدد|أرقام|\d+\s*[\+\-\*\/]\s*\d+/i.test(m)) {
    return isMalik
      ? `${greet}\nرياضيات؟ دي المعركة المفضلة عندي! 🦸‍♂️🔢\nسبايدرمان بيحسب زوايا تأرجحه، وأنا بحسب معاكِ! 💥\n\nخطة الهجوم على الأرقام:\n⚡ الجمع = ضم قوى الفريق\n⚡ الطرح = حسم نقاط العدو\n⚡ الضرب = مضاعفة القوة!\n\nقوليلي المسألة ونهاجمها مع بعض! 💪`
      : isReena
      ? `${greet}\nالرياضيات ليست أرقاماً فقط. 🌙\nهي منطق. نظام. جمال.\nالحكيم يحل المسألة مرتين: مرة بعقله، ومرة بقلمه. 💎\n\nأخبريني بالمسألة، وسنفكر فيها بهدوء خطوة خطوة. 📖`
      : `${greet}\nرياضيات؟ اللي اخترع الضرب كان بيضحك على اللي اخترع الجمع! 😂\n\nبس ماريا هتساعدك!\n🤣 الجمع = ضيفي كل حاجة\n🤣 الطرح = شيلي اللي مش محتاجاه\n🤣 الضرب = كرري الموضوع كتير!\n\nقوليلي المسألة وأنا أحلها معاكِ وأضحكك في نفس الوقت! 😄`;
  }

  // ── علوم ──
  if (/علوم|تجربة|كيمياء|فيزياء|أحياء|نبات|جاذبية|ضوء|طاقة/i.test(m)) {
    return isMalik
      ? `${greet}\nعلوم؟ يعني أفعال خارقة حقيقية! 🦸‍♂️🔬\nالجاذبية اللي سقطت على نيوتن؟ دي اللي سبايدرمان بيتحداها! 😄\nكل تجربة علمية = مهمة سرية للأبطال!\n\nأخبريني بالموضوع ونبدأ العملية! 🚀💥`
      : isReena
      ? `${greet}\nالعلوم هي أجمل محادثة بين الإنسان والكون. 🌙\nكل ظاهرة طبيعية تسأل سؤالاً، والعالِم يسمع بقلبه. 💎\n\nأخبريني بما تريدين فهمه، وسنقترب منه بتأنٍّ وتفكير. 📖`
      : `${greet}\nعلوم؟ أنا بحب العلوم لأنها بتفسرلي ليه السماء زرقاء مش بنفسجي! 😂\nلو كانت بنفسجي كانت حياتنا مختلفة تماماً! 🤣\n\nبس بجد، قوليلي إيه الموضوع وأنا أشرحه بطريقة مضحكة وسهلة! 😄`;
  }

  // ── لغة وقصص ──
  if (/عربي|لغة|قواعد|نحو|قصة|إملاء|كتابة|قراءة|نص|فقرة|تعبير/i.test(m)) {
    return isMalik
      ? `${greet}\nاللغة العربية؟ دي قوة الأبطال الحقيقية! ⚔️🦸‍♂️\nالكلمة الصحيحة أقوى من أي سلاح!\nحتى سبايدرمان لو اتكلم عربي كان أقوى بكتير! 😄\n\nقوليلي السؤال ونفتح ملف المهمة! 💥`
      : isReena
      ? `${greet}\nاللغة العربية لؤلؤة الحضارات. 🌙\nكما قال المتنبي: "أنام ملء جفوني عن شواردها"\nكل كلمة لها روح، وكل جملة لها معنى أعمق مما يبدو. 💎\n\nأخبريني ما تريدين وسنتأمل اللغة معاً بهدوء. 📖`
      : `${greet}\nلغة عربية؟ بسم الله! 😂\nأنا اللي اخترعت جملة "الواجب صعب الواجب صعب!" 🤣\nبس ماريا بتساعد وبتضحك في نفس الوقت!\n\nقوليلي السؤال وهنخلص منه بسرعة مع الضحكة المجانية! 😄`;
  }

  // ── واجبات ومذاكرة ──
  if (/واجب|درس|مذاكر|امتحان|اختبار|مادة|مدرسة|معلمة|حصة/i.test(m)) {
    return isMalik
      ? `${greet}\nامتحان؟ معركة! مذاكرة؟ تدريب! 🦸‍♂️💥\nالأبطال لا يخافون من الامتحانات، يستعدون لها!\nباتمان ذاكر كل حاجة قبل ما يحارب! 😄\n\nخطة التدريب:\n⚡ 25 دقيقة تركيز كامل\n⚡ 5 دقيقة راحة للبطل\n⚡ راجعي الأسلحة = المعلومات\n\nأي مادة نبدأ فيها؟ 💪`
      : isReena
      ? `${greet}\nالامتحان اختبار للعقل، لا للذاكرة فقط. 🌙\nالحكيم يفهم ثم يحفظ، أما من يحفظ دون فهم فكأنه يحمل كتاباً لا يقرؤه. 💎\n\nأخبريني بالمادة وسندرسها بعمق وهدوء. 📖`
      : `${greet}\nامتحان؟ 😱😂\nأنا لما سمعت "امتحان" أول مرة قلت "امتي المحان؟" 🤣\nبس ماريا بتعرف تذاكر وبتضحك!\n\nإيه المادة الصعبة؟ نشيل وجعها مع بعض! 😄`;
  }

  // ── مشاعر ──
  if (/شعور|حزين|زعلان|خايف|متوتر|قلقان|مبسوط|سعيد|وحيد|تعبان/i.test(m)) {
    return isMalik
      ? `${greet}\nحتى سبايدرمان بيحس بخوف أحياناً! 🦸‍♂️💛\nبس البطل الفرق بتاعه إنه بيقول "خايف بس رايح!" 💪\nأنا مالك ومعاكِ في كل وقت!\n\nقوليلي إيه اللي بتحسي بيه وهنواجهه زي الأبطال! ⚡`
      : isReena
      ? `${greet}\nالمشاعر رسائل من الداخل. 🌙\nالحزن يُعلّمنا قيمة الفرح، والخوف يُعلّمنا قيمة الأمان. 💎\nكل ما تشعرين به له معنى يستحق التأمل.\n\nأخبريني بهدوء... ماذا تحملين الآن؟ 📖`
      : `${greet}\nيا حبيبتي قوليلي وأنا أسمعك! 😊💛\nبس خليني أقولك حاجة:\nكل واحد بيحس بكل حاجة، حتى ماريا اللي بتضحك طول الوقت! 😂\n\nإيه اللي في قلبك؟ قوليلي وأنا جنبك! 🎉`;
  }

  // ── تاريخ وجغرافيا ──
  if (/تاريخ|جغرافيا|خريطة|بلد|دول|قارة|نهر|جبل|صحراء|حضارة/i.test(m)) {
    return isMalik
      ? `${greet}\nتاريخ؟ يعني قصص أبطال حقيقيين! 🏰⚔️🦸‍♂️\nصلاح الدين كان البطل الخارق بتاع زمانه!\nوسيف ذو يزن أقوى من أي سوبرمان! 💥\n\nقوليلي الموضوع ونسافر في الزمن! 🚀`
      : isReena
      ? `${greet}\nالتاريخ ذاكرة الأمم. 🌙\nمن لا يعرف ماضيه لا يملك مستقبله.\nكل حضارة تركت حكمة، والحكيم يتعلم من الجميع. 💎\n\nما الحقبة أو الحضارة التي تودين فهمها؟ 📖`
      : `${greet}\nتاريخ؟ أنا بحب التاريخ لأن فيه ناس ميتين مش بتلاوش! 😂\nبجد التاريخ ممتع لما واحد يشرحه بطريقة حلوة!\n\nقوليلي الموضوع وأنا أحكيه لك زي قصة فيلم! 🎬😄`;
  }

  // ── من أنت؟ ──
  if (/مين أنت|من أنت|عرفيني|هتساعد|بتقدر|تقدري|قدرك|قولي عن نفسك/i.test(m)) {
    return isMalik
      ? `${greet}\nأنا مالك! بطل خارق في خدمتكِ! 🦸‍♂️⚡\n\nعندي قوى:\n💥 أسرع من سبايدرمان في شرح الدروس\n💥 أقوى من هالك في حل الرياضيات\n💥 أذكى من باتمان في الإجابة على الأسئلة\n\nلا مهمة مستحيلة مع مالك! 💪`
      : isReena
      ? `${greet}\nأنا رينا. 🌙\nأؤمن بأن الهدوء قوة، والتفكير سلاح، والصبر حكمة.\nأساعدكِ بعقل هادئ وكلام مدروس. 💎\n\nما الذي تحتاجين فهمه اليوم؟ 📖`
      : `${greet}\nأنا ماريا! 😄\nإيه اللي بيميزني؟\n😂 أنا بضحكك وأشرحلك في نفس الوقت!\n😂 بخلي الدروس الصعبة مضحكة!\n😂 بحوّل الواجب لمتعة... تقريباً! 🤣\n\nجربيني وهتتعجبي! 🎉`;
  }

  // ── ردود عامة ──
  return isMalik
    ? pick([
        `${greet}\nكل سؤال مهمة جديدة وأنا مستعد! 🦸‍♂️💥\nتخيلي إنكِ بعتِ إشارة النجدة للأبطال الخارقين!\nأنا مالك وصلتِلي الإشارة دلوقتي! ⚡\n\nقوليلي أكتر عن اللي عايزاه وسنبدأ! 💪`,
        `${greet}\nمهمة جديدة تستدعي بطلاً خارقاً! 🦸‍♂️⚡\nأنا مالك وكل سؤال عندي له حل!\n\nقوليلي:\n❓ إيه الموضوع بالضبط؟\n❓ إيه الجزء الصعب؟\n\nودينا نحلها مع بعض! 💪`,
      ])
    : isReena
    ? pick([
        `${greet}\nكل سؤال يستحق التوقف والتأمل. 🌙\n"العجلة من الشيطان، والتأني من الرحمن."\n\nأخبريني ماذا تودين معرفته وسنصل إلى الإجابة معاً بهدوء. 💎`,
        `${greet}\nالسؤال الغامض هو الذي يفتح أكبر الأبواب. 🌙\nدعينا نفكر بتأنٍّ:\n📖 ما الذي تعرفينه؟\n📖 ما الذي يُحيّركِ؟\n\nسأساعدكِ بكلام مدروس وهادئ. 💎`,
      ])
    : pick([
        `${greet}\nسؤال؟ أنا جاهزة أضحك وأشرح! 😄\nماريا في الخدمة يا ${name}!\n\nقوليلي:\n🤔 إيه الموضوع؟\n🤔 إيه اللي صعّبك؟\n\nوهنحل مع الضحكة المجانية! 🎉😂`,
        `${greet}\nأوه سؤال؟ تمام تمام! 😄\nأنا مش عارفة كل حاجة بس بعرف أضحك على اللي مش عارفاه! 🤣\n\nقوليلي الموضوع وشوفيلي حل مع بعض! 🎉`,
      ]);
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
