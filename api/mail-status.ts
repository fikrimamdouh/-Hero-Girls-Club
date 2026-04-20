import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
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

  try {
    await transporter.verify();
    return res.status(200).json({ status: "connected" });
  } catch (error) {
    console.error("Transporter verify failed:", error);
    return res.status(200).json({ 
      status: "disconnected", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}
