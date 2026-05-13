import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

// LC-010 / P-SEC-001 / NFR-SEC-006 — server-side schema validation is authoritative.

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    // `parse` throws ZodError → ErrorEnvelopeFilter converts to RFC 7807 400.
    return this.schema.parse(value);
  }
}
