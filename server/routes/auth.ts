import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { generateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const token = generateToken({ id: user.id, username: user.username });
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ user: req.adminUser });
});

// POST /api/auth/change-password
authRouter.post('/change-password', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.adminUser!.id;

    const user = await prisma.adminUser.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    res.status(500).json({ error: 'Failed to update password' });
  }
});
