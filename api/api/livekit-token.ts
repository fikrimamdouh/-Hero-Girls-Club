import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return res.status(500).json({ error: 'LiveKit env vars are missing' });
  }

  const roomName = String(req.body?.roomName || '').trim();
  const participantName = String(req.body?.participantName || '').trim();
  const participantId = String(req.body?.participantId || '').trim();

  if (!roomName || !participantName || !participantId) {
    return res.status(400).json({ error: 'roomName, participantName, participantId are required' });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName,
    ttl: '2h'
  });
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

  return res.status(200).json({ token: await at.toJwt(), url: livekitUrl });
}
