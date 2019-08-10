import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder().build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, options));
  await app.listen(3000);
}
bootstrap();
