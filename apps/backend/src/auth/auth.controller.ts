import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignupSchema } from './dto/signup.dto';
import { LoginSchema } from './dto/login.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { LoginRateLimitGuard } from '../common/rate-limit/login-rate-limit.guard';
import { setAuthCookies, clearAuthCookies, AUTH_COOKIE_NAMES } from '../common/cookies/auth-cookies';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(SignupSchema))
  async signup(@Body() body: unknown, @Req() req: Request & { id: string }, @Res({ passthrough: true }) res: Response) {
    const out = await this.auth.signup(body as never, req.id);
    setAuthCookies(res, out.accessToken, out.refreshToken);
    return { user: out.user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoginRateLimitGuard)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() body: unknown, @Req() req: Request & { id: string }, @Res({ passthrough: true }) res: Response) {
    const out = await this.auth.login(body as never, req.id);
    setAuthCookies(res, out.accessToken, out.refreshToken);
    return { user: out.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const presented = req.cookies?.[AUTH_COOKIE_NAMES.REFRESH];
    const out = await this.auth.refresh(presented);
    setAuthCookies(res, out.accessToken, out.refreshToken);
    return { user: out.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const presented = req.cookies?.[AUTH_COOKIE_NAMES.REFRESH];
    await this.auth.logout(presented);
    clearAuthCookies(res);
  }
}
