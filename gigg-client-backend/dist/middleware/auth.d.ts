import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export declare function requireRole(...roles: string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map