import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate JWT
    const secret = (process.env.JWT_SECRET || 'secret') as jwt.Secret;
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        bio: user.bio,
        vacationMode: user.vacationMode,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message.includes('already') ? 400 : 500;
    return errorResponse(message, status);
  }
}
