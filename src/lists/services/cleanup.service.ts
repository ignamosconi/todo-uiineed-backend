import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';
import type { IListsService } from './lists.service.interface';

@Injectable()
export class CleanupService implements OnModuleInit {
  constructor(
    @Inject('IListsService')
    private readonly listsService: IListsService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const cronTime = this.configService.getOrThrow<string>('CLEANUP_CRON');

    const job = new CronJob(cronTime, async () => {
      await this.listsService.cleanupLists();
    });

    this.schedulerRegistry.addCronJob('cleanup-job', job);
    job.start();
  }
}