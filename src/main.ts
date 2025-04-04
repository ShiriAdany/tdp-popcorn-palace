import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true, 
    disableErrorMessages: false, 
  }));

  await app.listen(3000);
}
bootstrap();