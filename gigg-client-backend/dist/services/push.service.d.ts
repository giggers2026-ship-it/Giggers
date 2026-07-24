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
export declare function savePushSubscription(userId: string, subscription: PushSubscriptionInput, userAgent?: string): Promise<boolean>;
export declare function removePushSubscription(endpoint: string): Promise<boolean>;
export declare function sendUserPushNotification(userId: string, payload: PushPayload): Promise<number>;
export declare function broadcastNewJobPush(city: string, jobTitle: string, jobId: string): Promise<number>;
//# sourceMappingURL=push.service.d.ts.map