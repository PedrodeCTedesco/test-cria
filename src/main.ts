import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as YAML from 'yamljs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Authorization'],
    credentials: true,
   });
   
  // Configuração do Swagger
  const swaggerDocument = YAML.load('swagger.yaml');
  SwaggerModule.setup('api', app, swaggerDocument)

  await app.listen(process.env.PORT);
}
bootstrap();
