import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DelayInterceptor } from './common/interceptors/delay.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1); //identificar ips de usuarios (para el rate-limit)

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((e) => {
          // caso: errores normales de class-validator (IsString, IsEnum, etc)
          const constraintMessages = e.constraints
            ? Object.values(e.constraints)
            : [];

          // caso: forbidNonWhitelisted (propiedad que no existe en DTO)
          const whitelistMessage =
            !e.constraints
              ? [`property ${e.property} should not exist`]
              : [];

          return [...constraintMessages, ...whitelistMessage];
        });

        return new BadRequestException({
          message: 'Validation error',
          details: messages,
        });
      },
    }),
  );

  //Delay artificial para simular el delay con la DB en production.
  app.useGlobalInterceptors(
    app.get(DelayInterceptor),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
