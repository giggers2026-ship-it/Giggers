import webpush from 'web-push';
import { supabase } from '../utils/supabase';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@giggers.in';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, any>;
}

// Save or update user push subscription
export async function savePushSubscription(userId: string, subscription: PushSubscriptionInput, userAgent?: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' }
    );

  if (error) {
    console.error('Failed to save push subscription:', error.message);
    return false;
  }
  return true;
}

// Remove push subscription (on logout or opt-out)
export async function removePushSubscription(endpoint: string): Promise<boolean> {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  return !error;
}

// Send push notification to a specific user across all their registered devices
export async function sendUserPushNotification(userId: string, payload: PushPayload): Promise<number> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured. Skipping push notification.');
    return 0;
  }

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (error || !subscriptions || subscriptions.length === 0) {
    return 0;
  }

  let sentCount = 0;
  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/logo.png',
    badge: payload.badge || '/logo.png',
    url: payload.url || '/notifications',
    tag: payload.tag || 'giggers-alert',
    data: payload.data || {},
  });

  for (const sub of subscriptions) {
    const pushSub = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSub, payloadString);
      sentCount++;
    } catch (err: any) {
      console.error('Push notification send error:', err.statusCode || err.message);
      // If subscription expired or invalid (404/410), delete it from DB
      if (err.statusCode === 404 || err.statusCode === 410) {
        await removePushSubscription(sub.endpoint);
      }
    }
  }

  return sentCount;
}

// Broadcast new job alert to workers in matching location
export async function broadcastNewJobPush(city: string, jobTitle: string, jobId: string): Promise<number> {
  if (!vapidPublicKey || !vapidPrivateKey) return 0;

  // Find worker profiles in matching city
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'worker')
    .ilike('city', `%${city}%`);

  if (!profiles || profiles.length === 0) return 0;

  let totalSent = 0;
  for (const profile of profiles) {
    const sent = await sendUserPushNotification(profile.id, {
      title: `⚡ New Gig in ${city}!`,
      body: jobTitle,
      url: `/jobs/${jobId}`,
      tag: `job-${jobId}`,
    });
    totalSent += sent;
  }

  return totalSent;
}
