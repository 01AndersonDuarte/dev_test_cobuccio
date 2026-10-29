import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../../src/app.module.js';
import { PrismaModule } from '../../src/prisma/prisma.module.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { TestsUtils } from '../utils/e2e-utils.js';
import { AuthFactory } from '../factories/auth-factory.js';

let app: INestApplication;
let prisma: PrismaService;

beforeEach(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule, PrismaModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  prisma = app.get(PrismaService);

  await TestsUtils.cleanDB(prisma);

  await app.init();
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
    const user = await new AuthFactory(prisma).randomBuild(true);

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(user)
      .expect(HttpStatus.OK);
  });

  it('POST /auth/signup => Should respond with status 200 when the user is successfully registered', async () => {
    const user = await new AuthFactory(prisma).randomBuild();

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(user)
      .expect(HttpStatus.OK);
  });
});
describe('Signin Tests (e2e)', () => {
  // beforeAll(()=>{
  //     const auth: AuthUsers;
  //     auth.
  // });

  it('POST /auth/signin => Should respond with status 400 when body is invalid', async () => {
    await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'anderson@duarte.com' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('POST /auth/signin => Should respond with status 401 when user does not exist', async () => {
    const user = await new AuthFactory(prisma).randomBuild();
    await request(app.getHttpServer())
      .post('/auth/signin')
      .send(user)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('POST /auth/signin => Should respond with status 401 when email or password is invalid', async () => {
    const user = await new AuthFactory(prisma).randomBuild(true);
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ ...user, password: 'S3nh4+S3Gu54' })
      .expect(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toEqual('Something is wrong.');
  });

  it('POST /auth/signin => Should respond with status 200 when login is performed', async () => {
    const user = await new AuthFactory(prisma).randomBuild(true);

    const loginUser = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(user)
      .expect(HttpStatus.OK);
    expect(loginUser.body).toEqual({
      accessToken: expect.any(String),
    });
  });
});
