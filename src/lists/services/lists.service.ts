import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IListsService } from './lists.service.interface';
import type { IListsRepository } from '../repositories/lists.repository.interface';
import { CreateListResponseDto } from '../dto/create-list-response.dto';
import { ListMetadataDto } from '../dto/list-metadata.dto';

@Injectable()
export class ListsService implements IListsService {
  constructor(
    @Inject('IListsRepository')
    private readonly repository: IListsRepository,
  ) {}

  async generateNewList(): Promise<CreateListResponseDto> {
    const list = await this.repository.create();

    return {
      url: list.url,
      creation_date: list.creation_date,
    };
  }

  async validateList(url: string): Promise<void> {
    const list = await this.repository.findByUrl(url);
    if (!list) throw new NotFoundException('La lista no existe');
  }

  async getListMetadata(url: string): Promise<ListMetadataDto> {
    const list = await this.repository.findByUrl(url);

    if (!list) throw new NotFoundException('La lista no existe');

    return {
      url: list.url,
      creation_date: list.creation_date,
    };
  }
}