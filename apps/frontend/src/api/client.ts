// Typed API client.
// In production, `src/api/schema.ts` is generated from `apps/backend/openapi.yaml`
// via `npm run codegen:api`. This module wraps the schema with a silent-refresh interceptor.

import type { Role } from '../../../../shared/role';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  verified: boolean;
  accountSetupCompleted: boolean;
  role: Role;
}

export interface ProblemJsonError {
  type: string;
  title: string;
  status: number;
  detail: string;
  request_id: string;
}

async function request<T>(path: string, init: RequestInit, retryOn401 = true): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...init.headers },
    ...init,
  });

  if (res.status === 401 && retryOn401 && !path.startsWith('/auth/refresh') && !path.startsWith('/auth/login') && !path.startsWith('/auth/signup')) {
    const refreshed = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refreshed.ok) return request<T>(path, init, false);
  }

  if (!res.ok) {
    const body: ProblemJsonError = await res.json().catch(() => ({
      type: 'unknown',
      title: 'Network error',
      status: res.status,
      detail: 'Could not parse error body',
      request_id: 'unknown',
    }));
    throw body;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  signup(input: { email: string; displayName: string; password: string; role: Role }) {
    return request<{ user: UserDto }>('/auth/signup', { method: 'POST', body: JSON.stringify(input) });
  },
  login(input: { email: string; password: string }) {
    return request<{ user: UserDto }>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
  },
  refresh() {
    return request<{ user: UserDto }>('/auth/refresh', { method: 'POST' });
  },
  logout() {
    return request<void>('/auth/logout', { method: 'POST' });
  },
  getMe() {
    return request<UserDto>('/users/me', { method: 'GET' });
  },
  updateProfile(input: { displayName: string; timezone: string }) {
    return request<UserDto>('/users/me/profile', { method: 'PATCH', body: JSON.stringify(input) });
  },
};
