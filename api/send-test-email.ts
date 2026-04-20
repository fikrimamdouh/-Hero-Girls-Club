import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const HARDCODED_EMAIL_USER = "rorofikri@gmail.com";
  const HARDCODED_EMAIL_PASS = "wsve omwv pgsc jtft";

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: HARDCODED_EMAIL_USER,
      pass: HARDCODED_EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: HARDCODED_EMAIL_USER,
    to: HARDCODED_EMAIL_USER,
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
    return res.status(200).json({ success: true, message: "Test email sent successfully" });
  } catch (error) {
    console.error("Error sending test email:", error);
    return res.status(500).json({ success: false, error: "Failed to send test email" });
  }
}
