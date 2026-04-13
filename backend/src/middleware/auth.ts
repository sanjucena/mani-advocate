// ============================================================
// 📁 middleware/auth.ts — Authentication Middleware
// ============================================================
// This middleware protects routes by verifying JWT tokens.
//
// INTERVIEW TIP: "Middleware in Express is a function that has
// access to req, res, and next. It can:
//   - Execute code
//   - Modify req/res objects
//   - End the request-response cycle
//   - Call the next middleware with next()
// Auth middleware checks the JWT token before letting the
// request reach the controller."
//
// FLOW:
// Client Request → auth middleware → controller
//   ↓ (if no valid token)
//   401 Unauthorized response
// ============================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend Express Request to include our user
// INTERVIEW TIP: "Declaration merging lets us add custom
// properties to existing types. Here we add 'user' to Request
// so TypeScript knows about it in our controllers."
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Interface for JWT payload
interface JwtPayload {
  id: string;
  role: string;
}

// ============================================================
// PROTECT MIDDLEWARE — Verify JWT Token
// ============================================================
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // INTERVIEW TIP: "The Authorization header format is:
    // 'Bearer <token>'. We extract just the token part."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.',
      });
      return;
    }

    // Verify the token
    // INTERVIEW TIP: "jwt.verify() decodes the token AND checks
    // if it's been tampered with using the secret. If someone
    // modifies the payload, the signature won't match."
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Find the user and attach to request
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
      return;
    }

    req.user = user;
    next(); // Pass control to the next middleware/controller
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.',
    });
  }
};

// ============================================================
// AUTHORIZE MIDDLEWARE — Role-Based Access Control
// ============================================================
// INTERVIEW TIP: "This is a higher-order function — a function
// that returns a function. We pass in allowed roles, and it
// returns middleware that checks if the user's role is included."
//
// Usage: router.delete('/cases/:id', protect, authorize('admin'), deleteCase)
// ============================================================
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Role '${req.user?.role}' is not authorized for this action.`,
      });
      return;
    }
    next();
  };
};
