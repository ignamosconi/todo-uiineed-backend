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
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        migrations: ['dist/migrations/*.js'],
        migrationsRun: true,
        
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