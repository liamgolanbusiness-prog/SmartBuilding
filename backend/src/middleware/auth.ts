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
  };
}

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
      `SELECT id, building_id, role, apartment_number, is_active 
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

    // Attach user to request
    req.user = {
      id: user.id,
      buildingId: user.building_id,
      role: user.role,
      apartmentNumber: user.apartment_number,
    };

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
