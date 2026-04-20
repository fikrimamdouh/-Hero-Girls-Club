import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSafeDesignFallback, generateTextWithAI, sanitizeText } from './_aiHelpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const prompt = sanitizeText(req.body?.prompt);
  const childName = sanitizeText(req.body?.childName, 'بطلتنا');
  const persona = sanitizeText(req.body?.persona, '🛡️ البطل مالك');
  const scribbleData = typeof req.body?.scribbleData === 'string' ? req.body.scribbleData : '';

  const seed = Math.floor(Math.random() * 1000000);
  const cleanPrompt = (prompt || 'magic fantasy art for kids').replace(/[^\w\s]/gi, '').substring(0, 100);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + ' highly detailed digital art for children magical vibrant colors') + '?seed=' + seed + '&width=1024&height=1024&nologo=true'}`;

  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    return res.status(200).json({ text: buildSafeDesignFallback(childName, prompt, persona), imageUrl });
  }

  try {
    const promptText = `أنت مساعد تصميم ذكي للأطفال باسم ${persona}.\nقواعد الأمان: امنع المحتوى غير المناسب للأطفال.\nاكتب الرد بعناوين: الفكرة الأساسية، الألوان المقترحة، العناصر الجميلة، خطوات التنفيذ، نصيحة تعليمية صغيرة.\nاسم الطفلة: ${childName}.\nالطلب: ${prompt || 'أريد فكرة تصميم ممتعة'}.`;
    const text = await generateTextWithAI(promptText, scribbleData ? { scribbleData } : undefined);
    return res.status(200).json({ text: text || buildSafeDesignFallback(childName, prompt, persona), imageUrl });
  } catch (error) {
    return res.status(200).json({ text: buildSafeDesignFallback(childName, prompt, persona), imageUrl });
  }
}
