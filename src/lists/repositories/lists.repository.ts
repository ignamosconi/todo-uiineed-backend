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
    while (true) {
      try {
        const newList = this.ormRepo.create({ url: nanoid(12) });
        return await this.ormRepo.save(newList);
      } catch (error: any) {
        // PostgreSQL unique violation
        if (error.code === '23505') {
          continue; // generar otra url
        }
        throw error;
      }
    }
  }

  async findByUrl(url: string): Promise<List | null> {
    return await this.ormRepo.findOne({
      where: { url },
      select: ['id', 'url', 'creation_date'], //Devolvemos sólo estas columnas.
    });
  }
}