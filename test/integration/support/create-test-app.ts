import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AuthModule } from '../../../src/modules/auth/auth.module.js';
import { PrismaModule } from '../../../src/prisma/prisma.module.js';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [PrismaModule, AuthModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  return app;
}
