import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthController } from './health/health.controller';
import { JwksController } from './jwks/jwks.controller';
import { CryptoModule } from './common/crypto/crypto.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';

const REDACT = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  '*.password',
  '*.passwordHash',
  '*.accessToken',
  '*.refreshToken',
];

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        redact: { paths: REDACT, censor: '[REDACTED]' },
        formatters: {
          level: (label) => ({ level: label }),
          bindings: () => ({
            service: 'login-account-setup-backend',
            version: process.env.npm_package_version ?? '0.1.0',
            environment: process.env.APP_ENV ?? 'dev',
          }),
        },
        timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      },
    }),
    CryptoModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [HealthController, JwksController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware, SecurityHeadersMiddleware).forRoutes('*');
  }
}
