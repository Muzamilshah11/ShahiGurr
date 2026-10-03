import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'khyber-gurr-secret-key-2026';

export interface AuthRequest extends Request {
  adminUser?: {
    id: string;
    username: string;
  };
}

export function generateToken(user: { id: string; username: string }) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. Admin token required.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string };
    req.adminUser = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}
