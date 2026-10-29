import { execSync } from 'node:child_process';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

let container: StartedPostgreSqlContainer;

export async function setup() {
  container = await new PostgreSqlContainer('postgres:17-alpine').start();

  const url = container.getConnectionUri();
  process.env.DATABASE_URL = url;
  process.env.JWT_SECRET = 'e2e-secret';

  execSync('npx prisma migrate deploy --config prisma7.config.ts', {
    env: process.env,
    stdio: 'inherit',
  });
}

export async function teardown() {
  await container.stop();
}
