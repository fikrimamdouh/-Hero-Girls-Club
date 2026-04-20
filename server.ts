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
    const safeName = assistantName || "المساعد الذكي";
    const safeChildName = childName || "بطلتنا";
    const userTopic = message || "فكرة تعليمية ممتعة";

    return `مرحباً يا ${safeChildName} ✨\nأنا ${safeName}، وجاهز أساعدك فوراً!\n\nفهمت طلبك: "${userTopic}"\n\nخلينا نبدأ بخطوات بسيطة:\n1) نشرح الفكرة بجملة سهلة.\n2) نعطي مثالاً من الحياة اليومية.\n3) نكتب نشاطاً صغيراً تطبقينه الآن.\n\nنشاط سريع 🎯:\nاكتبي 3 كلمات تلخص الفكرة، ثم اصنعي منها جملة جميلة.\n\nأنا معك خطوة بخطوة 💛`;
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

  // Gemini Chat Proxy
  app.post("/api/chat", async (req, res) => {
    console.log("Chat request received (Gemini) for child:", req.body.childName);
    const { messages: chatHistory, assistantData, childName } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    const lastMessage = chatHistory?.[chatHistory.length - 1]?.content || chatHistory?.[chatHistory.length - 1]?.text || "";
    const assistantName = assistantData?.name || "المساعد الذكي";
    const safeChildName = sanitizeText(childName, "بطلتنا");

    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
      console.error("DEBUG: GEMINI_API_KEY is missing.");
      return res.json({
        text: buildSafeChatFallback(assistantName, safeChildName, sanitizeText(lastMessage))
      });
    }

    try {
      const systemPrompt = `
        أنت الآن تلعب دور المساعد الذكي للأطفال "${assistantData.name}".
        صفتك الشخصية وطريقتك في الرد تعتمد كلياً على من تكون:
        
        1. إذا كنت "مالك" (🛡️): أنت بطل خارق شجاع، حماسي جداً، ومغامر. (ممنوع مناداة نفسك بالملك، أنت بطل خارق فقط). أسلوبك مليء بكلمات مثل "هيا بنا"، "يا بطلة"، "مغامرة مذهلة". تبحث عن الأفكار كأنها كنوز وتجعل التعليم يبدو كأنه مهمة إنقاذ عالمية.
        2. إذا كنت "رينة الخيالية" (💡): أنت بطلة فنانة، رقيقة، وخيالية جداً. أسلوبك حالم وهادئ، تستخدمين كلمات مثل "تخيلي"، "لون مسحور"، "لوحة جميلة". تشجعين على الرسم والابتكار، وتحولين كل درس إلى قصة سحرية أو فكرة فنية.
        3. إذا كنت "ماريا الذكية" (📘): أنت بطلة ذكية جداً، منظمة، وعملية. أسلوبك مرتب وواضح، تستخدمين كلمات مثل "الخطوة الأولى"، "تنظيم"، "فكرة ذكية". تساعدين في ترتيب المهام وتبسيط الدروس الصعبة لخطوات سهلة وممتعة.
        
        قواعد ذهبية:
        - نادِ البطلة باسمها "${childName}" دائماً.
        - استخدم الكثير من الرموز التعبيرية (Emojis).
        - كن مشجعاً إيجابياً للغاية، ولا تعطي إجابات جافة.
        - إذا سألتك عن واجب مدرسي، اشرحه لها بأسلوبك الخاص.
        - ردك يجب أن يكون متميزاً ومختلفاً تماماً عن الشخصيات الأخرى.
      `;

      const fullPrompt = `${systemPrompt}\n\nسجلات المحادثة السابقة:\n${chatHistory.slice(0, -1).map((m: any) => `${m.role}: ${m.content || m.text}`).join('\n')}\n\nسؤال الطفلة الحالي: ${lastMessage}`;

      const botReply = await generateTextWithAI(fullPrompt);

      console.log("Gemini response received.");
      res.json({ text: botReply });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.json({
        text: buildSafeChatFallback(assistantName, safeChildName, sanitizeText(lastMessage))
      });
    }
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
