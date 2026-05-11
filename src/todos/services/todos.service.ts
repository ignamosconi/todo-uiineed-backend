import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ITodosService } from './todos.service.interface';
import type { ITodosRepository } from '../repositories/todos.repository.interface';
import { TodoResponseDto } from '../dto/todo-response.dto';
import { SuccessResponseDto } from '../dto/success-response.dto';
import { TodoStatus } from '../enums/todo-status.enum';
import { EnsureListHelper } from '../helpers/ensure-list.helper';
import { Todo } from '../entities/todo.entity';
import { ReorderItemDto } from '../dto/reorder-item.dto';

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
      position: todo.position,
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
    //Verificamos si la lista existe
    const list = await this.ensureList.execute(url);

    //LÍMITE MÁXIMO DE TODOS → Se establece en .env → Sino se toman 100 por defecto.
    const maxTodos = Number(process.env.MAX_TODOS_PER_LIST) || 100;

    const count = await this.todoRepo.countByList(list.id);

    if (count >= maxTodos) {
      throw new BadRequestException(
        `You've reached your ${maxTodos} todos limit; try deleting some completed ones :)`
      );
    }

    //Creamos el todo
    return this.toDto(await this.todoRepo.save(name, list));
  }

  async reorder(url: string, item: ReorderItemDto) {
    const list = await this.ensureList.execute(url);

    const todos = await this.todoRepo.findAllByList(list.id);

    const moving = todos.find(t => t.id === item.id);
    if (!moving) throw new NotFoundException();

    const before = todos.find(t => t.id === item.beforeId);
    const after = todos.find(t => t.id === item.afterId);

    let newPosition: number;

    if (before && after) {
      newPosition = (before.position + after.position) / 2;
    } else if (before) {
      newPosition = before.position + 1024;
    } else if (after) {
      newPosition = after.position / 2;
    } else {
      throw new BadRequestException();
    }

    try {
      await this.todoRepo.updateOne(moving.id, list.id, {
        position: newPosition,
      });
    } catch {
      // 👇 única reacción válida
      await this.reindexPositions(list.id);

      // recalcular después del reindex
      return this.reorder(url, item);
    }

    return { success: true };
  }
  //Auxiliar de order
  async reindexPositions(listId: number) {
    const todos = await this.todoRepo.findAllByList(listId);

    //Ordenamos
    todos.sort((a, b) => a.position - b.position);

    //Movemos todo a posiciones temporales para evitar colisiones
    for (let i = 0; i < todos.length; i++) {
      await this.todoRepo.updateOne(todos[i].id, listId, {
        position: -(i + 1), // -1, -2, -3...
      });
    }

    //Movemos todo a las posiciones finales, con gaps de 1024
    let pos = 1024;
    for (const todo of todos) {
      await this.todoRepo.updateOne(todo.id, listId, {
        position: pos,
      });
      pos += 1024;
    }
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

  async restoreTrash(url: string) {
    const list = await this.ensureList.execute(url);

    const todos = await this.todoRepo.findAllByList(list.id);

    const active = todos
      .filter(t => !t.isEliminated)
      .sort((a, b) => a.position - b.position);

    const trashed = todos
      .filter(t => t.isEliminated)
      .sort((a, b) => a.position - b.position);

    //Movemos a posiciones temporales
    const all = [...active, ...trashed];

    for (let i = 0; i < all.length; i++) {
      await this.todoRepo.updateOne(all[i].id, list.id, {
        position: -(i + 1),
      });
    }

    //Reconstruimos y posicionamos en nuevo orden final
    let pos = 1024;

    for (const t of active) {
      await this.todoRepo.updateOne(t.id, list.id, {
        position: pos,
      });
      pos += 1024;
    }

    for (const t of trashed) {
      await this.todoRepo.updateOne(t.id, list.id, {
        isEliminated: false,
        position: pos,
      });
      pos += 1024;
    }

    return { success: true };
  }
}