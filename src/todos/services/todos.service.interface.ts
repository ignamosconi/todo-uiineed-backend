import { SuccessResponseDto } from '../dto/success-response.dto';
import { TodoResponseDto } from '../dto/todo-response.dto';
import { TodoStatus } from '../enums/todo-status.enum';

export interface ITodosService {
  create(url: string, name: string): Promise<TodoResponseDto>;

  findTrash(url: string): Promise<TodoResponseDto[]>;
  findActiveByStatus(url: string, status?: TodoStatus): Promise<TodoResponseDto[]>;

  changeStatus(url: string, id: number, status: TodoStatus): Promise<TodoResponseDto>;
  changeName(url: string, id:number, name: string): Promise<TodoResponseDto>;
  changeIsEliminated(url: string, id:number, isEliminated: boolean): Promise<TodoResponseDto>;
  
  completeAll(url: string): Promise<SuccessResponseDto>;
  clearCompleted(url: string): Promise<SuccessResponseDto>;
  
  clearTrash(url: string): Promise<SuccessResponseDto>;
  clearAll(url: string): Promise<SuccessResponseDto>;

  restoreTrash(url: string): Promise<SuccessResponseDto>;
}