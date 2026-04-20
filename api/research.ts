import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSafeResearchFallback, generateTextWithAI, sanitizeText } from './_aiHelpers.js';

type ResearchSection = {
  heading: string;
  content: string;
  bullets: string[];
};

type ResearchReport = {
  title: string;
  coverTitle: string;
  coverSubtitle: string;
  introduction: string;
  sections: ResearchSection[];
  conclusion: string;
  whatWeLearned: string[];
  funFacts: string[];
  reviewQuestions: string[];
  imageQueries: string[];
};

const pickPlaceholderColors = (theme: string) => {
  switch (theme) {
    case 'مدرسي أنيق':
      return { bg: '#E0F2FE', fg: '#075985' };
    case 'طبيعة جميلة':
      return { bg: '#DCFCE7', fg: '#166534' };
    case 'فضاء ونجوم':
      return { bg: '#EDE9FE', fg: '#5B21B6' };
    case 'حيوانات لطيفة':
      return { bg: '#FFEDD5', fg: '#C2410C' };
    default:
      return { bg: '#ECFEFF', fg: '#0F766E' };
  }
};

const makeSvgDataUrl = (text: string, index: number, bg: string, fg: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
      <rect width="100%" height="100%" fill="${bg}" />
      <text x="50%" y="42%" text-anchor="middle" font-size="42" font-family="Arial" fill="${fg}">
        صورة توضيحية ${index}
      </text>
      <text x="50%" y="54%" text-anchor="middle" font-size="28" font-family="Arial" fill="${fg}">
        ${text}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {};

    const studentName = sanitizeText(body.studentName);
    const teacherName = sanitizeText(body.teacherName);
    const schoolName = sanitizeText(body.schoolName);
    const grade = sanitizeText(body.grade);
    const title = sanitizeText(body.title);

    const lengthLevel = sanitizeText(body.lengthLevel, 'متوسط');
    const reportType = sanitizeText(body.reportType, 'بحث مدرسي');
    const writingStyle = sanitizeText(body.writingStyle, 'بسيط للأطفال');
    const coverTheme = sanitizeText(body.coverTheme, 'ملون ومرح');

    const imageCount = Number(body.imageCount || 3);
    const includeFunFacts = Boolean(body.includeFunFacts ?? true);
    const includeQuestions = Boolean(body.includeQuestions ?? true);

    if (!studentName || !teacherName || !schoolName || !grade || !title) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }

    const isUnsafeTopic = /(عنف|قتل|دم|سلاح|مخدر|جنس|رعب|تطرف|كره)/i.test(title);
    if (isUnsafeTopic) {
      return res.status(400).json({ error: 'عنوان البحث غير مناسب.' });
    }

    const safeImageCount = Math.max(1, Math.min(Number.isFinite(imageCount) ? imageCount : 3, 5));
    const fallback = buildSafeResearchFallback(title);

    let parsed: ResearchReport | null = null;

    try {
      const prompt = `
أنت معلم محترف.

اكتب بحثًا مدرسيًا عربيًا حقيقيًا ومفصلًا للأطفال عن الموضوع التالي:
"${title}"

بيانات إضافية:
- نوع العمل: ${reportType}
- أسلوب الشرح: ${writingStyle}
- مستوى الطول: ${lengthLevel}

الشروط:
- لا تستخدم قالبًا عامًا مكررًا
- اكتب معلومات حقيقية مرتبطة بالموضوع نفسه
- الشرح بسيط ومناسب لطلاب الابتدائي
- كل قسم فيه شرح واضح ونقاط مفيدة
- لا تكرر نفس العبارات
- اجعل المحتوى منظمًا وجاهزًا للعرض في المدرسة
- اقترح عناوين صور مرتبطة فعلًا بالموضوع

أعد النتيجة بصيغة JSON فقط:

{
  "title": "...",
  "coverTitle": "...",
  "coverSubtitle": "...",
  "introduction": "...",
  "sections": [
    {
      "heading": "...",
      "content": "...",
      "bullets": ["...", "..."]
    }
  ],
  "conclusion": "...",
  "whatWeLearned": ["...", "..."],
  "funFacts": ["...", "..."],
  "reviewQuestions": ["...", "..."],
  "imageQueries": ["...", "..."]
}
`;

      const raw = String((await generateTextWithAI(prompt)) || '').trim();

      if (raw && raw.trim().startsWith('{')) {
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const aiData = JSON.parse(cleaned);

        parsed = {
          title: sanitizeText(aiData?.title, fallback.title),
          coverTitle: sanitizeText(aiData?.coverTitle, title),
          coverSubtitle: sanitizeText(aiData?.coverSubtitle, `بحث عن ${title}`),
          introduction: sanitizeText(aiData?.introduction, fallback.introduction),
          sections: Array.isArray(aiData?.sections)
            ? aiData.sections.slice(0, 4).map((section: any) => ({
                heading: sanitizeText(section?.heading, 'عنوان فرعي'),
                content: sanitizeText(section?.content, ''),
                bullets: Array.isArray(section?.bullets)
                  ? section.bullets.slice(0, 6).map((b: any) => sanitizeText(String(b), '')).filter(Boolean)
                  : [],
              }))
            : fallback.sections.slice(0, 4),
          conclusion: sanitizeText(aiData?.conclusion, fallback.conclusion),
          whatWeLearned: Array.isArray(aiData?.whatWeLearned)
            ? aiData.whatWeLearned.slice(0, 5).map((x: any) => sanitizeText(String(x), '')).filter(Boolean)
            : fallback.whatWeLearned.slice(0, 5),
          funFacts: includeFunFacts
            ? (Array.isArray(aiData?.funFacts)
                ? aiData.funFacts.slice(0, 5).map((x: any) => sanitizeText(String(x), '')).filter(Boolean)
                : [`معلومة ممتعة عن ${title}`])
            : [],
          reviewQuestions: includeQuestions
            ? (Array.isArray(aiData?.reviewQuestions)
                ? aiData.reviewQuestions.slice(0, 5).map((x: any) => sanitizeText(String(x), '')).filter(Boolean)
                : [`ما الذي تعلمناه عن ${title}؟`])
            : [],
          imageQueries: Array.isArray(aiData?.imageQueries)
            ? aiData.imageQueries.slice(0, safeImageCount).map((x: any) => sanitizeText(String(x), '')).filter(Boolean)
            : fallback.imageQueries.slice(0, safeImageCount),
        };
      }
    } catch (e) {
      console.error('AI error fallback used', e);
    }

    if (!parsed) {
      parsed = {
        title: fallback.title,
        coverTitle: fallback.title,
        coverSubtitle: `بحث مدرسي ممتع عن ${fallback.title}`,
        introduction: fallback.introduction,
        sections: fallback.sections.slice(0, 4),
        conclusion: fallback.conclusion,
        whatWeLearned: fallback.whatWeLearned.slice(0, 5),
        funFacts: includeFunFacts ? [`معلومة ممتعة عن ${title}`] : [],
        reviewQuestions: includeQuestions ? [`ما الذي تعلمناه عن ${title}؟`] : [],
        imageQueries: fallback.imageQueries.slice(0, safeImageCount),
      };
    }

    const colors = pickPlaceholderColors(coverTheme);

    const images = parsed.imageQueries.map((q, i) => ({
      caption: q,
      url: makeSvgDataUrl(q, i + 1, colors.bg, colors.fg),
    }));

    return res.status(200).json({
      report: {
        student: {
          studentName,
          teacherName,
          schoolName,
          grade,
        },
        options: {
          reportType,
          writingStyle,
          imageCount: safeImageCount,
          coverTheme,
          includeFunFacts,
          includeQuestions,
          lengthLevel,
        },
        cover: {
          title: parsed.coverTitle || parsed.title,
          subtitle: parsed.coverSubtitle || `بحث عن ${parsed.title}`,
          theme: coverTheme,
          info: {
            studentName,
            teacherName,
            schoolName,
            grade,
          },
        },
        title: parsed.title,
        introduction: parsed.introduction,
        sections: parsed.sections,
        conclusion: parsed.conclusion,
        whatWeLearned: parsed.whatWeLearned,
        funFacts: parsed.funFacts,
        reviewQuestions: parsed.reviewQuestions,
        images,
        exportOptions: {
          pdf: true,
          word: true,
          paperSize: 'A4',
          rtl: true,
          printReady: true,
        },
      },
    });
  } catch (error: any) {
    console.error('FATAL:', error);
    return res.status(500).json({
      error: 'server_error',
      details: error?.message,
    });
  }
}
