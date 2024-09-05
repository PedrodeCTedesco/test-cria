import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  // construtor
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          `Erro ao buscar os billings: ${error.message}`,
        );
      }
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const response: User = await this.userModel.findById(id).exec();
      if (!response)
        throw new BadRequestException(`Billing com o ID ${id} não encontrado`);

      return response;
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new InternalServerErrorException(
          `Erro ao buscar usuário com ID ${id}: ${error.message}`,
        );
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
        throw new BadRequestException(`Billing com o ID ${id} não encontrado`);

      return response;
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new InternalServerErrorException(
          `Erro ao atualizar usuário com ID ${id}: ${error.message}`,
        );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
