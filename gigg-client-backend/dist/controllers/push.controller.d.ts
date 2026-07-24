import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare function subscribePushHandler(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function unsubscribePushHandler(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function testPushHandler(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=push.controller.d.ts.map