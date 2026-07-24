import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare function updateLocation(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getJobLocations(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getWorkerDistance(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function geocodeHandler(req: AuthenticatedRequest, res: Response): Promise<void>;
//# sourceMappingURL=tracking.controller.d.ts.map