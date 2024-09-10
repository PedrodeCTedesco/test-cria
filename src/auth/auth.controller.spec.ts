import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { AuthController } from './auth.controller';

describe('AuthService', () => {
  let controller: AuthController;

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
        AuthModule
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
