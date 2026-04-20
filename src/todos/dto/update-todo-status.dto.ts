import { IsEnum } from 'class-validator';
import { TodoStatus } from '../enums/todo-status.enum';

export class UpdateTodoStatusDto {
  @IsEnum(TodoStatus)
  status!: TodoStatus;
}