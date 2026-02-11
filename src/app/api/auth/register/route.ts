import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // Validate required fields
    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required', 400);
    }

    // Validate email format
    if (!email.includes('@')) {
      return errorResponse('Invalid email address', 400);
    }

    // Validate password length
    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('User with this email already exists', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const secret = (process.env.JWT_SECRET || 'secret') as jwt.Secret;
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    return successResponse({ user, token }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message.includes('already') ? 400 : 500;
    return errorResponse(message, status);
  }
}
