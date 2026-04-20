import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!_ai) {
    const key = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
    _ai = new GoogleGenAI({ apiKey: key });
  }
  return _ai;
}

export const generateMagicStory = async (heroName: string, heroPower: string, theme: string) => {
  try {
    const ai = getAI();
    const prompt = `اكتب قصة قصيرة ملهمة وممتعة للأطفال عن بطلة اسمها ${heroName} تمتلك قوة ${heroPower}. 
      موضوع القصة هو: ${theme}. 
      اجعل القصة باللغة العربية الفصحى البسيطة، مليئة بالخيال والقيم الإيجابية، وتنتهي بسؤال تفاعلي للطفلة.`;

    const response = await (ai as any).models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating story:", error);
    return "كان يا ما كان في قديم الزمان، بطلة شجاعة مثلك تماماً... (حدث خطأ في السحر، حاول مرة أخرى!)";
  }
};

export const generateDailyQuest = async (heroName: string) => {
  try {
    const ai = getAI();
    const prompt = `اقترح مهمة يومية بسيطة وممتعة لطفلة اسمها ${heroName} لتقوم بها في العالم الحقيقي (مثل: مساعدة الأم، ترتيب الغرفة، قراءة صفحة من كتاب). 
      اجعل المهمة تبدو كأنها مهمة سحرية من عالم الأبطال. ارجع النتيجة كنص قصير جداً ومشجع.`;

    const response = await (ai as any).models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "مهمتك اليوم هي نشر الابتسامة في كل مكان!";
  }
};
