import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../entities/todo.entity';
import { List } from '../../lists/entities/list.entity';
import { ITodosRepository } from './todos.repository.interface';
import { TodoStatus } from '../enums/todo-status.enum';


@Injectable()
export class TodosRepository implements ITodosRepository {
  constructor(
    @InjectRepository(Todo)
    private readonly ormRepo: Repository<Todo>,
    @InjectRepository(List)
    private readonly listRepo: Repository<List>,
  ) {}

  async save(name: string, list: List): Promise<Todo> {
    return this.ormRepo.save({
      name,
      list,
      status: TodoStatus.CREATED,
    });
  }

  async findStatusByUrl(url: string, status: TodoStatus): Promise<Todo[]> {
    return this.ormRepo.find({
      relations: ['list'],
      where: {
        status,
        list: {
          url,
        },
      },
    });
  }

  async updateStatus(id: number, status: TodoStatus): Promise<void> {
    await this.ormRepo.update(id, { status });
  }

  async findById(id: number): Promise<Todo | null> {
    return this.ormRepo.findOne({ where: { id } });
  }

  async findByIdAndListUrl(id: number, url: string): Promise<Todo | null> {
    return this.ormRepo.findOne({
      relations: ['list'],
      where: {
        id,
        list: {
          url,
        },
      },
    });
  }

  async updateManyStatus(
    url: string,
    oldStatus: TodoStatus | null,
    newStatus: TodoStatus,
  ): Promise<void> {
    const list = await this.listRepo.findOne({ where: { url } });

    if (!list) return;

    const where: any = {
      list: { id: list.id },
    };

    if (oldStatus !== null) {
      where.status = oldStatus;
    }

    await this.ormRepo.update(where, {
      status: newStatus,
    });
  }
}