import 'reflect-metadata';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';
import { AppModule } from '../../src/app.module';
import { ErrorEnvelopeFilter } from '../../src/common/filters/error-envelope.filter';

// NFR-T05 — signup-with-role coverage. BR-A13 + BR-A14 + NFR-S11.
// Runs against the real Postgres (DATABASE_URL set by harness / docker-compose).

describe('NFR-T05 signup with role', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256', { modulusLength: 2048 });
    process.env.JWT_PRIVATE_KEY = await exportPKCS8(privateKey);
    process.env.JWT_PUBLIC_KEY = await exportSPKI(publicKey);
    process.env.FE_ORIGIN = process.env.FE_ORIGIN ?? 'http://localhost:3000';
    // Use 'dev' so cookies are NOT marked Secure — supertest does not use HTTPS,
    // and the /users/me round-trip below needs the cookie to ride along.
    process.env.APP_ENV = 'dev';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalFilters(new ErrorEnvelopeFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('valid MERCHANT signup returns 201 with user.role === "MERCHANT"', async () => {
    const email = `merchant+${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, displayName: 'Merchant Test', password: 'CorrectHorseBattery42!', role: 'MERCHANT' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('MERCHANT');
  });

  it('valid SELLER signup returns 201 with user.role === "SELLER"', async () => {
    const email = `seller+${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, displayName: 'Seller Test', password: 'CorrectHorseBattery42!', role: 'SELLER' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('SELLER');
  });

  it('missing role returns 400 auth.role.invalid (validation envelope)', async () => {
    const email = `noroles+${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, displayName: 'No Role', password: 'CorrectHorseBattery42!' });

    expect(res.status).toBe(400);
    expect(res.body.type).toMatch(/validation/);
  });

  it('invalid role string returns 400', async () => {
    const email = `bad+${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, displayName: 'Bad Role', password: 'CorrectHorseBattery42!', role: 'ADMIN' });

    expect(res.status).toBe(400);
    expect(res.body.type).toMatch(/validation/);
  });

  it('role is also returned on /users/me after signup', async () => {
    const email = `me+${Date.now()}@example.com`;
    const agent = request.agent(app.getHttpServer());

    const signup = await agent
      .post('/auth/signup')
      .send({ email, displayName: 'Me Test', password: 'CorrectHorseBattery42!', role: 'MERCHANT' });
    expect(signup.status).toBe(201);

    const me = await agent.get('/users/me');
    expect(me.status).toBe(200);
    expect(me.body.role).toBe('MERCHANT');
  });
});
