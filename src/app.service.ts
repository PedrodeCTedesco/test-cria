import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { User } from './users/schema/user.schema';

@Injectable()
export class AppService {
  constructor(private usersService: UsersService) {}
  async getHello(username: string): Promise<string> {
    const user: User = await this.usersService.findOneByUsername(username);
    return `Hello ${user.username}!`;
  }
}
