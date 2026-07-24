import { Response, Request } from 'express';
import { AuthenticatedRequest } from '../types';
export declare function createOrder(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function razorpayWebhook(req: Request, res: Response): Promise<void>;
export declare function getWallet(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function paymentHistory(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=payment.controller.d.ts.map