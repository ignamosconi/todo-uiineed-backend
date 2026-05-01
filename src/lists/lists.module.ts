import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { ListsController } from './controllers/lists.controller';
import { ListsService } from './services/lists.service';
import { ListsRepository } from './repositories/lists.repository';
import { CleanupService } from './services/cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([List])],
  
  controllers: [ListsController],

  providers: [
    { 
      provide: 'IListsRepository', 
      useClass: ListsRepository 
    },
    { provide: 'IListsService', 
      useClass: ListsService 
    },
    CleanupService,
  ],

  exports: [
    TypeOrmModule, 
    'IListsRepository',
    'IListsService',
  ],
})
export class ListsModule {}