import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../entities/todo.entity';
import { List } from '../../lists/entities/list.entity';
import { ITodosRepository } from './todos.repository.interface';

@Injectable()
export class TodosRepository implements ITodosRepository {
  constructor(
    @InjectRepository(Todo)
    private readonly ormRepo: Repository<Todo>,
  ) {}

  async save(name: string, list: List): Promise<Todo> {
    const todo = this.ormRepo.create({ name, list, status: 'created' });
    return await this.ormRepo.save(todo);
  }

  async findStatusByUrl(url: string, status: string): Promise<Todo[]> {
    return await this.ormRepo
      .createQueryBuilder('todo')
      .innerJoin('todo.list', 'list')
      .where('list.url = :url', { url })
      .andWhere('todo.status = :status', { status })
      .getMany();
  }

  async updateStatus(id: number, status: string): Promise<void> {
    await this.ormRepo.update(id, { status });
  }

  async updateManyStatus(url: string, oldStatus: string | null, newStatus: string): Promise<void> {
    const whereCondition: any = { list: { url } };
    if (oldStatus) whereCondition.status = oldStatus;
    
    await this.ormRepo.update(whereCondition, { status: newStatus });
  }
}