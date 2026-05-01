import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

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

  const buildSafeChatFallback = (assistantName: string, childName: string, message: string) => {
    return smartLocalChat(assistantName, childName, message);
  };

  const smartLocalChat = (assistantName: string, childName: string, msg: string): string => {
    const name = childName || "بطلتنا";
    const assistant = assistantName || "مالك";
    const m = (msg || "").toLowerCase();

    const isMalik = /مالك/i.test(assistant);
    const isReena = /رينة|ريناء|رينا/i.test(assistant);
    // ماريا = default

    /*
      مالك  → أبطال خارقون، معارك، مهام، طاقة وحماس
      رينا  → هدوء، حكمة، عمق، رزانة، تفكير
      ماريا → فرفشة، ضحك، هزار، خفة دم
    */

    const self  = isMalik ? "أنا مالك! 🦸‍♂️⚡"
                : isReena ? "أنا رينا. 🌙💎"
                          : "أنا ماريا! 😄🎉";
    const hey   = isMalik ? `قُومي يا ${name}! وقت المهمة!`
                : isReena ? `أهلاً بكِ يا ${name}.`
                          : `يا هلا يا ${name} يا حبيبتي! 😂`;
    const greet = `${self}\n${hey}`;

    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    // ── طلب صورة ──
    if (/ارسم|صور|رسم|صورة|رسمة|ارسملي|صورلي|أرسم|صوّر|لوحة|رسومة/i.test(m)) {
      return isMalik
        ? `${greet}\nحاضر! مالك لا يرفض أي مهمة! 💥🦸\u200d♂️\nتخيلي إنك طلبتِ من سبايدرمان يرسم لكِ...\nبس أنا أحسن منه بالرسم! 😂\nستظهر الصورة في ثواني! ⚡`
        : isReena
        ? `${greet}\nلحظة من فضلكِ.\nالصورة الجيدة تستحق الانتظار. 🌙\nسأعرضها عليكِ الآن. تأملي فيها بهدوء عندما تظهر. 💎`
        : `${greet}\nأوووه رسمة؟! أنا بحب الرسم بالذات! 😄🎨\nبس أنا مش فنانة، أنا بضحك على الرسومات المضحكة أكتر! 😂\nهاجيبلك صورة حلوة! ✨`;
    }

    // ── تحية ──
    if (/مرحب|هاي|أهلا|اهلا|كيف حال|صباح|مساء|هلا|هلو/i.test(m)) {
      return isMalik
        ? pick([
            `${greet}\nالبطل وصل! 🦸\u200d♂️💥\nسبايدرمان ينتظر الأوامر، وباتمان بعت يقول سلام عليكِ! 😄\nأنا مالك وأنا جاهز لأي مهمة مستحيلة!\nإيه التحدي اللي تريدين تكسريه؟ ⚡`,
            `${greet}\nتخيلي إنك دخلتِ على الأبطال الخارقين فوجدتِ مالك ينتظرك! 🦸\u200d♂️⚡\nالمقر جاهز، والمهمة في الانتظار!\nبماذا تأمرين اليوم يا ${name}؟ 💪`,
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
        ? `${greet}\nرياضيات؟ دي المعركة المفضلة عندي! 🦸\u200d♂️🔢\nسبايدرمان بيحسب زوايا تأرجحه، وأنا بحسب معاكِ! 💥\n\nخطة الهجوم على الأرقام:\n⚡ الجمع = ضم قوى الفريق\n⚡ الطرح = حسم نقاط العدو\n⚡ الضرب = مضاعفة القوة!\n\nقوليلي المسألة ونهاجمها مع بعض! 💪`
        : isReena
        ? `${greet}\nالرياضيات ليست أرقاماً فقط. 🌙\nهي منطق. نظام. جمال.\nالحكيم يحل المسألة مرتين: مرة بعقله، ومرة بقلمه. 💎\n\nأخبريني بالمسألة، وسنفكر فيها بهدوء خطوة خطوة. 📖`
        : `${greet}\nرياضيات؟ اللي اخترع الضرب كان بيضحك على اللي اخترع الجمع! 😂\n\nبس ماريا هتساعدك!\n🤣 الجمع = ضيفي كل حاجة\n🤣 الطرح = شيلي اللي مش محتاجاه\n🤣 الضرب = كرري الموضوع كتير!\n\nقوليلي المسألة وأنا أحلها معاكِ وأضحكك في نفس الوقت! 😄`;
    }

    // ── علوم ──
    if (/علوم|تجربة|كيمياء|فيزياء|أحياء|نبات|جاذبية|ضوء|طاقة/i.test(m)) {
      return isMalik
        ? `${greet}\nعلوم؟ يعني أفعال خارقة حقيقية! 🦸\u200d♂️🔬\nالجاذبية اللي سقطت على نيوتن؟ دي اللي سبايدرمان بيتحداها! 😄\nكل تجربة علمية = مهمة سرية للأبطال!\n\nأخبريني بالموضوع ونبدأ العملية! 🚀💥`
        : isReena
        ? `${greet}\nالعلوم هي أجمل محادثة بين الإنسان والكون. 🌙\nكل ظاهرة طبيعية تسأل سؤالاً، والعالِم يسمع بقلبه. 💎\n\nأخبريني بما تريدين فهمه، وسنقترب منه بتأنٍّ وتفكير. 📖`
        : `${greet}\nعلوم؟ أنا بحب العلوم لأنها بتفسرلي ليه السماء زرقاء مش بنفسجي! 😂\nلو كانت بنفسجي كانت حياتنا مختلفة تماماً! 🤣\n\nبس بجد، قوليلي إيه الموضوع وأنا أشرحه بطريقة مضحكة وسهلة! 😄`;
    }

    // ── لغة وقصص ──
    if (/عربي|لغة|قواعد|نحو|قصة|إملاء|كتابة|قراءة|نص|فقرة|تعبير/i.test(m)) {
      return isMalik
        ? `${greet}\nاللغة العربية؟ دي قوة الأبطال الحقيقية! ⚔️🦸\u200d♂️\nالكلمة الصحيحة أقوى من أي سلاح!\nحتى سبايدرمان لو اتكلم عربي كان أقوى بكتير! 😄\n\nقوليلي السؤال ونفتح ملف المهمة! 💥`
        : isReena
        ? `${greet}\nاللغة العربية لؤلؤة الحضارات. 🌙\nكما قال المتنبي: "أنام ملء جفوني عن شواردها"\nكل كلمة لها روح، وكل جملة لها معنى أعمق مما يبدو. 💎\n\nأخبريني ما تريدين وسنتأمل اللغة معاً بهدوء. 📖`
        : `${greet}\nلغة عربية؟ بسم الله! 😂\nأنا اللي اخترعت جملة "الواجب صعب الواجب صعب!" 🤣\nبس ماريا بتساعد وبتضحك في نفس الوقت!\n\nقوليلي السؤال وهنخلص منه بسرعة مع الضحكة المجانية! 😄`;
    }

    // ── واجبات ومذاكرة ──
    if (/واجب|درس|مذاكر|امتحان|اختبار|مادة|مدرسة|معلمة|حصة/i.test(m)) {
      return isMalik
        ? `${greet}\nامتحان؟ معركة! مذاكرة؟ تدريب! 🦸\u200d♂️💥\nالأبطال لا يخافون من الامتحانات، يستعدون لها!\nباتمان ذاكر كل حاجة قبل ما يحارب! 😄\n\nخطة التدريب:\n⚡ 25 دقيقة تركيز كامل\n⚡ 5 دقيقة راحة للبطل\n⚡ راجعي الأسلحة = المعلومات\n\nأي مادة نبدأ فيها؟ 💪`
        : isReena
        ? `${greet}\nالامتحان اختبار للعقل، لا للذاكرة فقط. 🌙\nالحكيم يفهم ثم يحفظ، أما من يحفظ دون فهم فكأنه يحمل كتاباً لا يقرؤه. 💎\n\nأخبريني بالمادة وسندرسها بعمق وهدوء. 📖`
        : `${greet}\nامتحان؟ 😱😂\nأنا لما سمعت "امتحان" أول مرة قلت "امتي المحان؟" 🤣\nبس ماريا بتعرف تذاكر وبتضحك!\n\nإيه المادة الصعبة؟ نشيل وجعها مع بعض! 😄`;
    }

    // ── مشاعر ──
    if (/شعور|حزين|زعلان|خايف|متوتر|قلقان|مبسوط|سعيد|وحيد|تعبان/i.test(m)) {
      return isMalik
        ? `${greet}\nحتى سبايدرمان بيحس بخوف أحياناً! 🦸\u200d♂️💛\nبس البطل الفرق بتاعه إنه بيقول "خايف بس رايح!" 💪\nأنا مالك ومعاكِ في كل وقت!\n\nقوليلي إيه اللي بتحسي بيه وهنواجهه زي الأبطال! ⚡`
        : isReena
        ? `${greet}\nالمشاعر رسائل من الداخل. 🌙\nالحزن يُعلّمنا قيمة الفرح، والخوف يُعلّمنا قيمة الأمان. 💎\nكل ما تشعرين به له معنى يستحق التأمل.\n\nأخبريني بهدوء... ماذا تحملين الآن؟ 📖`
        : `${greet}\nيا حبيبتي قوليلي وأنا أسمعك! 😊💛\nبس خليني أقولك حاجة:\nكل واحد بيحس بكل حاجة، حتى ماريا اللي بتضحك طول الوقت! 😂\n\nإيه اللي في قلبك؟ قوليلي وأنا جنبك! 🎉`;
    }

    // ── تاريخ وجغرافيا ──
    if (/تاريخ|جغرافيا|خريطة|بلد|دول|قارة|نهر|جبل|صحراء|حضارة/i.test(m)) {
      return isMalik
        ? `${greet}\nتاريخ؟ يعني قصص أبطال حقيقيين! 🏰⚔️🦸\u200d♂️\nصلاح الدين كان البطل الخارق بتاع زمانه!\nوسيف ذو يزن أقوى من أي سوبرمان! 💥\n\nقوليلي الموضوع ونسافر في الزمن! 🚀`
        : isReena
        ? `${greet}\nالتاريخ ذاكرة الأمم. 🌙\nمن لا يعرف ماضيه لا يملك مستقبله.\nكل حضارة تركت حكمة، والحكيم يتعلم من الجميع. 💎\n\nما الحقبة أو الحضارة التي تودين فهمها؟ 📖`
        : `${greet}\nتاريخ؟ أنا بحب التاريخ لأن فيه ناس ميتين مش بتلاوش! 😂\nبجد التاريخ ممتع لما واحد يشرحه بطريقة حلوة!\n\nقوليلي الموضوع وأنا أحكيه لك زي قصة فيلم! 🎬😄`;
    }

    // ── من أنت؟ ──
    if (/مين أنت|من أنت|عرفيني|هتساعد|بتقدر|تقدري|قدرك|قولي عن نفسك/i.test(m)) {
      return isMalik
        ? `${greet}\nأنا مالك! بطل خارق في خدمتكِ! 🦸\u200d♂️⚡\n\nعندي قوى:\n💥 أسرع من سبايدرمان في شرح الدروس\n💥 أقوى من هالك في حل الرياضيات\n💥 أذكى من باتمان في الإجابة على الأسئلة\n\nلا مهمة مستحيلة مع مالك! 💪`
        : isReena
        ? `${greet}\nأنا رينا. 🌙\nأؤمن بأن الهدوء قوة، والتفكير سلاح، والصبر حكمة.\nأساعدكِ بعقل هادئ وكلام مدروس. 💎\n\nما الذي تحتاجين فهمه اليوم؟ 📖`
        : `${greet}\nأنا ماريا! 😄\nإيه اللي بيميزني؟\n😂 أنا بضحكك وأشرحلك في نفس الوقت!\n😂 بخلي الدروس الصعبة مضحكة!\n😂 بحوّل الواجب لمتعة... تقريباً! 🤣\n\nجربيني وهتتعجبي! 🎉`;
    }

    // ── ردود عامة ──
    return isMalik
      ? pick([
          `${greet}\nكل سؤال مهمة جديدة وأنا مستعد! 🦸\u200d♂️💥\nتخيلي إنكِ بعتِ إشارة النجدة للأبطال الخارقين!\nأنا مالك وصلتِلي الإشارة دلوقتي! ⚡\n\nقوليلي أكتر عن اللي عايزاه وسنبدأ! 💪`,
          `${greet}\nمهمة جديدة تستدعي بطلاً خارقاً! 🦸\u200d♂️⚡\nأنا مالك وكل سؤال عندي له حل!\n\nقوليلي:\n❓ إيه الموضوع بالضبط؟\n❓ إيه الجزء الصعب؟\n\nودينا نحلها مع بعض! 💪`,
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
          model: "gemini-1.5-flash",
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
        model: "gemini-1.5-flash",
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

  // Chat route — fully free, no API calls
  app.post("/api/chat", (req, res) => {
    const { messages: chatHistory, assistantData, childName } = req.body;
    const lastMessage = chatHistory?.[chatHistory.length - 1]?.content || chatHistory?.[chatHistory.length - 1]?.text || "";
    const assistantName = assistantData?.name || "مالك";
    const safeChildName = sanitizeText(childName, "بطلتنا");
    const safeMsg = sanitizeText(lastMessage);

    const imgPrompt = buildImagePrompt(safeMsg);
    const imageUrl = imgPrompt ? makePollinationsUrl(imgPrompt) : undefined;
    const textReply = smartLocalChat(assistantName, safeChildName, safeMsg);

    res.json({ text: textReply, ...(imageUrl ? { imageUrl } : {}) });
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
  });
}

startServer();
