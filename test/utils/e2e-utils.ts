import { PrismaService } from '../../src/prisma/prisma.service.js';

export class TestsUtils {
  static async cleanDB(prisma: PrismaService) {
    await prisma.reversal.deleteMany();
    await prisma.transfer.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  }
}
