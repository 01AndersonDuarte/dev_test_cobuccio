import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../../src/prisma/prisma.service.js';
import { TestsUtils } from '../utils/e2e-utils.js';
import { AuthFactory } from '../factories/auth-factory.js';
import { createTestApp } from './support/create-test-app.js';
import { WalletFactory } from '../factories/wallet-factory.js';

describe('Wallet (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authFactory: AuthFactory;
  let walletFactory: WalletFactory;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    authFactory = new AuthFactory(prisma);
    walletFactory = new WalletFactory();
  });

  beforeEach(async () => {
    await TestsUtils.cleanDB(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  async function createAuthenticatedUser() {
    const userCredentials = await authFactory.randomBuild();

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(userCredentials)
      .expect(HttpStatus.OK);

    const userData = await prisma.user.findUniqueOrThrow({
      where: { email: userCredentials.email },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(userCredentials)
      .expect(HttpStatus.OK);

    return {
      userData,
      accessToken: response.body.accessToken as string,
    };
  }

  describe('GET Wallet Tests (e2e)', () => {
    it('GET /wallet/me => Should respond with status 401 when token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/wallet/me')
        .set('Authorization', 'Bearer invalid-jwttoken')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('GET /wallet/me => Should respond with status 404 when the user has no wallet', async () => {
      const { userData, accessToken } = await createAuthenticatedUser();

      await prisma.wallet.delete({
        where: { userId: userData.id },
      });

      await request(app.getHttpServer())
        .get('/wallet/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('GET /wallet/me => Should respond with status 200 when the user has a wallet', async () => {
      const { accessToken } = await createAuthenticatedUser();

      await request(app.getHttpServer())
        .get('/wallet/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('POST deposit wallet (e2e)', () => {
    it('POST /wallet/deposit => Should respond with status 401 when token is invalid', async () => {
      const depositBody = await walletFactory.randomBuild();

      await request(app.getHttpServer())
        .post('/wallet/deposit')
        .set('Authorization', 'Bearer invalid-token')
        .send(depositBody)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /wallet/deposit => Should respond with status 400 when body is invalid', async () => {
      const { accessToken } = await createAuthenticatedUser();

      await request(app.getHttpServer())
        .post('/wallet/deposit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ amount: -100 })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /wallet/deposit => Should respond with status 404 when the user has no wallet', async () => {
      const { userData, accessToken } = await createAuthenticatedUser();
      const deposit = await walletFactory.randomBuild();

      await prisma.wallet.delete({
        where: { userId: userData.id },
      });

      await request(app.getHttpServer())
        .post('/wallet/deposit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(deposit)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('POST /wallet/deposit => Should respond with status 200 when the user has a wallet', async () => {
      const { accessToken } = await createAuthenticatedUser();
      const deposit = await walletFactory.randomBuild();

      const response = await request(app.getHttpServer())
        .post('/wallet/deposit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(deposit)
        .expect(HttpStatus.OK);

      expect(response.body.balance).toEqual(deposit.amount);
    });
  });
});
