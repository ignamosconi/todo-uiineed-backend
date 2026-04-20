import { Todo } from '../entities/todo.entity';
import { List } from '../../lists/entities/list.entity';

export interface ITodosRepository {
  save(name: string, list: List): Promise<Todo>;
  findStatusByUrl(url: string, status: string): Promise<Todo[]>;
  updateStatus(id: number, status: string): Promise<void>;
  updateManyStatus(url: string, oldStatus: string | null, newStatus: string): Promise<void>;
}