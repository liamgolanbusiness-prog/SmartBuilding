import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { query } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    buildingId: string;
    role: string;
    apartmentNumber: string;
    approvalStatus: string;
  };
}

// Endpoints a still-pending (unapproved) user is allowed to reach.
// Everything else returns 403 until a vaad member approves them.
const PENDING_ALLOWED_PATHS = new Set<string>([
  '/api/auth/logout',
  '/api/residents/me/pending',
  '/api/residents/me/cancel-pending',
]);

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database
    const result = await query(
      `SELECT id, building_id, role, apartment_number, is_active, approval_status
       FROM residents
       WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 401);
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new AppError('User account is disabled', 401);
    }

    const approvalStatus = user.approval_status || 'approved';
    if (approvalStatus === 'rejected') {
      throw new AppError('Your request was rejected by the building committee', 403);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      buildingId: user.building_id,
      role: user.role,
      apartmentNumber: user.apartment_number,
      approvalStatus,
    };

    // Pending users can only reach a whitelisted set of endpoints (the
    // "waiting for approval" screen + logout). Everything else → 403.
    if (approvalStatus === 'pending' && !PENDING_ALLOWED_PATHS.has(req.path)) {
      throw new AppError('ACCOUNT_PENDING_APPROVAL', 403);
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};
