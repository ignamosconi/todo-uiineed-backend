import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from '../entities/list.entity';
import { IListsRepository } from './lists.repository.interface';
import { nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ListsRepository implements IListsRepository {
  constructor(
    @InjectRepository(List)
    private readonly ormRepo: Repository<List>,
    private readonly configService: ConfigService,
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
    const minutes = this.configService.get<number>('EMPTY_LIST_TTL_MINUTES');
    await this.ormRepo.query(`
      DELETE FROM lists
      WHERE creation_date < NOW() - INTERVAL '${minutes} minutes'
      AND NOT EXISTS (
        SELECT 1 FROM todos WHERE todos."listId" = lists.id
      )
    `);
  }

  //Si una lista lleva más de 2 semanas sin tener todos añadidos, se borra.
  async deleteInactiveLists(): Promise<void> {
    const days = this.configService.get<number>('INACTIVE_LIST_TTL_DAYS');
    await this.ormRepo.query(`
      DELETE FROM lists
      WHERE EXISTS (
        SELECT 1 FROM todos WHERE todos."listId" = lists.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM todos 
        WHERE todos."listId" = lists.id
        AND todos."updatedAt" > NOW() - INTERVAL '${days} days'
      )
    `);
  }
}