import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import mongoose from 'mongoose';
import { User } from './schema/user.schema';
import { SimpleUser } from 'src/types/user/user.type';

describe('users service', () => {
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
            uri: configService.get<string>('MONGODB_URI_LOCAL'),
          }),
          inject: [ConfigService],
        }),
        UsersModule,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('findAll method', () => {
    it('type of return must be an Array', async () => {
      // Arrange
      const mockUsers: Partial<SimpleUser[]> = [{
        id: 'mock_id_1',
        username: 'test_user_1',
        password: 'password123'
      }, {
        id: 'mock_id_2',
        username: 'test_user_2',
        password: 'password456'
      }];
    
      jest.spyOn(service, 'findAll').mockResolvedValue(mockUsers as User[]);
    
      // Act
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
      const user: SimpleUser = {
        id: 'mock_id',
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
      const user: SimpleUser = {
        id: 'mock_id',
        username: 'username_2',
        password: 'username2@123',
      };
      const id: string = configService.get<string>('USER_ID');
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

  describe('findObeByUsername method', () => {
    it('should find a user by its username', async () => {
      // Arrange
      const existingUser: SimpleUser = {
        id: 'id_que_ja_existe',
        username: 'nome_que_ja_existe',
        password: 'nome@123',
      };
      const targetUsername: string = 'nome_que_ja_existe';
      jest
        .spyOn(service, 'findOneByUsername')
        .mockResolvedValue(existingUser as User);
      // Act
      const result = await service.findOneByUsername(targetUsername);
      // Assert
      expect(result).toEqual(existingUser);
      expect(service.findOneByUsername).toHaveBeenCalledWith(targetUsername);
    });
  });

  describe('update method', () => {
    it('should update the username', async () => {
      // Arrange
      const existingUser: SimpleUser = {
        id: 'mock_id',
        username: 'antigo_nome',
        password: 'antigo@123',
      };

      const updatedUser: SimpleUser = {
        ...existingUser,
        username: 'novo_nome',
      };

      const id: string = configService.get<string>('USER_ID');

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

  describe('create method', () => {
    it('should create a new user', async () => {
      // Arrange
      const payload: SimpleUser = {
        id: 'mock_id',
        username: 'novo usuário',
        password: 'novo@123',
      };

      const newUser: SimpleUser = {
        id: 'mock_id',
        username: 'novo usuário',
        password: 'novo@123',
      };
      jest.spyOn(service, 'create').mockResolvedValue(payload as User);
      // Act
      const result: User = await service.create(payload);
      // Assert
      expect(result).toEqual(newUser);
    });
  });

  describe('remove method', () => {
    it('should remove a user with a given id', async () => {
      // Arrange
      const id: string = configService.get<string>('USER_ID');
      jest.spyOn(service, 'remove').mockResolvedValue(true);
      // Act
      const result: boolean = await service.remove(id);
      // Assert
      expect(result).toBe(true);
    });
  });
});