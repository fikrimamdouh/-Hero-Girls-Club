import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSafeChatFallback, generateTextWithAI, sanitizeText } from './_aiHelpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const chatHistory = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const assistantName = sanitizeText(req.body?.assistantData?.name, 'المساعد الذكي');
  const childName = sanitizeText(req.body?.childName, 'بطلتنا');
  const lastMessage = sanitizeText(
    chatHistory?.[chatHistory.length - 1]?.content ||
    chatHistory?.[chatHistory.length - 1]?.text ||
    ''
  );

  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    return res.status(200).json({ text: buildSafeChatFallback(assistantName, childName, lastMessage) });
  }

  try {
    const systemPrompt = `
أنت الآن المساعد الذكي للأطفال "${assistantName}".
نادِ الطفلة باسم "${childName}" دائماً.
اجعل الأسلوب ممتعاً، آمناً، ومناسباً للأطفال.
تجنب أي محتوى غير مناسب.
`;
    const fullPrompt = `${systemPrompt}\n\nسجلات المحادثة:\n${chatHistory
      .slice(0, -1)
      .map((m: any) => `${m.role}: ${m.content || m.text}`)
      .join('\n')}\n\nسؤال الطفلة: ${lastMessage}`;

    const text = await generateTextWithAI(fullPrompt);
    return res.status(200).json({ text: text || buildSafeChatFallback(assistantName, childName, lastMessage) });
  } catch (error) {
    return res.status(200).json({ text: buildSafeChatFallback(assistantName, childName, lastMessage) });
  }
}
