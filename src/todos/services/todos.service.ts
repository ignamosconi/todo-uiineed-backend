import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITodosService } from './todos.service.interface';
import type { ITodosRepository } from '../repositories/todos.repository.interface';
import { TodoResponseDto } from '../dto/todo-response.dto';
import { SuccessResponseDto } from '../dto/success-response.dto';
import { TodoStatus } from '../enums/todo-status.enum';
import { EnsureListHelper } from '../helpers/ensure-list.helper';
import { Todo } from '../entities/todo.entity';

@Injectable()
export class TodosService implements ITodosService {
  constructor(
    @Inject('ITodosRepository') private readonly todoRepo: ITodosRepository,
    private readonly ensureList: EnsureListHelper,
  ) {}

  /*
    FUNCIONES PRIVADAS
  */
  private async getTodoOrFail(id: number, listId: number): Promise<Todo> {
    const todo = await this.todoRepo.findByIdAndList(id, listId);
    if (!todo) throw new NotFoundException('Todo no encontrado');
    return todo;
  }

  private toDto(todo: Todo): TodoResponseDto {
    return {
      id: todo.id,
      name: todo.name,
      status: todo.status,
      isEliminated: todo.isEliminated,
    };
  }

  private async updateAndMerge(id: number, listId: number, patch: Partial<Todo>): Promise<Todo> {
    const todo = await this.getTodoOrFail(id, listId);

    await this.todoRepo.updateOne(id, listId, patch);

    //Podría darse el caso que al usuario le llega info desactualizada (porque en la db otra query actualizó el todo después que nosotros),
    //pero prefiero ahorrar la query de pedir el todo_updated. Si fuera una app de un banco ahí sí hacés la query extra jaja.
    return { ...todo, ...patch }; 
  }

  /*
    FUNCIONES PÚBLICAS
  */
  async create(url: string, name: string): Promise<TodoResponseDto> {
    const list = await this.ensureList.execute(url);
    return this.toDto(await this.todoRepo.save(name, list));
  }

  //Encontramos los todos que no están en la trash todavía
  async findActiveByStatus(url: string, status?: TodoStatus): Promise<TodoResponseDto[]> {
    const list = await this.ensureList.execute(url);

    const filters: {
      status?: TodoStatus;
      isEliminated?: boolean;
    } = { isEliminated: false };

    if (status !== undefined) {
      filters.status = status;
    }

    const todos = await this.todoRepo.findAllByList(list.id, filters);

    return todos.map(todo => this.toDto(todo));
  }

  //Encontramos los todos en trash
  async findTrash(url: string): Promise<TodoResponseDto[]> {
    const list = await this.ensureList.execute(url);

    const todos = await this.todoRepo.findAllByList(list.id, {
      isEliminated: true,
    });

    return todos.map(todo => this.toDto(todo));
  }

  async changeStatus(url: string, id: number, status: TodoStatus): Promise<TodoResponseDto> {
    const list = await this.ensureList.execute(url);

    return this.toDto(
      await this.updateAndMerge(id, list.id, { status }),
    );
  }

  async changeName(url: string, id: number, name: string): Promise<TodoResponseDto> {
    const list = await this.ensureList.execute(url);

    return this.toDto(
      await this.updateAndMerge(id, list.id, { name }),
    );
  }

  async changeIsEliminated(url: string, id: number, isEliminated: boolean): Promise<TodoResponseDto> {
    const list = await this.ensureList.execute(url);

    return this.toDto(
      await this.updateAndMerge(id, list.id, { isEliminated }),
    );
  }


  async completeAll(url: string): Promise<SuccessResponseDto> {
    const list = await this.ensureList.execute(url);

    await this.todoRepo.updateMany(
      list.id,
      { status: TodoStatus.COMPLETED },
      { status: TodoStatus.CREATED, isEliminated: false },
    );

    return { success: true };
  }

  async clearCompleted(url: string): Promise<SuccessResponseDto> {
    const list = await this.ensureList.execute(url);

    await this.todoRepo.updateMany(
      list.id,
      { isEliminated: true },
      { status: TodoStatus.COMPLETED, isEliminated: false },
    );

    return { success: true };
  }

  async clearAll(url: string): Promise<SuccessResponseDto> {
    const list = await this.ensureList.execute(url);

    await this.todoRepo.updateMany(
      list.id,
      { isEliminated: true },
      { isEliminated: false },
    );

    return { success: true };
  }

  async clearTrash(url: string): Promise<SuccessResponseDto> {
    const list = await this.ensureList.execute(url);

    await this.todoRepo.deleteMany(list.id);

    return { success: true};
  }

  async restoreTrash(url: string): Promise<SuccessResponseDto> {
    const list = await this.ensureList.execute(url);

    await this.todoRepo.updateMany(
      list.id,
      { isEliminated: false },
      { isEliminated: true },
    );

    return { success: true };
  }
}