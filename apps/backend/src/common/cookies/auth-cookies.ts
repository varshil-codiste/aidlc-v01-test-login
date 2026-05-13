import type { Response } from 'express';

// LC-004 / P-SEC-005 / BR-A10 — the ONLY place auth cookies are set.
// Direct `res.cookie('access_token', ...)` outside this module is forbidden (caught at review).

const ACCESS_TOKEN_TTL_S = 15 * 60;             // 15 min
const REFRESH_TOKEN_TTL_S = 7 * 24 * 60 * 60;   // 7 days
const ACCESS = 'access_token';
const REFRESH = 'refresh_token';

export const AUTH_COOKIE_NAMES = { ACCESS, REFRESH } as const;

function commonOpts(): {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
} {
  return {
    httpOnly: true,
    secure: process.env.APP_ENV !== 'dev',
    sameSite: 'lax',
    path: '/',
  };
}

export function setAuthCookies(res: Response, access: string, refresh: string): void {
  res.cookie(ACCESS,  access,  { ...commonOpts(), maxAge: ACCESS_TOKEN_TTL_S  * 1000 });
  res.cookie(REFRESH, refresh, { ...commonOpts(), maxAge: REFRESH_TOKEN_TTL_S * 1000 });
}

export function clearAuthCookies(res: Response): void {
  res.cookie(ACCESS,  '', { ...commonOpts(), maxAge: 0 });
  res.cookie(REFRESH, '', { ...commonOpts(), maxAge: 0 });
}
