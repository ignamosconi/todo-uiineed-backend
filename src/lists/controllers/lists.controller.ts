import { Controller, Post, Inject, Get, Param, Body, Patch } from '@nestjs/common';
import type { IListsService } from '../services/lists.service.interface';
import { CreateListResponseDto } from '../dto/create-list-response.dto';
import { ListMetadataDto } from '../dto/list-metadata-response.dto';
import { UpdateListDto } from '../dto/udpate-list.dto';
import { UpdateListResponseDto } from '../dto/update-list-response.dto';
import { Throttle } from '@nestjs/throttler';


@Controller('lists')
export class ListsController {
  constructor(
    @Inject('IListsService') private readonly listsService: IListsService
  ) {}

  @Post()
  @Throttle({ default: { limit: 15, ttl: 60000 } }) 
  async create(): Promise<CreateListResponseDto> {
    return this.listsService.generateNewList();
  }

  @Get('/:url')
  async getList(@Param('url') url: string): Promise<ListMetadataDto> {
    return this.listsService.getListMetadata(url);
  }

  @Patch('/:url')
  async updateTitle(
    @Param('url') url: string,
    @Body() dto: UpdateListDto
  ): Promise<UpdateListResponseDto> {
    return this.listsService.updateList(url, dto.title);
  }
}