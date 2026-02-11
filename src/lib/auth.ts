import jwt from 'jsonwebtoken';
import prisma from './prisma';
import { NextRequest } from 'next/server';

interface JwtPayload {
  userId: string;
  email: string;
}

export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
