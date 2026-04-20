import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, heroName, phone } = req.body;

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

  try {
    await transporter.sendMail({
      from: `"نادي البطلات الصغيرات" <${HARDCODED_EMAIL_USER}>`,
      to: HARDCODED_EMAIL_USER, // Send to admin
      subject: '✨ تسجيل بطلة جديدة في النادي!',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #fdf2f8; border-radius: 10px;">
          <h2 style="color: #db2777;">مرحباً! هناك بطلة جديدة تود الانضمام للنادي 🌟</h2>
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <p><strong>اسم ولية الأمر:</strong> ${name}</p>
            <p><strong>رقم الهاتف:</strong> ${phone || 'لم يتم إدخاله'}</p>
            <p><strong>البريد الإلكتروني:</strong> ${email || 'لم يتم إدخاله'}</p>
            <p><strong>اسم البطلة:</strong> ${heroName || 'لم يتم اختياره بعد'}</p>
          </div>
          <p style="margin-top: 20px; color: #666;">يمكنك مراجعة الطلب من لوحة تحكم الإدارة.</p>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email sending failed:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
