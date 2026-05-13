// LC-013 / P-SEC-006 / BR-A07 / NFR-SEC-009
// SINGLE source of the credentials-invalid envelope.
// Used by both signup-duplicate and login-fail to guarantee byte-identical body.

export interface ProblemJson {
  type: string;
  title: string;
  status: number;
  detail: string;
  request_id: string;
}

export const INVALID_CREDENTIALS_TYPE = 'https://example.com/errors/credentials';

export function invalidCredentialsError(requestId: string): ProblemJson {
  return {
    type: INVALID_CREDENTIALS_TYPE,
    title: 'Invalid credentials',
    status: 401,
    detail: 'Email or password is invalid.',
    request_id: requestId,
  };
}
