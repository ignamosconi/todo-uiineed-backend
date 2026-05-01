import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { IListsService } from './lists.service.interface';

@Injectable()
export class CleanupService {
  constructor(
  @Inject('IListsService')
  private readonly listsService: IListsService
) {}

  // cada 5 minutos = '*/5 * * * *' - Cada 10 segundos: '*/10 * * * * *'
  @Cron('*/5 * * * *')
  async handleCleanup() {
    await this.listsService.cleanupLists();
  }
}