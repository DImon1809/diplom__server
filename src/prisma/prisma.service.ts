import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { parse } from 'pg-connection-string';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const url = process.env.DATABASE_URL!;
    const config = parse(url); // распарсить URL
    if (!config.password) throw new Error('Пароль не найден в DATABASE_URL');

    const adapter = new PrismaPg({
      host: config.host!,
      port: Number(config.port),
      user: config.user!,
      password: config.password,
      database: config.database!,
    });

    super({ adapter });
  }
}
