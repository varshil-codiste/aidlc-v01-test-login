import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ProblemJson } from '../errors/invalid-credentials';

// LC-012 — Outermost error catch. Converts any unhandled error to RFC 7807.
// All responses MUST include `request_id` (NFR-OBS-004).

@Catch()
export class ErrorEnvelopeFilter implements ExceptionFilter {
  private readonly log = new Logger(ErrorEnvelopeFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request & { id: string }>();
    const requestId = req.id ?? 'unknown';

    const { status, body } = this.toEnvelope(exception, requestId);

    // Errors get logged. pino-http's default Error serializer drops non-enumerable
    // fields, so we explicitly forward message + stack so debug logs are useful.
    if (status >= 500) {
      const err = exception as Error;
      this.log.error(
        { err: { message: err?.message, stack: err?.stack, name: err?.name }, request_id: requestId },
        'unhandled-error',
      );
    }

    res.status(status).type('application/problem+json').send(body);
  }

  private toEnvelope(exception: unknown, requestId: string): { status: number; body: ProblemJson } {
    if (exception instanceof ZodError) {
      const detail = exception.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      return {
        status: HttpStatus.BAD_REQUEST,
        body: {
          type: 'https://example.com/errors/validation',
          title: 'Validation failed',
          status: HttpStatus.BAD_REQUEST,
          detail,
          request_id: requestId,
        },
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resp = exception.getResponse();
      // If the thrower already produced an RFC 7807 envelope, pass it through verbatim
      // (used by invalidCredentialsError to keep signup-dup and login-fail byte-identical).
      if (isProblemJson(resp)) {
        return { status, body: { ...resp, request_id: requestId } };
      }
      const detail = typeof resp === 'string' ? resp : (resp as { message?: string }).message ?? 'Error';
      return {
        status,
        body: {
          type: `https://example.com/errors/${slugForStatus(status)}`,
          title: HttpException.name,
          status,
          detail,
          request_id: requestId,
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        type: 'https://example.com/errors/internal',
        title: 'Internal server error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        detail: 'An unexpected error occurred.',
        request_id: requestId,
      },
    };
  }
}

function isProblemJson(x: unknown): x is ProblemJson {
  return typeof x === 'object' && x !== null && 'type' in x && 'title' in x && 'status' in x;
}

function slugForStatus(status: number): string {
  switch (status) {
    case 401: return 'unauthenticated';
    case 403: return 'forbidden';
    case 404: return 'not-found';
    case 429: return 'rate-limit';
    default:  return 'http';
  }
}
