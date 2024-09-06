import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  // construtor
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const response: User = await this.userModel.create(createUserDto);
      await response.save();
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          `Erro ao criar novo usuário: ${error.message}`,
        );
      }
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          `Erro na recuperação dos usuários: ${error.message}`,
        );
      }
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const response: User = await this.userModel.findById(id).exec();
      if (!response)
        throw new BadRequestException(`Usuário com o ID ${id} não encontrado`);

      return response;
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new InternalServerErrorException(
          `Erro ao buscar usuário com ID ${id}: ${error.message}`,
        );
    }
  }

  async findOneByUsername(username: string): Promise<User | null> {
    try {
      const user: User = await this.userModel.findOne({ username }).exec();
      return user;
    } catch (error) {
      this.logger.error('Error finding user by username:', error);
      throw new InternalServerErrorException({
        type: process.env.API_DOCUMENTATION,
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred while searching for the user',
        instance: '/users',
      });
    }
  }

  async update(
    id: number,
    updateUserDto: Partial<UpdateUserDto>,
  ): Promise<User> {
    try {
      const response: User = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, {
          new: true,
        })
        .exec();

      if (!response)
        throw new BadRequestException(`Usuário com o ID ${id} não encontrado`);

      return response;
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new InternalServerErrorException(
          `Erro ao atualizar usuário com ID ${id}: ${error.message}`,
        );
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const response: User = await this.userModel.findByIdAndDelete(id).exec();
      if (!response)
        throw new BadRequestException(`Usuário com o ID ${id} não encontrado`);

      return true;
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new InternalServerErrorException(
          `Erro ao atualizar usuário com ID ${id}: ${error.message}`,
        );
    }
  }
}
