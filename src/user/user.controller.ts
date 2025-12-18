import {
  Body,
  Controller,
  Get,
  Post,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/test')
  getHello() {
    return this.userService.getHello();
  }

  @Post('register')
  async registerUser(@Body() dto: { email: string; password }) {
    return this.userService.register(dto);
  }

  @Post('login')
  async loginUser(@Body() dto: { email: string; password: string }) {
    const token = await this.userService.login(dto);

    return { jwtToken: token };
  }

  @Get('current')
  currentUser(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new HttpException(
        'Authorization header missing',
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.log('authHeader', authHeader);

    return 'Hello';
  }
}
