import { Todo } from '../entities/todo.entity';
import { List } from '../../lists/entities/list.entity';
import { TodoStatus } from '../enums/todo-status.enum';

//El repo devuelve la entity completa y no un DTO, porque de hacerlo estaríamos acoplándolo a la API.
export interface ITodosRepository {
  save(name: string, list: List): Promise<Todo>;

  findById(id: number): Promise<Todo | null>;

  findAllByList(listId: number, filters?: {
    status?: TodoStatus;
    isEliminated?: boolean;
  }): Promise<Todo[]>;

  updateStatus(id: number, status: TodoStatus): Promise<void>;

  updateMany(listId: number, patch: Partial<Todo>, filters?: {
    status?: TodoStatus;
    isEliminated?: boolean;
  }): Promise<void>;

  deleteMany(listId: number, filters: {
    isEliminated: true;
  }): Promise<void>;
}