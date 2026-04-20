import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITodosService } from './todos.service.interface';
import type { ITodosRepository } from '../repositories/todos.repository.interface';
import type{ IListsRepository } from '../../lists/repositories/lists.repository.interface';
import { TodoResponseDto } from '../dto/todo-response.dto';
import { SuccessResponseDto } from '../dto/success-response.dto';
import { TodoStatus } from '../enums/todo-status.enum';

@Injectable()
export class TodosService implements ITodosService {
  constructor(
    @Inject('ITodosRepository') private readonly todoRepo: ITodosRepository,
    @Inject('IListsRepository') private readonly listRepo: IListsRepository,
  ) {}

  async create(url: string, name: string): Promise<TodoResponseDto> {
    const list = await this.listRepo.findByUrl(url);
    if (!list) throw new NotFoundException('Lista no encontrada');

    const todo = await this.todoRepo.save(name, list);

    return {
      id: todo.id,
      name: todo.name,
      status: todo.status,
    };
  }

  async findByStatus(url: string, status: TodoStatus): Promise<TodoResponseDto[]> {
    const list = await this.listRepo.findByUrl(url);

    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    const todos = await this.todoRepo.findStatusByUrl(url, status);

    return todos.map(todo => ({
      id: todo.id,
      name: todo.name,
      status: todo.status,
    }));
  }

  async changeStatus(url: string, id: number, status: TodoStatus): Promise<SuccessResponseDto> {
    const todo = await this.todoRepo.findByIdAndListUrl(id, url);

    if (!todo) {
      throw new NotFoundException('Todo no encontrado en esta lista');
    }

    await this.todoRepo.updateStatus(id, status);

    const response: SuccessResponseDto = {success: true};
    return response;
  }

  async completeAll(url: string): Promise<SuccessResponseDto> {
    await this.todoRepo.updateManyStatus(url, TodoStatus.CREATED, TodoStatus.COMPLETED);
    return { success: true };
  }

  async clearAll(url: string): Promise<SuccessResponseDto> {
    await this.todoRepo.updateManyStatus(url, null, TodoStatus.ELIMINATED);
    return { success: true };
  }
}