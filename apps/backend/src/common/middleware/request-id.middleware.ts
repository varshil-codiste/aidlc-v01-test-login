import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

// LC-002 / P-OBS-001 — Generate or pass-through a request_id.
// Reads W3C `traceparent` if present; otherwise generates UUIDv4.
// Attaches to `req.id` and emits `X-Request-Id` response header.

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const traceparent = req.header('traceparent');
    const id = extractTraceId(traceparent) ?? randomUUID();
    (req as Request & { id: string }).id = id;
    res.setHeader('X-Request-Id', id);
    next();
  }
}

function extractTraceId(traceparent: string | undefined): string | null {
  // W3C traceparent format: "00-<trace-id-32hex>-<span-id-16hex>-<flags>"
  if (!traceparent) return null;
  const parts = traceparent.split('-');
  if (parts.length !== 4 || parts[1].length !== 32) return null;
  return parts[1];
}
