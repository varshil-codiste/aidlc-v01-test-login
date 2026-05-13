import { Global, Module } from '@nestjs/common';
import { PasswordHasherService } from './password-hasher.service';
import { JwtSignerService } from './jwt-signer.service';

@Global()
@Module({
  providers: [PasswordHasherService, JwtSignerService],
  exports: [PasswordHasherService, JwtSignerService],
})
export class CryptoModule {}
