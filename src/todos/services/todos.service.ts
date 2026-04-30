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

  private isUniqueConstraintError(error: any): boolean {
    return error?.code === '23505'; // Postgres unique violation
  }


  /*
    FUNCIONES PÚBLICAS
  */
  async create(url: string, name: string): Promise<TodoResponseDto> {
    const list = await this.ensureList.execute(url);
    return this.toDto(await this.todoRepo.save(name, list));
  }

  async reorder(url: string, item: ReorderItemDto): Promise<SuccessResponseDto> {
    const list = await this.ensureList.execute(url);

    const todo = await this.getTodoOrFail(item.id, list.id);

    const beforeId = item.beforeId;
    const afterId = item.afterId;

    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const before = beforeId
          ? await this.getTodoOrFail(beforeId, list.id)
          : null;

        const after = afterId
          ? await this.getTodoOrFail(afterId, list.id)
          : null;

        let newPosition: number;

        // Inicio
        if (!before && after) {
          newPosition = after.position - 1;
        }

        // Final
        else if (before && !after) {
          newPosition = before.position + 1;
        }

        // Entre dos
        else if (before && after) {
          if (before.position >= after.position) {
            throw new BadRequestException('Orden inválido');
          }

          newPosition = (before.position + after.position) / 2 + Math.random() * 0.00001;
        }

        else {
          throw new BadRequestException('Payload inválido');
        }

        await this.todoRepo.updateOne(todo.id, list.id, {
          position: newPosition,
        });

        return { success: true };

      } catch (error) {
        //SOLO retry en unique constraint
        if (!this.isUniqueConstraintError(error) || attempt === MAX_RETRIES - 1) {
          throw error;
        }

        //opcional: pequeño delay (evita choque simultáneo)
        await new Promise(res => setTimeout(res, 10));
      }
    }

    throw new Error('Unexpected reorder failure');
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