import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || undefined });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX_INPUT_LENGTH = 500;

export const sanitizeText = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[<>`$]/g, '').trim().slice(0, MAX_INPUT_LENGTH);
};

export const buildSafeChatFallback = (assistantName: string, childName: string, message: string) => {
  const safeName = assistantName || 'المساعد الذكي';
  const safeChildName = childName || 'بطلتنا';
  const userTopic = message || 'فكرة تعليمية ممتعة';
  return `مرحباً يا ${safeChildName} ✨\nأنا ${safeName}، وجاهز أساعدك فوراً!\n\nفهمت طلبك: "${userTopic}"\n\nخلينا نبدأ بخطوات بسيطة:\n1) نشرح الفكرة بجملة سهلة.\n2) نعطي مثالاً من الحياة اليومية.\n3) نكتب نشاطاً صغيراً تطبقينه الآن.\n\nأنا معك خطوة بخطوة 💛`;
};

export const buildSafeDesignFallback = (childName: string, prompt: string, persona: string) => {
  const assistantName = persona || '🛡️ البطل مالك';
  return `مرحباً يا ${childName} 🌟\nأنا ${assistantName} وسأساعدك الآن بخطة سريعة!\n\n1) الفكرة الأساسية:\n${prompt || 'تصميم بسيط ومبهج يناسب طفلة مبدعة'}\n\n2) الألوان المقترحة:\nوردي فاتح + بنفسجي + لمسة سماوي.\n\n3) العناصر الجميلة:\nنجوم صغيرة، مكتب مرتب، لوحة إلهام، نبات لطيف.\n\n4) خطوات التنفيذ:\n- ارسم/ي مخططاً بسيطاً.\n- حددي 3 ألوان رئيسية.\n- أضيفي عنصرين مميزين.\n\n5) نصيحة تعليمية صغيرة:\nالتخطيط أولاً يجعل أي فكرة أجمل وأسهل ✨`;
};

export const buildSafeResearchFallback = (title: string) => ({
  title: title || 'بحث مدرسي مبسط',
  introduction: 'هذا بحث مدرسي مبسط يشرح الفكرة بطريقة سهلة وممتعة ومناسبة للطلاب.',
  sections: [
    {
      heading: 'تعريف الموضوع',
      content: 'نتعرف على الموضوع بشكل بسيط ولماذا هو مهم.',
      bullets: ['المعنى الأساسي', 'أهمية الموضوع', 'أمثلة بسيطة'],
    },
    {
      heading: 'معلومات أساسية',
      content: 'حقائق واضحة وقصيرة تساعد على الفهم.',
      bullets: ['حقائق مبسطة', 'أمثلة مدرسية', 'مقارنة صغيرة'],
    },
    {
      heading: 'تطبيقات عملية',
      content: 'كيف نستفيد منه في المدرسة والمنزل.',
      bullets: ['في المدرسة', 'في المنزل', 'نشاط تطبيقي'],
    },
  ],
  conclusion: 'تعلمنا أن البحث يساعدنا على التفكير المنظم والتعلم الممتع.',
  whatWeLearned: ['رتبنا أفكارنا', 'تعلمنا حقائق جديدة', 'عرفنا تطبيقات عملية'],
  imageQueries: [title || 'school research', 'education kids', 'classroom learning'],
});

const safeString = (value: unknown) => String(value || '').trim();

export const generateTextWithAI = async (prompt: string, options?: { scribbleData?: string }) => {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (openaiKey && openaiKey.trim()) {
      try {
        const hasImage = !!options?.scribbleData;

        const completion = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          temperature: 0.4,
          messages: [
            hasImage
              ? {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: options?.scribbleData || '' } },
                  ],
                } as any
              : { role: 'user', content: prompt },
          ],
        });

        return safeString(completion.choices?.[0]?.message?.content);
      } catch (openaiError: any) {
        console.error('OpenAI error:', openaiError?.message || openaiError);
      }
    }

    if (geminiKey && geminiKey.trim()) {
      try {
        if (options?.scribbleData) {
          const base64Data = options.scribbleData.split(',')[1];
          const result = await (gemini as any).models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  { inlineData: { data: base64Data, mimeType: 'image/png' } },
                ],
              },
            ],
          });

          return safeString(result?.text);
        }

        const result = await (gemini as any).models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        return safeString(result?.text);
      } catch (geminiError: any) {
        const message = geminiError?.message || '';
        const status = geminiError?.status || geminiError?.code || '';

        console.error('Gemini error:', message || geminiError);

        if (String(status) === '429' || message.includes('429') || message.toLowerCase().includes('quota')) {
          console.error('Gemini rate limit or quota exceeded, using fallback');
          return '';
        }

        return '';
      }
    }

    console.error('No AI provider configured');
    return '';
  } catch (error) {
    console.error('generateTextWithAI error:', error);
    return '';
  }
};
