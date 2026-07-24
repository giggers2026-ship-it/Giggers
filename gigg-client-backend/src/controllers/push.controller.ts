import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { savePushSubscription, removePushSubscription, sendUserPushNotification } from '../services/push.service';

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

// POST /api/notifications/subscribe
export async function subscribePushHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const result = subscriptionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid push subscription payload' });
    return;
  }

  const userId = req.user!.id;
  const userAgent = req.headers['user-agent'];

  const success = await savePushSubscription(userId, result.data, userAgent);
  if (success) {
    res.json({ message: 'Push subscription saved successfully' });
  } else {
    res.status(500).json({ error: 'Failed to save push subscription' });
  }
}

// POST /api/notifications/unsubscribe
export async function unsubscribePushHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { endpoint } = req.body;
  if (!endpoint || typeof endpoint !== 'string') {
    res.status(400).json({ error: 'Endpoint is required' });
    return;
  }

  await removePushSubscription(endpoint);
  res.json({ message: 'Unsubscribed from push notifications' });
}

// POST /api/notifications/test-push (Test endpoint to send a push to current user)
export async function testPushHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const sentCount = await sendUserPushNotification(userId, {
    title: '🎉 Push Notifications Enabled!',
    body: 'You will now receive live alerts for new gigs and updates on Giggers.',
    url: '/notifications',
  });

  res.json({ message: `Test push sent to ${sentCount} device(s)` });
}
