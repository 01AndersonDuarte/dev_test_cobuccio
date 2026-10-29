import { HttpStatus, INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

import { PrismaService } from '../../src/prisma/prisma.service.js';
import { AuthFactory } from '../factories/auth-factory.js';
import { TransfersFactory } from '../factories/transfers-factory.js';
import { TestsUtils } from '../utils/e2e-utils.js';
import { createTestApp } from './support/create-test-app.js';

describe('Transfer (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authFactory: AuthFactory;
  let transfersFactory: TransfersFactory;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    authFactory = new AuthFactory(prisma);
    transfersFactory = new TransfersFactory();
  });

  beforeEach(async () => {
    await TestsUtils.cleanDB(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  async function createUser() {
    const credentials = await authFactory.randomBuild();

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(credentials)
      .expect(HttpStatus.OK);

    const userData = await prisma.user.findUniqueOrThrow({
      where: { email: credentials.email },
    });

    return { credentials, userData };
  }

  async function createAuthenticatedUser(balance = 1_000_000) {
    const { credentials, userData } = await createUser();

    await prisma.wallet.update({
      where: { userId: userData.id },
      data: { balance },
    });
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(credentials)
      .expect(HttpStatus.OK);

    return {
      userData,
      accessToken: response.body.accessToken as string,
    };
  }

  async function createTransfer(senderToken: string, receiverId: string) {
    const transfer = await transfersFactory.randomBuild(receiverId);

    const response = await request(app.getHttpServer())
      .post('/transfers')
      .set('Authorization', `Bearer ${senderToken}`)
      .send(transfer)
      .expect(HttpStatus.CREATED);

    return {
      transfer,
      transferId: response.body.id as string,
    };
  }

  describe('POST transfers (e2e)', () => {
    it('POST /transfers => Should respond with status 401 when token is invalid', async () => {
      const receiver = await createUser();
      const transfer = await transfersFactory.randomBuild(receiver.userData.id);

      await request(app.getHttpServer())
        .post('/transfers')
        .set('Authorization', 'Bearer invalid-token')
        .send(transfer)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /transfers => Should respond with status 400 when body is invalid', async () => {
      const { accessToken } = await createAuthenticatedUser();

      const receiver = await createUser();
      const transfer = await transfersFactory.randomBuild(receiver.userData.id);

      await request(app.getHttpServer())
        .post('/transfers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...transfer, amount: -1 })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /transfers => Should respond with status 400 when receiver is the sender', async () => {
      const { userData, accessToken } = await createAuthenticatedUser();
      const transfer = await transfersFactory.randomBuild(userData.id);

      await request(app.getHttpServer())
        .post('/transfers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transfer)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /transfers => Should respond with status 404 when receiver does not exist', async () => {
      const { accessToken } = await createAuthenticatedUser();
      const transfer = await transfersFactory.randomBuild(randomUUID());

      await request(app.getHttpServer())
        .post('/transfers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transfer)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('POST /transfers => Should respond with status 409 when idempotency key was used for a different transaction', async () => {
      const { accessToken } = await createAuthenticatedUser();

      const firstReceiver = await createUser();
      const secondReceiver = await createUser();
      const transfer = await transfersFactory.randomBuild(
        firstReceiver.userData.id,
      );

      await request(app.getHttpServer())
        .post('/transfers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transfer)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/transfers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...transfer,
          receiverId: secondReceiver.userData.id,
        })
        .expect(HttpStatus.CONFLICT);
    });

    it('POST /transfers => Should respond with status 201 when idempotency key was used for the same transaction', async () => {
      const { accessToken } = await createAuthenticatedUser();

      const receiver = await createUser();
      const transfer = await transfersFactory.randomBuild(receiver.userData.id);

      await request(app.getHttpServer())
        .post('/transfers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transfer)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/transfers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transfer)
        .expect(HttpStatus.CREATED);
    });

    it('POST /transfers => Should respond with status 201 when idempotency key has not been used', async () => {
      const { accessToken } = await createAuthenticatedUser();
      const receiver = await createUser();
      const transfer = await transfersFactory.randomBuild(receiver.userData.id);

      await request(app.getHttpServer())
        .post('/transfers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transfer)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('POST reversals (e2e)', () => {
    it('POST transfers/:id/reversal => Should respond with status 401 when token is invalid', async () => {
      await request(app.getHttpServer())
        .post(`/transfers/${randomUUID()}/reversal`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST transfers/:id/reversal => Should respond with status 404 when transfer does not exists', async () => {
      const { accessToken } = await createAuthenticatedUser();

      await request(app.getHttpServer())
        .post(`/transfers/${randomUUID()}/reversal`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('POST /transfers/:id/reversal => Should respond with status 401 when the authenticated user is not the receiver', async () => {
      const sender = await createAuthenticatedUser();
      const receiver = await createUser();
      const { transferId } = await createTransfer(
        sender.accessToken,
        receiver.userData.id,
      );

      await request(app.getHttpServer())
        .post(`/transfers/${transferId}/reversal`)
        .set('Authorization', `Bearer ${sender.accessToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /transfers/:id/reversal => Should respond with status 409 when transfer was already reversed', async () => {
      const sender = await createAuthenticatedUser();
      const receiver = await createAuthenticatedUser();
      const { transferId } = await createTransfer(
        sender.accessToken,
        receiver.userData.id,
      );

      await request(app.getHttpServer())
        .post(`/transfers/${transferId}/reversal`)
        .set('Authorization', `Bearer ${receiver.accessToken}`)
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .post(`/transfers/${transferId}/reversal`)
        .set('Authorization', `Bearer ${receiver.accessToken}`)
        .expect(HttpStatus.CONFLICT);
    });

    it('POST /transfers/:id/reversal => Should respond with status 200 when transfer is successfully reversed', async () => {
      const sender = await createAuthenticatedUser();
      const receiver = await createAuthenticatedUser();
      const { transferId } = await createTransfer(
        sender.accessToken,
        receiver.userData.id,
      );

      await request(app.getHttpServer())
        .post(`/transfers/${transferId}/reversal`)
        .set('Authorization', `Bearer ${receiver.accessToken}`)
        .expect(HttpStatus.OK);
    });
  });
});
