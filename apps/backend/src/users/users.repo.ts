import { Injectable } from '@nestjs/common';
import { PrismaClient, type User } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { Role } from '../../../../shared/role';

@Injectable()
export class UsersRepo {
  private readonly prisma = new PrismaClient();

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(input: { email: string; displayName: string; passwordHash: string; role: Role }): Promise<User> {
    return this.prisma.user.create({
      data: {
        id: randomUUID(),
        email: input.email,
        displayName: input.displayName,
        passwordHash: input.passwordHash,
        role: input.role,
      },
    });
  }

  async updateProfile(id: string, input: { displayName: string; timezone: string }): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        displayName: input.displayName,
        timezone: input.timezone,
        accountSetupCompleted: true,
      },
    });
  }
}
