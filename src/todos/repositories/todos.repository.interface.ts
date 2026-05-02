import { Todo } from '../entities/todo.entity';
import { List } from '../../lists/entities/list.entity';
import { TodoStatus } from '../enums/todo-status.enum';
import { ReorderItemDto } from '../dto/reorder-item.dto';

//El repo devuelve la entity completa y no un DTO, porque de hacerlo estaríamos acoplándolo a la API.
export interface ITodosRepository {
  save(name: string, list: List): Promise<Todo>;

  findByIdAndList(id: number, listId: number): Promise<Todo | null>;
  findAllByList(listId: number, filters?: {
    status?: TodoStatus;
    isEliminated?: boolean;
  }): Promise<Todo[]>;
  countByList(listId: number): Promise<number>;

  updateOne(id: number, listId: number, patch: Partial<Todo>): Promise<void>;
  updateMany(listId: number, patch: Partial<Todo>, filters?: {
    status?: TodoStatus;
    isEliminated?: boolean;
  }): Promise<void>;
  
  existsByPosition(listId: number, position: number): Promise<boolean>;

  deleteMany(listId: number): Promise<void>;
}