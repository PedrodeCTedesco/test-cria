import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';
import {
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<User> {
    try {
      const user: User = await this.usersService.findOneByUsername(
        createUserDto.username,
      );
  
      if (user) {
        throw new ConflictException({
          type: process.env.API_DOCUMENTATION,
          title: 'User Already Exists',
          status: 409,
          detail: `A user with the username ${createUserDto.username} already exists.`,
          instance: '/users',
        });
      }
  
      if (!user) {
        return await this.usersService.create(createUserDto);
      }
    } catch (error) {
      this.logger.error(
        'An unexpected error occurred during user creation:',
        error,
      );
      
      if (error instanceof BadRequestException) {
        throw new BadRequestException({
          type: process.env.API_DOCUMENTATION,
          title: 'Bad Request',
          status: 400,
          detail: 'Data format must be a valid JSON. Check the if the properties username or password are present in a valid format',
          instance: '/users',
        });
      } else if (error instanceof ConflictException) {
        throw error; // Re-lança a ConflictException sem modificá-la
      } else if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException({
          type: process.env.API_DOCUMENTATION,
          title: 'Unexpected Internal Server Error',
          status: 500,
          detail: 'An unexpected error occurred during user creation',
          instance: '/users',
        });
      } else {
        // Para qualquer outro tipo de erro
        throw new InternalServerErrorException({
          type: process.env.API_DOCUMENTATION,
          title: 'Internal Server Error',
          status: 500,
          detail: 'An unexpected error occurred during user creation',
          instance: '/users',
        });
      }
    }
  }
  

  @Get()
  async findAll(): Promise<User[]> {
    try {
      const users: User[] = await this.usersService.findAll();
      if (!users || !Array.isArray(users)) {
        throw new InternalServerErrorException({
          type: process.env.API_DOCUMENTATION,
          title: 'Data type must be an array',
          status: 500,
          detail: 'The type of response data is not an array of users',
          instance: '/users',
        });
      }

      return users;
    } catch (error: unknown) {
      this.logger.error('An unexpected error occurred:', error);
      if (error instanceof InternalServerErrorException) {
        throw error;
      } else {
        // Caso contrário, lançamos uma nova InternalServerErrorException com a mensagem correta
        console.error('Unexpected error occurred:', error);
        throw new InternalServerErrorException({
          type: 'uri',
          title: 'Unexpected Internal Server Error',
          status: 500,
          detail: 'An unexpected error occurred',
          instance: '/users',
        });
      }
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    try {
      const user: User = await this.usersService.findOne(id);
      if (!user) {
        throw new NotFoundException({
          type: process.env.API_DOCUMENTATION,
          title: 'user not found',
          status: 404,
          detail: `Check the id because there is no user under the id ${id}`,
          instance: '/users/:id',
        });
      }
      return user;
    } catch (error) {
      this.logger.error('An unexpected error occurred:', error);
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        // Caso contrário, lançamos uma nova InternalServerErrorException com a mensagem correta
        console.error('Unexpected error occurred:', error);
        throw new InternalServerErrorException({
          type: process.env.API_DOCUMENTATION,
          title: 'Unexpected Internal Server Error',
          status: 500,
          detail: 'An unexpected error occurred',
          instance: '/users/:id',
        });
      }
    }
  }

  @Get('username/:username')
  async findOneByUsername(@Param('username') username: string): Promise<User> {
    try {
      const user: User = await this.usersService.findOneByUsername(username);
      if (!user) {
        throw new NotFoundException({
          type: process.env.API_DOCUMENTATION,
          title: 'user not found',
          status: 404,
          detail: `Check the username because there is no user with the username ${username}`,
          instance: '/users/username/:username',
        });
      }
      return user;
    } catch (error) {
      this.logger.error('An unexpected error occurred:', error);
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.error('Unexpected error occurred:', error);
        throw new InternalServerErrorException({
          type: process.env.API_DOCUMENTATION,
          title: 'Unexpected Internal Server Error',
          status: 500,
          detail: 'An unexpected error occurred',
          instance: '/users/username/:username',
        });
      }
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const user: User = await this.usersService.update(id, updateUserDto);
      if (!user) {
        throw new NotFoundException({
          type: process.env.API_DOCUMENTATION,
          title: 'User not found',
          status: 404,
          detail: `Check the id because there is no user under the id ${id} to update`,
          instance: '/users/:id',
        });
      }
      return user;
    } catch (error) {
      this.logger.error(
        'An unexpected error occurred during user update',
        error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException({
          type: process.env.API_DOCUMENTATION,
          title: 'Unexpected Internal Server Error',
          status: 500,
          detail: 'An unexpected error occurred during user update',
          instance: '/users/:id',
        });
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException({
          type: process.env.API_DOCUMENTATION,
          title: 'Bad request',
          status: 400,
          detail: 'Data format must be a valid JSON',
          instance: '/users/:id',
        });
      }
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<boolean> {
    try {
      const result: boolean = await this.usersService.remove(id);
      if (!result) {
        throw new NotFoundException({
          type: process.env.API_DOCUMENTATION,
          title: 'User not found',
          status: 404,
          detail: `Check the id because there is no user under the id ${id} to delete`,
          instance: `/users/${id}`,
        });
      }
      return false;
    } catch (error) {
      this.logger.error(
        'An unexpected error occurred during user deletion:',
        error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        this.logger.error(
          'Unexpected error occurred during user deletion:',
          error,
        );
        throw new InternalServerErrorException({
          type: process.env.API_DOCUMENTATION,
          title: 'Unexpected Internal Server Error',
          status: 500,
          detail: 'An unexpected error occurred during user deletion',
          instance: `/users/${id}`,
        });
      }
    }
  }
}
