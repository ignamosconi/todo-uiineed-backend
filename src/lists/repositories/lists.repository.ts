import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from '../entities/list.entity';
import { IListsRepository } from './lists.repository.interface';
import { nanoid } from 'nanoid';

@Injectable()
export class ListsRepository implements IListsRepository {
  constructor(
    @InjectRepository(List)
    private readonly ormRepo: Repository<List>,
  ) {}

  async create(): Promise<List> {
    for (let i = 0; i < 5; i++) {
      try {
        const newList = this.ormRepo.create({ url: nanoid(12)}); 
        return await this.ormRepo.save(newList);
      } catch (error: any) {
        if (error.code === '23505') {
          continue;
        }
        throw error;
      }
    }

    throw new Error('No se pudo generar una URL única');
  }

  async findByUrl(url: string): Promise<List | null> {
    return await this.ormRepo.findOne({
      where: { url },
      select: ['id', 'url', 'title', 'creation_date'], //Devolvemos sólo estas columnas.
    });
  }

  async updateByUrl(url: string, title: string): Promise<List | null> {
    await this.ormRepo.update({ url }, { title });
    return this.ormRepo.findOneBy({ url });
  }

  //Si una lista se creó y pasaron 10 minutos sin añadirse todos, se borra.
  async deleteEmptyLists(): Promise<void> {
    await this.ormRepo.query(`
      DELETE FROM lists
      WHERE creation_date < NOW() - INTERVAL '10 minutes'
      AND NOT EXISTS (
        SELECT 1 FROM todos WHERE todos."listId" = lists.id
      )
    `);
  }

  //Si una lista lleva más de 2 semanas sin tener todos añadidos, se borra.
  async deleteInactiveLists(): Promise<void> {
    await this.ormRepo.query(`
      DELETE FROM lists
      WHERE EXISTS (
        SELECT 1 FROM todos WHERE todos."listId" = lists.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM todos 
        WHERE todos."listId" = lists.id
        AND todos."updatedAt" > NOW() - INTERVAL '7 days'
      )
    `);
  }
}