import 'reflect-metadata';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';
import { AppModule } from '../../src/app.module';
import { ErrorEnvelopeFilter } from '../../src/common/filters/error-envelope.filter';

// NFR-S09 paired check — signup-duplicate and login-fail return BYTE-IDENTICAL bodies.
// Integration test boots Nest + Postgres (via DATABASE_URL set by the harness / docker-compose).

describe('NFR-S09 enumeration safety (paired response)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Generate ephemeral RS256 keypair for the test process
    const { privateKey, publicKey } = await generateKeyPair('RS256', { modulusLength: 2048 });
    process.env.JWT_PRIVATE_KEY = await exportPKCS8(privateKey);
    process.env.JWT_PUBLIC_KEY = await exportSPKI(publicKey);
    process.env.FE_ORIGIN = process.env.FE_ORIGIN ?? 'http://localhost:3000';
    process.env.APP_ENV = 'ci';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalFilters(new ErrorEnvelopeFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('duplicate-email signup and wrong-password login return identical response bodies', async () => {
    const email = `user+${Date.now()}@example.com`;
    const goodPassword = 'CorrectHorseBattery42!';
    const wrongPassword = 'wrong-password-but-long-enough';

    // 1. Successful signup
    const ok = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, displayName: 'Test User', password: goodPassword, role: 'SELLER' });
    expect(ok.status).toBe(201);

    // 2. Duplicate signup
    const dup = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, displayName: 'Test User', password: goodPassword, role: 'SELLER' });

    // 3. Login with wrong password
    const wrong = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: wrongPassword });

    expect(dup.status).toBe(401);
    expect(wrong.status).toBe(401);

    // Both must have the same `type` and `detail`
    expect(dup.body.type).toBe(wrong.body.type);
    expect(dup.body.title).toBe(wrong.body.title);
    expect(dup.body.detail).toBe(wrong.body.detail);
    expect(dup.body.status).toBe(wrong.body.status);

    // request_id is per-request and intentionally different — that's the only allowed delta.
    // Confirm by deleting it from both copies and comparing the rest byte-for-byte.
    const { request_id: _a, ...restDup } = dup.body;
    const { request_id: _b, ...restWrong } = wrong.body;
    expect(restDup).toEqual(restWrong);
  });
});
