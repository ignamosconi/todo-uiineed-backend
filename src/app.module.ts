import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsModule } from './lists/lists.module';
import { TodosModule } from './todos/todos.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { DelayInterceptor } from './common/interceptors/delay.interceptor';

@Module({
  imports: [
    //Automatizaciones (servicio de limpieza de lists)
    ScheduleModule.forRoot(), 

    //.env
    ConfigModule.forRoot({ 
      isGlobal: true,
    }),

    //rate-limiter
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minuto
          limit: 100, // global fallback
        },
      ],
    }),

    //Capa de persistencia
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    //Módulos del sistema
    ListsModule,
    TodosModule,
  ],

  providers: [
    DelayInterceptor,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    }
  ]
})
export class AppModule {}