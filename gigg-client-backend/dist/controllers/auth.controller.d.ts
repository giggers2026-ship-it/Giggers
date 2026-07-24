import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare function sendOtpHandler(req: Request, res: Response): Promise<void>;
export declare function verifyOtpHandler(req: Request, res: Response): Promise<void>;
export declare function meHandler(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function refreshHandler(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map