import { Controller, Get, Header } from '@nestjs/common';
import { JwtSignerService } from '../common/crypto/jwt-signer.service';

@Controller('.well-known')
export class JwksController {
  constructor(private readonly jwt: JwtSignerService) {}

  @Get('jwks.json')
  @Header('Cache-Control', 'public, max-age=86400') // Stage 10 Q3=B — 24h cache
  @Header('Content-Type', 'application/json')
  jwks() {
    return this.jwt.jwks();
  }
}
