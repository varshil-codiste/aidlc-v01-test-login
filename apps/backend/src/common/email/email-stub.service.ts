import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

// LC-008 — Email-verification stub. NO SMTP. Logs a single structured JSON line.
// Shape pinned by Stage 8 Q2=A (7 fields).

export interface EmailVerificationStubInput {
  to: string;
  displayName: string;
  requestId: string;
}

@Injectable()
export class EmailStubService {
  private readonly log = new Logger('EmailStub');

  emit(input: EmailVerificationStubInput): { verification_token: string } {
    const verification_token = randomUUID();
    this.log.log({
      event: 'email_verification_stub',
      to: input.to,
      subject: 'Welcome — please verify your email',
      body: `Hi ${input.displayName}, click the link to verify. (Stub: no real email sent.)`,
      verification_token,
      request_id: input.requestId,
      timestamp: new Date().toISOString(),
    });
    return { verification_token };
  }
}
