import { Injectable, NotFoundException } from '@nestjs/common';
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

  //Nos aseguramos que el todo que quieren consultar sea de la lista en la que están trabajando.
  async findByIdAndList(id: number, listId: number): Promise<Todo | null> {
    return this.ormRepo
      .createQueryBuilder('todo')
      .where('todo.id = :id', { id })
      .andWhere('todo.listId = :listId', { listId })
      .getOne();
  }

  /*
    UPDATEs
  */
  async updateOne(id: number, listId: number, patch: Partial<Todo>): Promise<void> {
    const result = await this.ormRepo
      .createQueryBuilder()
      .update(Todo)
      .set(patch)
      .where('id = :id', { id })
      .andWhere('listId = :listId', { listId })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException('Todo no encontrado');
    }
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
  async deleteMany(listId: number): Promise<void> {
    await this.ormRepo
      .createQueryBuilder()
      .delete()
      .from(Todo)
      .where('listId = :listId', { listId })
      .andWhere('isEliminated = true')
      .execute();
  }
}