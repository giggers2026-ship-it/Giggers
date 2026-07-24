"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePushSubscription = savePushSubscription;
exports.removePushSubscription = removePushSubscription;
exports.sendUserPushNotification = sendUserPushNotification;
exports.broadcastNewJobPush = broadcastNewJobPush;
const web_push_1 = __importDefault(require("web-push"));
const supabase_1 = require("../utils/supabase");
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@giggers.in';
if (vapidPublicKey && vapidPrivateKey) {
    web_push_1.default.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}
// Save or update user push subscription
async function savePushSubscription(userId, subscription, userAgent) {
    const { data, error } = await supabase_1.supabase
        .from('push_subscriptions')
        .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: userAgent,
        updated_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' });
    if (error) {
        console.error('Failed to save push subscription:', error.message);
        return false;
    }
    return true;
}
// Remove push subscription (on logout or opt-out)
async function removePushSubscription(endpoint) {
    const { error } = await supabase_1.supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint);
    return !error;
}
// Send push notification to a specific user across all their registered devices
async function sendUserPushNotification(userId, payload) {
    if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn('VAPID keys not configured. Skipping push notification.');
        return 0;
    }
    const { data: subscriptions, error } = await supabase_1.supabase
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
            await web_push_1.default.sendNotification(pushSub, payloadString);
            sentCount++;
        }
        catch (err) {
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
async function broadcastNewJobPush(city, jobTitle, jobId) {
    if (!vapidPublicKey || !vapidPrivateKey)
        return 0;
    // Find worker profiles in matching city
    const { data: profiles } = await supabase_1.supabase
        .from('profiles')
        .select('id')
        .eq('role', 'worker')
        .ilike('city', `%${city}%`);
    if (!profiles || profiles.length === 0)
        return 0;
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
//# sourceMappingURL=push.service.js.map