import { Controller, Post, Inject, Get, Param } from '@nestjs/common';
import type { IListsService } from '../services/lists.service.interface';
import { CreateListResponseDto } from '../dto/create-list-response.dto';
import { ListMetadataDto } from '../dto/list-metadata.dto';

@Controller('lists')
export class ListsController {
  constructor(
    @Inject('IListsService') private readonly listsService: IListsService
  ) {}

  @Post()
  async create(): Promise<CreateListResponseDto> {
    return this.listsService.generateNewList();
  }

  @Get('/:url')
  async getList(@Param('url') url: string): Promise<ListMetadataDto> {
    return this.listsService.getListMetadata(url);
  }
}