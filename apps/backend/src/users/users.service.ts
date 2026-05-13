import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepo } from './users.repo';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { Role } from '../../../../shared/role';

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  verified: boolean;
  accountSetupCompleted: boolean;
  role: Role;
}

function sanitize(u: { id: string; email: string; displayName: string; timezone: string; verified: boolean; accountSetupCompleted: boolean; role: string }): UserDto {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    timezone: u.timezone,
    verified: u.verified,
    accountSetupCompleted: u.accountSetupCompleted,
    role: u.role as Role,
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepo) {}

  async getMe(userId: string): Promise<UserDto> {
    const u = await this.users.findById(userId);
    if (!u) throw new NotFoundException('User not found');
    return sanitize(u);
  }

  async updateProfile(userId: string, input: UpdateProfileDto): Promise<UserDto> {
    const u = await this.users.updateProfile(userId, input);
    return sanitize(u);
  }
}
