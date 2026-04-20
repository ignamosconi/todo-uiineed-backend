import { Todo } from '../entities/todo.entity';

export interface ITodosService {
  create(url: string, name: string): Promise<Todo>;
  findByStatus(url: string, status: string): Promise<Todo[]>;
  changeStatus(id: number, status: string): Promise<{ success: boolean }>;
  completeAll(url: string): Promise<{ success: boolean }>;
  clearAll(url: string): Promise<{ success: boolean }>;
}

