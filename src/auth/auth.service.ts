import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AccessToken } from '../types/auth/access.token';
import { UsersService } from '../users/users.service';
import { RegisterRequestDto } from '../types/auth/register.request.dto';
import { User } from 'src/users/schema/user.schema';
import { SimpleUser } from 'src/types/user/user.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user: User = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new BadRequestException({
        type: process.env.API_DOCUMENTATION,
        title: 'Problems in request',
        status: 400,
        detail: `The username ${username} already exists`,
        instance: '',
      });
    }

    const isMatch: boolean = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      throw new BadRequestException({
        type: process.env.API_DOCUMENTATION,
        title: 'Password invalid',
        status: 400,
        detail: `The password is not valid`,
        instance: '',
      });
    }

    const userObject = user.toObject();
    const { password: _, ...result } = userObject;
    return result;
  }

  async login(user: User): Promise<AccessToken> {
    const payload = { username: user.username, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: RegisterRequestDto): Promise<AccessToken> {
    const existingUser = await this.usersService.findOneByUsername(
      user.username,
    );
    if (existingUser) {
      throw new BadRequestException('username already exists');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: SimpleUser = { ...user, password: hashedPassword };
    await this.usersService.create(newUser);
    return this.login(newUser as User);
  }
}