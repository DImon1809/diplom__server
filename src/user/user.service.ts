import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { genSalt, hash, compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private readonly logger = new Logger();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  getHello() {
    return 'Hello world';
  }

  async register(dto: { email: string; password: string }) {
    const existingUser = await this.prismaService.user
      .findUnique({
        where: {
          email: dto.email,
        },
      })
      .catch((err) => {
        this.logger.error(err);

        return null;
      });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(dto.password, salt);

    const newUser = await this.prismaService.user
      .create({
        data: {
          email: dto.email,
          password: hashedPassword,
        },
      })
      .catch((err) => {
        this.logger.error(err);

        return null;
      });

    return newUser;
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prismaService.user
      .findFirst({
        where: { email: dto.email },
      })
      .catch((err) => {
        this.logger.error(err);

        return null;
      });

    if (!user || !compareSync(dto.password, user.password))
      throw new ForbiddenException('Неверный логин или пароль!');

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    return token;
  }

  current(token: string) {
    const payload = this.jwtService.verify(token, 'supersecretkey');

    return payload;
  }
}
