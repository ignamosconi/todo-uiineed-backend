import { TodoStatus } from '../enums/todo-status.enum';

export class TodoResponseDto {
  id!: number;
  name!: string;
  status!: TodoStatus;
}