import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IListsRepository } from '../../lists/repositories/lists.repository.interface';
import { List } from '../../lists/entities/list.entity';

@Injectable()
export class EnsureListHelper {
  constructor(
    @Inject('IListsRepository')
    private readonly listRepo: IListsRepository,
  ) {}

  async execute(url: string): Promise<List> {
    const list = await this.listRepo.findByUrl(url);

    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    return list;
  }
}