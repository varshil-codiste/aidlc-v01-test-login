import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokensRepo } from './refresh-tokens.repo';
import { UsersModule } from '../users/users.module';
import { EmailStubService } from '../common/email/email-stub.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokensRepo, EmailStubService],
})
export class AuthModule {}
