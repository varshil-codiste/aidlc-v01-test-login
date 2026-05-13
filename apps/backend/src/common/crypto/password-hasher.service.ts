import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

// LC-005 / P-SEC-009 / BR-A03 / NFR-SEC-001
// Frozen params — pinned per Stage 9. Do NOT read from env.

const PARAMS = {
  type: argon2.argon2id,
  memoryCost: 19_456,  // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

@Injectable()
export class PasswordHasherService {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, PARAMS);
  }

  async verify(plain: string, encoded: string): Promise<boolean> {
    try {
      // verify() reads Argon2id params from the encoded hash itself; passing PARAMS is a footgun.
      return await argon2.verify(encoded, plain);
    } catch {
      return false;
    }
  }
}
