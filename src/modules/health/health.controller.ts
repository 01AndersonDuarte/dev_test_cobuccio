import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Check application health',
    description:
      'Checks whether the application is running and the database connection is available.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is completed healthy.',
    schema: {
      example: {
        status: 'ok',
        database: 'connected',
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Fail on database connection',
    schema: {
      example: {
        statusCode: 503,
        message: 'Database connection failed',
        error: 'Service Unavailable',
      },
    },
  })
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return { status: 'ok', database: 'connected' };
    } catch (error) {
      throw new ServiceUnavailableException('Database connection failed');
    }
  }
}
