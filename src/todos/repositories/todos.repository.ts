import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../entities/todo.entity';
import { List } from '../../lists/entities/list.entity';
import { TodoStatus } from '../enums/todo-status.enum';
import { ReorderItemDto } from '../dto/reorder-item.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class TodosRepository {
  constructor(
    @InjectRepository(Todo)
    private readonly ormRepo: Repository<Todo>,
    private readonly dataSource: DataSource, //Para las transacciones de reorden.
  ) {}

  /*
    SAVE
  */
  async save(name: string, list: List): Promise<Todo> {
    const last = await this.ormRepo
      .createQueryBuilder('todo')
      .where('todo.listId = :listId', { listId: list.id })
      .orderBy('todo.position', 'DESC')
      .getOne();

    const position = last ? last.position + 1 : 0; //Lo hacemos de 1 en 1 porque position es float y podemos añadir decimales.

    return this.ormRepo.save({
      name,
      list,
      status: TodoStatus.CREATED,
      position,
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
    
    qb.orderBy('todo.position', 'ASC');
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
    REPOSICIONAMIENTO DE TODOS
  */

  async existsByPosition(listId: number, position: number): Promise<boolean> {
    const count = await this.ormRepo.count({
      where: {
        list: { id: listId },
        position,
      },
    });

    return count > 0;
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