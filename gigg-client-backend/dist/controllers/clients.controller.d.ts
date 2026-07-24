import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare function inviteClient(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function redeemInvite(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function myClientJobs(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function revokeClient(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=clients.controller.d.ts.map