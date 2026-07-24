"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribePushHandler = subscribePushHandler;
exports.unsubscribePushHandler = unsubscribePushHandler;
exports.testPushHandler = testPushHandler;
const zod_1 = require("zod");
const push_service_1 = require("../services/push.service");
const subscriptionSchema = zod_1.z.object({
    endpoint: zod_1.z.string().url(),
    keys: zod_1.z.object({
        p256dh: zod_1.z.string().min(1),
        auth: zod_1.z.string().min(1),
    }),
});
// POST /api/notifications/subscribe
async function subscribePushHandler(req, res) {
    const result = subscriptionSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: 'Invalid push subscription payload' });
        return;
    }
    const userId = req.user.id;
    const userAgent = req.headers['user-agent'];
    const success = await (0, push_service_1.savePushSubscription)(userId, result.data, userAgent);
    if (success) {
        res.json({ message: 'Push subscription saved successfully' });
    }
    else {
        res.status(500).json({ error: 'Failed to save push subscription' });
    }
}
// POST /api/notifications/unsubscribe
async function unsubscribePushHandler(req, res) {
    const { endpoint } = req.body;
    if (!endpoint || typeof endpoint !== 'string') {
        res.status(400).json({ error: 'Endpoint is required' });
        return;
    }
    await (0, push_service_1.removePushSubscription)(endpoint);
    res.json({ message: 'Unsubscribed from push notifications' });
}
// POST /api/notifications/test-push (Test endpoint to send a push to current user)
async function testPushHandler(req, res) {
    const userId = req.user.id;
    const sentCount = await (0, push_service_1.sendUserPushNotification)(userId, {
        title: '🎉 Push Notifications Enabled!',
        body: 'You will now receive live alerts for new gigs and updates on Giggers.',
        url: '/notifications',
    });
    res.json({ message: `Test push sent to ${sentCount} device(s)` });
}
//# sourceMappingURL=push.controller.js.map