import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { BadRequestException, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { UsersModule } from '../users/users.module';
import { AccessToken } from '../types/auth/access.token';
import { SimpleUser } from '../types/user/user.type';
import { RegisterRequestDto } from '../types/auth/register.request.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/schema/user.schema';

describe('AuthService', () => {
  let app: INestApplication;
  let controller: AuthController;
  let service: AuthService;
  let serviceUser: UsersService;

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
        AppModule,
        AuthModule,
        UsersModule,
        JwtModule.register({
          secret: 'testSecret', 
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [
        AuthService,
      ]
    }).compile();

    app = module.createNestApplication();
    await app.init();
    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    serviceUser = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe("login method", () => {
    it("should realize login", async () => {
      // Arrange
      const user: SimpleUser = {
        username: "pedro",
        password: "pedro@123"
      }
      const accessToken: AccessToken = {
        access_token: "access"
      }
      jest.spyOn(service, 'login').mockResolvedValue(accessToken);
      // Act
      const result = await request(app.getHttpServer()).post('/auth/login').send(user);
      // Assert
      expect(result.body).toHaveProperty('access_token');
    });

    it("should not realize login with invalid JSON (no password)", async () => {
      // Arrange
      const user: Partial<SimpleUser> = {
        username: "pedro",
      }
      const accessToken: AccessToken = {
        access_token: "access"
      }
      jest.spyOn(service, 'login').mockResolvedValue(accessToken);
      // Act
      const result = await request(app.getHttpServer()).post('/auth/login').send(user);
      // Assert
      expect(result.body.message).toEqual("Unauthorized");
    });

    it("should not realize login with invalid JSON (no username)", async () => {
      // Arrange
      const user: Partial<SimpleUser> = {
        password: "pedro@123",
      }
      const accessToken: AccessToken = {
        access_token: "access"
      }
      jest.spyOn(service, 'login').mockResolvedValue(accessToken);
      // Act
      const result = await request(app.getHttpServer()).post('/auth/login').send(user);
      // Assert
      expect(result.body.message).toEqual("Unauthorized");
    });
  });

  describe("register method", () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const userDto: RegisterRequestDto = { username: 'newUser', password: 'password123' };
      const hashedPassword = await bcrypt.hash(userDto.password, 10);
      const newUser: SimpleUser = { username: 'newUser', password: hashedPassword };
      const accessToken: AccessToken = { access_token: 'valid-jwt-token' };
  
      jest.spyOn(serviceUser, 'findOneByUsername').mockResolvedValue(null); // No user exists
      jest.spyOn(serviceUser, 'create').mockResolvedValue(newUser as User); // Mock user creation
      jest.spyOn(service, 'login').mockResolvedValue(accessToken); // Mock login returning JWT
  
      // Act
      const result = await service.register(userDto);
  
      // Assert
      expect(serviceUser.findOneByUsername).toHaveBeenCalledWith('newUser');
      expect(serviceUser.create).toHaveBeenCalledWith(expect.objectContaining({
        username: 'newUser',
        // We use expect.any(String) for password because it will be hashed and vary
        password: expect.any(String),
      }));
      expect(service.login).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual(accessToken);
    });

    it('should throw BadRequestException if username already exists', async () => {
      // Arrange
      const userDto: RegisterRequestDto = { username: 'existingUser', password: 'password123' };
      const existingUser: SimpleUser = { username: 'existingUser', password: 'hashedPassword' };
  
      jest.spyOn(serviceUser, 'findOneByUsername').mockResolvedValue(existingUser as User);
      jest.spyOn(serviceUser, 'create').mockRejectedValue(null);
  
      // Act & Assert
      await expect(service.register(userDto)).rejects.toThrow(BadRequestException);
      expect(serviceUser.findOneByUsername).toHaveBeenCalledWith('existingUser');
      expect(serviceUser.create).not.toHaveBeenCalled();
    });
  });

  describe("validateUser method", () => {
    it('should throw BadRequestException if user is not found', async () => {
      // Arrange
      const username = 'nonExistentUser';
      const password = 'password123';
  
      jest.spyOn(serviceUser, 'findOneByUsername').mockResolvedValue(null); // User not found
  
      // Act & Assert
      await expect(service.validateUser(username, password)).rejects.toThrow(
        new BadRequestException({
          type: process.env.API_DOCUMENTATION,
          title: 'Problems in request',
          status: 400,
          detail: `The username ${username} already exists`,
          instance: '',
        }),
      );
      expect(serviceUser.findOneByUsername).toHaveBeenCalledWith(username);
    });

    it('should return user without password if credentials are valid', async () => {
      // Arrange
      const username = 'existingUser';
      const password = 'correctPassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user: User = { username, password: hashedPassword } as User;
      const userWithoutPassword = { username } as Omit<User, 'password'>;
    
      (user as any).toObject = () => ({ username });
  
      jest.spyOn(serviceUser, 'findOneByUsername').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true); // Password matches
  
      // Act
      const result = await service.validateUser(username, password);
  
      // Assert
      expect(serviceUser.findOneByUsername).toHaveBeenCalledWith(username);
      expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual(userWithoutPassword);
    });
  });
});
