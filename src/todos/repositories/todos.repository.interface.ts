import { Todo } from '../entities/todo.entity';
import { List } from '../../lists/entities/list.entity';
import { TodoStatus } from '../enums/todo-status.enum';

export interface ITodosRepository {
  save(name: string, list: List): Promise<Todo>;
  findStatusByUrl(url: string, status: TodoStatus): Promise<Todo[]>;
  updateStatus(id: number, status: TodoStatus): Promise<void>;
  findById(id: number): Promise<Todo | null>;
  findByIdAndListUrl(id: number, url: string): Promise<Todo | null>;
  updateManyStatus(url: string, oldStatus: TodoStatus | null, newStatus: TodoStatus): Promise<void>;
}