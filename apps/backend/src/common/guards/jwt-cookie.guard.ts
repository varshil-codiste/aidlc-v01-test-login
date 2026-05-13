import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AUTH_COOKIE_NAMES } from '../cookies/auth-cookies';
import { JwtSignerService } from '../crypto/jwt-signer.service';

// LC-011 / P-SEC-002 — verifies the access_token cookie. Populates ctx.user_id.

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(private readonly jwt: JwtSignerService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { user_id?: string }>();
    const token = req.cookies?.[AUTH_COOKIE_NAMES.ACCESS];
    if (!token) throw new UnauthorizedException('No auth cookie');
    try {
      const { sub } = await this.jwt.verifyAccess(token);
      req.user_id = sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid auth cookie');
    }
  }
}
