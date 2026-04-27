import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../entities/todo.entity';
import { List } from '../../lists/entities/list.entity';
import { TodoStatus } from '../enums/todo-status.enum';

@Injectable()
export class TodosRepository {
  constructor(
    @InjectRepository(Todo)
    private readonly ormRepo: Repository<Todo>,
  ) {}

  /*
    SAVE
  */
  async save(name: string, list: List): Promise<Todo> {
    return this.ormRepo.save({
      name,
      list,
      status: TodoStatus.CREATED,
    });
  }

  /*
    FINDs
  */
  async findById(id: number): Promise<Todo | null> {
    return this.ormRepo
      .createQueryBuilder('todo')
      .where('todo.id = :id', { id })
      .getOne();
  }

  async findAllByList(
    listId: number,
    filters?: { status?: TodoStatus; isEliminated?: boolean },
  ): Promise<Todo[]> {
    const qb = this.ormRepo
      .createQueryBuilder('todo')
      .where('todo.listId = :listId', { listId });

    if (filters?.status !== undefined) {
      qb.andWhere('todo.status = :status', { status: filters.status });
    }

    if (filters?.isEliminated !== undefined) {
      qb.andWhere('todo.isEliminated = :isEliminated', {
        isEliminated: filters.isEliminated,
      });
    }

    return qb.getMany();
  }

  /*
    UPDATEs
  */
  async updateStatus(id: number, status: TodoStatus): Promise<void> {
    await this.ormRepo
      .createQueryBuilder()
      .update(Todo)
      .set({ status })
      .where('id = :id', { id })
      .execute();
  }

  async updateMany(
    listId: number,
    patch: Partial<Todo>,
    filters?: { status?: TodoStatus; isEliminated?: boolean },
  ): Promise<void> {
    const qb = this.ormRepo
      .createQueryBuilder()
      .update(Todo)
      .set(patch)
      .where('listId = :listId', { listId });

    if (filters?.status !== undefined) {
      qb.andWhere('status = :status', { status: filters.status });
    }

    if (filters?.isEliminated !== undefined) {
      qb.andWhere('isEliminated = :isEliminated', {
        isEliminated: filters.isEliminated,
      });
    }

    await qb.execute();
  }

  /*
    DELETE trash
  */
  async deleteMany(
    listId: number,
  ): Promise<void> {
    await this.ormRepo
      .createQueryBuilder()
      .delete()
      .from(Todo)
      .where('listId = :listId', { listId })
      .andWhere('isEliminated = :isEliminated', { isEliminated: true })
      .execute();
  }
}