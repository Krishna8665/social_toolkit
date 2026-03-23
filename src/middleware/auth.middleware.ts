// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // You can also support cookie-based JWT later if needed
  // if (!token && req.cookies?.token) token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized - no token' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Not authorized - invalid token' });
  }

  req.user = {
    id: decoded.id,
    email: decoded.email,
    plan: decoded.plan,
  };

  next();
};