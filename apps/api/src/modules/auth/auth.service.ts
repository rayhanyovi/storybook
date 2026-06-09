import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { UserDTO } from '@storybook/shared';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';

export function toUserDTO(user: {
  id: string;
  email: string;
  role: string;
  onboardingCompletedAt: Date | null;
}): UserDTO {
  return {
    id: user.id,
    email: user.email,
    role: user.role as UserDTO['role'],
    onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null
  };
}

export function signToken(user: UserDTO): string {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function getMe(userId: string): Promise<UserDTO> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return toUserDTO(user);
}

export async function completeOnboarding(userId: string): Promise<{ onboardingCompletedAt: string }> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompletedAt: new Date() }
  });
  return { onboardingCompletedAt: user.onboardingCompletedAt!.toISOString() };
}

export async function resetDemoState(userId: string) {
  const result = await prisma.$transaction([
    prisma.readingProgress.deleteMany({ where: { userId } }),
    prisma.purchase.deleteMany({ where: { userId } }),
    prisma.subscription.deleteMany({ where: { userId } }),
    prisma.payment.deleteMany({ where: { userId } })
  ]);

  return {
    readingProgress: result[0].count,
    purchases: result[1].count,
    subscriptions: result[2].count,
    payments: result[3].count
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const dto = toUserDTO(user);
  const token = signToken(dto);

  return { token, user: dto };
}
