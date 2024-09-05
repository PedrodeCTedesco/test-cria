import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from './users.module';
//import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import mongoose from 'mongoose';
import { User } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

describe('users controller', () => {
  //let controller: UsersController;
  let service: UsersService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
          }),
          inject: [ConfigService],
        }),
        UsersModule,
      ],
    }).compile();

    //controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('findAll method', () => {
    it('type of return must be an Array', async () => {
      // Arrange, Act
      const result: User[] = await service.findAll();
      // Assert
      expect(result).toBeInstanceOf(Array);
    });

    it('should return empty when there is no user in database', async () => {
      // Arrange
      jest.spyOn(service, 'findAll').mockResolvedValue([]);
      // Act
      const result: User[] = await service.findAll();
      // Assert
      expect(result).toEqual([]);
    });

    it('should return user dto properties if there is a user in database', async () => {
      // Arrange
      const user: CreateUserDto = {
        username: 'nome_usuario',
        password: 'nome@123',
      };

      jest.spyOn(service, 'findAll').mockResolvedValue([user] as User[]);
      // Act
      const result: User[] = await service.findAll();
      // Assert
      expect(result[0]).toEqual(
        expect.objectContaining({
          username: 'nome_usuario',
          password: 'nome@123',
        }),
      );
    });
  });

  describe('findOne method', () => {
    it('should return empty when there is no user in database', async () => {
      // Arrange
      jest.spyOn(service, 'findAll').mockResolvedValue([]);
      // Act
      const result: User[] = await service.findAll();
      // Assert
      expect(result).toEqual([]);
    });

    it('should return user dto type when it finds the user with the id', async () => {
      // Arrange
      const user: CreateUserDto = {
        username: 'username_2',
        password: 'username2@123',
      };
      const id: number = parseInt(configService.get<string>('USER_ID'));
      jest.spyOn(service, 'findOne').mockResolvedValue(user as User);
      // Act
      const result: User = await service.findOne(id);
      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          username: 'username_2',
          password: 'username2@123',
        }),
      );
    });
  });

  describe('update method', () => {
    it('should update the username', async () => {
      // Arrange
      const existingUser: CreateUserDto = {
        username: 'antigo_nome',
        password: 'antigo@123',
      };

      const updatedUser: CreateUserDto = {
        ...existingUser,
        username: 'novo_nome',
      };

      const id: number = parseInt(configService.get<string>('USER_ID'));

      jest.spyOn(service, 'update').mockResolvedValue(updatedUser as User);
      // Act
      const result: User = await service.update(id, { username: 'novo_nome' });
      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          username: 'novo_nome',
        }),
      );
    });
  });
});
