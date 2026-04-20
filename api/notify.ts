import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, type, data } = req.body;

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
    to: email,
    subject: type === 'approval' ? "✨ تمت الموافقة على انضمامك لنادي البطلات! ✨" : 
             type === 'pin_change' ? "🔐 تحديث الرمز السري - نادي البطلات" : 
             "تنبيه من نادي البطلات",
    html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; background-color: #fff5f7; border-radius: 20px; border: 2px solid #ff85a2;">
        <h1 style="color: #ff85a2;">مرحباً يا بطلة ${data?.name || ''}!</h1>
        <p style="font-size: 18px; color: #a4508b;">${data?.message || ''}</p>
        <div style="background-color: white; padding: 15px; border-radius: 15px; margin-top: 20px;">
          <p><strong>اسم البطولة:</strong> ${data?.heroName || ''}</p>
          <p>يمكنكِ الآن الدخول إلى عالمك السحري باستخدام اسمك والرمز السري الخاص بكِ.</p>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #ff85a2;">&copy; 2026 نادي البطلات الصغيرات</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, error: "Failed to send email" });
  }
}
