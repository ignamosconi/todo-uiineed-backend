import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITodosService } from './todos.service.interface';
import type { ITodosRepository } from '../repositories/todos.repository.interface';
import { TodoResponseDto } from '../dto/todo-response.dto';
import { SuccessResponseDto } from '../dto/success-response.dto';
import { TodoStatus } from '../enums/todo-status.enum';
import { EnsureListHelper } from '../helpers/ensure-list.helper';

@Injectable()
export class TodosService implements ITodosService {
  constructor(
    @Inject('ITodosRepository') private readonly todoRepo: ITodosRepository,
    private readonly ensureList: EnsureListHelper,
  ) {}

  async create(url: string, name: string): Promise<TodoResponseDto> {
    const list = await this.ensureList.execute(url);

    const todo = await this.todoRepo.save(name, list);

    return {
      id: todo.id,
      name: todo.name,
      status: todo.status,
    };
  }

  //Encontramos los todos que no están en la trash todavía
  async findActiveByStatus(url: string, status?: TodoStatus): Promise<TodoResponseDto[]> {
    const list = await this.ensureList.execute(url);

    const filters: any = { isEliminated: false };

    if (status) {
      filters.status = status;
    }

    const todos = await this.todoRepo.findAllByList(list.id, filters);

    return todos.map(todo => ({
      id: todo.id,
      name: todo.name,
      status: todo.status,
    }));
  }

  //Encontramos los todos en trash
  async findTrash(url: string): Promise<TodoResponseDto[]> {
    const list = await this.ensureList.execute(url);

    const todos = await this.todoRepo.findAllByList(list.id, {
      isEliminated: true,
    });

    return todos.map(todo => ({
      id: todo.id,
      name: todo.name,
      status: todo.status,
    }));
  }

  async changeStatus(url: string, id: number, status: TodoStatus) {
    const list = await this.ensureList.execute(url);

    const todo = await this.todoRepo.findByIdAndList(id, list.id);

    if (!todo) {
      throw new NotFoundException('Todo no encontrado');
    }

    await this.todoRepo.updateStatus(id, list.id, status);

    return { success: true };
  }

  async changeName(url: string, id: number, name: string) {
    const list = await this.ensureList.execute(url);

    const todo = await this.todoRepo.findByIdAndList(id, list.id);

    if (!todo) {
      throw new NotFoundException('Todo no encontrado');
    }

    await this.todoRepo.updateName(id, list.id, name);

    return { success: true };
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

    return { success: true };
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