import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { UsersModule } from '../users/users.module';
import { AccessToken } from 'src/types/auth/access.token';
import { SimpleUser } from 'src/types/user/user.type';

describe('AuthService', () => {
  let app: INestApplication;
  let controller: AuthController;
  let service: AuthService;

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
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe("login method", () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  
    it('should throw 400 if username already exists', async () => {
      // Arrange
      jest.spyOn(service, 'login').mockRejectedValue(new Error('The username existingUser already exists'));
  
      // Act
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'existingUser', password: 'password' });
  
      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body.detail).toEqual('The username existingUser already exists');
    });
  });
});
