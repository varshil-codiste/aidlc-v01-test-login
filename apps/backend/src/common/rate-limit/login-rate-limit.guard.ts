import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

// LC-001 / P-SCAL-001 / P-SEC-003 / BR-A06 / NFR-SEC-004
// In-memory per-email rate-limit: 5 failed attempts per 15 min → 429 with Retry-After.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, number[]>();

export function recordLoginFailure(email: string): void {
  const now = Date.now();
  const list = (attempts.get(email) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  attempts.set(email, list);
}

export function clearLoginAttempts(email: string): void {
  attempts.delete(email);
}

function nextRetryAfterSeconds(email: string): number {
  const now = Date.now();
  const list = (attempts.get(email) ?? []).filter((t) => now - t < WINDOW_MS);
  attempts.set(email, list);
  if (list.length < MAX_ATTEMPTS) return 0;
  const oldest = Math.min(...list);
  return Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
}

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const http = ctx.switchToHttp();
    const req = http.getRequest<Request>();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (!email) return true; // validation pipe will reject anyway
    const retryAfter = nextRetryAfterSeconds(email);
    if (retryAfter > 0) {
      // BR-A06 + US-006 AC3 — surface Retry-After on the actual HTTP response BEFORE throwing.
      // The header must be present on the 429 response so the FE can render a live countdown.
      http.getResponse<Response>().setHeader('Retry-After', String(retryAfter));
      throw new HttpException(
        {
          type: 'https://example.com/errors/rate-limit',
          title: 'Too many attempts',
          status: HttpStatus.TOO_MANY_REQUESTS,
          detail: `Try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
          request_id: 'pending', // filled by ErrorEnvelopeFilter
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
