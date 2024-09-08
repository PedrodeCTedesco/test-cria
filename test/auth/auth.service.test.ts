import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
const secret = configService.get<string>('JWT_SECRET');

export const generateTestToken = (username: string): string => {
    return jwt.sign({ sub: username }, secret, { expiresIn: '1h' });
  };