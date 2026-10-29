import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../../src/prisma/prisma.service.js';
import { TestsUtils } from '../utils/e2e-utils.js';
import { AuthFactory } from '../factories/auth-factory.js';
import { createTestApp } from './support/create-test-app.js';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authFactory: AuthFactory;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    authFactory = new AuthFactory(prisma);
  });

  beforeEach(async () => {
    await TestsUtils.cleanDB(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Signup Tests (e2e)', () => {
    it('POST /auth/signup => Should respond with status 400 when body is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'anderson@duarte.com',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /auth/signup => Should reply with status 200 for email or cpf already registered', async () => {
      const user = await authFactory.randomBuild(true);

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(user)
        .expect(HttpStatus.OK);
    });

    it('POST /auth/signup => Should respond with status 200 when the user is successfully registered', async () => {
      const user = await authFactory.randomBuild();

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(user)
        .expect(HttpStatus.OK);
    });
  });

  describe('Signin Tests (e2e)', () => {
    it('POST /auth/signin => Should respond with status 400 when body is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'anderson@duarte.com' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /auth/signin => Should respond with status 401 when user does not exist', async () => {
      const user = await authFactory.randomBuild();

      await request(app.getHttpServer())
        .post('/auth/signin')
        .send(user)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /auth/signin => Should respond with status 401 when email or password is invalid', async () => {
      const user = await authFactory.randomBuild(true);

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ ...user, password: 'S3nh4+S3Gu54' })
        .expect(HttpStatus.UNAUTHORIZED);
      expect(response.body.message).toEqual('Something is wrong.');
    });

    it('POST /auth/signin => Should respond with status 200 when login is performed', async () => {
      const user = await authFactory.randomBuild(true);

      const loginUser = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(user)
        .expect(HttpStatus.OK);
      expect(loginUser.body).toEqual({
        accessToken: expect.any(String),
      });
    });
  });
});
