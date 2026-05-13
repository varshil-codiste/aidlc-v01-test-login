import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ErrorEnvelopeFilter } from './common/filters/error-envelope.filter';

const REQUIRED_ENV = ['DATABASE_URL', 'JWT_PRIVATE_KEY', 'JWT_PUBLIC_KEY', 'FE_ORIGIN', 'APP_ENV'] as const;

function assertEnv(): void {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    // NFR-REL-003 — fail fast, BEFORE the HTTP server starts.
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        level: 'fatal',
        message: 'missing required env vars',
        missing,
        timestamp: new Date().toISOString(),
      }),
    );
    process.exit(1);
  }
}

async function bootstrap(): Promise<void> {
  assertEnv();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(PinoLogger));
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FE_ORIGIN,
    credentials: true,
  });

  app.useGlobalFilters(new ErrorEnvelopeFilter());

  // OpenAPI / Swagger
  if (process.env.APP_ENV !== 'prod') {
    const config = new DocumentBuilder()
      .setTitle('login-account-setup — auth API')
      .setDescription('Login + account-setup feature; RS256 JWT in HttpOnly cookies.')
      .setVersion('0.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
}

void bootstrap();
