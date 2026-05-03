import { PipeTransform, BadRequestException } from '@nestjs/common';
import { TodoStatus } from '../enums/todo-status.enum';

export class TodoStatusPipe implements PipeTransform {
  transform(value: any) {
    if (!value) return undefined;

    if (!Object.values(TodoStatus).includes(value)) {
      throw new BadRequestException(
        `Status inválido. Valores permitidos: ${Object.values(TodoStatus).join(', ')}`,
      );
    }

    return value;
  }
}