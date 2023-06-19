import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const port = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: 'https://client-eight-zeta.vercel.app/',
  });
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  const options = new DocumentBuilder()
    .setTitle('Messenger')
    .setDescription('Api messenger')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port, '0.0.0.0');
}

bootstrap();
