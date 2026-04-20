import { SuccessResponseDto } from '../dto/success-response.dto';
import { TodoResponseDto } from '../dto/todo-response.dto';
import { TodoStatus } from '../enums/todo-status.enum';

export interface ITodosService {
  create(url: string, name: string): Promise<TodoResponseDto>;
  findByStatus(url: string, status: TodoStatus): Promise<TodoResponseDto[]>;
  changeStatus(url: string, id: number, status: TodoStatus): Promise<SuccessResponseDto>;
  completeAll(url: string): Promise<SuccessResponseDto>;
  clearAll(url: string): Promise<SuccessResponseDto>;
}