import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITodosService } from './todos.service.interface';
import type { ITodosRepository } from '../repositories/todos.repository.interface';
import type{ IListsRepository } from '../../lists/repositories/lists.repository.interface';

@Injectable()
export class TodosService implements ITodosService {
  constructor(
    @Inject('ITodosRepository') private readonly todoRepo: ITodosRepository,
    @Inject('IListsRepository') private readonly listRepo: IListsRepository,
  ) {}

  async create(url: string, name: string) {
    const list = await this.listRepo.findByUrl(url);
    if (!list) throw new NotFoundException('Lista no encontrada');
    return await this.todoRepo.save(name, list);
  }

  async findByStatus(url: string, status: string) {
    return await this.todoRepo.findStatusByUrl(url, status);
  }

  async changeStatus(id: number, status: string) {
    await this.todoRepo.updateStatus(id, status);
    return { success: true };
  }

  async completeAll(url: string) {
    await this.todoRepo.updateManyStatus(url, 'created', 'completed');
    return { success: true };
  }

  async clearAll(url: string) {
    await this.todoRepo.updateManyStatus(url, null, 'eliminated');
    return { success: true };
  }
}