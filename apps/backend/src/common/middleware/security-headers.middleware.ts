import { Injectable, NestMiddleware } from '@nestjs/common';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

// P-SEC-004 / NFR-SEC-005 — strict security headers on every response.

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  private readonly h = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    strictTransportSecurity:
      process.env.APP_ENV === 'prod'
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: false }
        : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginEmbedderPolicy: false,
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.h(req, res, () => {
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      next();
    });
  }
}
