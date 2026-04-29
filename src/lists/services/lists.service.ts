import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IListsService } from './lists.service.interface';
import type { IListsRepository } from '../repositories/lists.repository.interface';
import { CreateListResponseDto } from '../dto/create-list-response.dto';
import { ListMetadataDto } from '../dto/list-metadata-response.dto';
import { UpdateListResponseDto } from '../dto/update-list-response.dto';

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
      title: list.title,
    };
  }


  async getListMetadata(url: string): Promise<ListMetadataDto> {
    const list = await this.repository.findByUrl(url);

    if (!list) throw new NotFoundException('La lista no existe');
    return {
      url: list.url,
      title: list.title,
      creation_date: list.creation_date,
    };
  }

  async updateList(url: string, title: string): Promise<UpdateListResponseDto> {
    const list = await this.repository.updateByUrl(url, title);

    if (!list) {
      throw new NotFoundException('La lista no existe');
    }

    return {
      url: list.url,
      creation_date: list.creation_date,
      title: list.title,
    };
  }
}