import Razorpay from 'razorpay';
export declare function getRazorpay(): Razorpay;
export declare function verifyWebhookSignature(body: string, signature: string): boolean;
export declare function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;
//# sourceMappingURL=razorpay.service.d.ts.map