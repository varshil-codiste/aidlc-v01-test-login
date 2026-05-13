import { Body, Controller, Get, Patch, Req, UseGuards, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { JwtCookieGuard } from '../common/guards/jwt-cookie.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UpdateProfileSchema } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtCookieGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@Req() req: Request & { user_id: string }) {
    return this.users.getMe(req.user_id);
  }

  @Patch('me/profile')
  @UsePipes(new ZodValidationPipe(UpdateProfileSchema))
  async updateProfile(@Body() body: unknown, @Req() req: Request & { user_id: string }) {
    return this.users.updateProfile(req.user_id, body as never);
  }
}
