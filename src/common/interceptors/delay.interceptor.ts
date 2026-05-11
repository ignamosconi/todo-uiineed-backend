// src/common/interceptors/delay.interceptor.ts

/*
    Archivo usado para añadir los segundos de retraso configurados en .env en todas las acciones del backend.
    Esto nos permite testar el optimistic ui del frontend con el delay que verdaderamente ocurre en producción

    Configuración .env para tener delay (desarrollo local):
    NODE_ENV=development
    GLOBAL_DELAY_MS=3000

    Configuración .env para deshabilitar el delay (producción)
    NODE_ENV=production
    GLOBAL_DELAY_MS=0
*/

// src/common/interceptors/delay.interceptor.ts

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
export class DelayInterceptor implements NestInterceptor {

  constructor(
    private readonly configService: ConfigService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {

    const isDev =
      this.configService.get('NODE_ENV') === 'development';

    if (!isDev) {
      return next.handle();
    }

    const ms =
      Number(this.configService.get('GLOBAL_DELAY_MS')) || 0;

    console.log('[DELAYER]: Adding a '+ms+' ms delay to backend response')
    return next.handle().pipe(
      delay(ms),
    );
  }
}