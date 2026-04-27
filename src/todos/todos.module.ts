import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { List } from '../lists/entities/list.entity';
import { TodosController } from './controllers/todos.controller';
import { TodosService } from './services/todos.service';
import { TodosRepository } from './repositories/todos.repository';
import { ListsModule } from '../lists/lists.module';
import { EnsureListHelper } from './helpers/ensure-list.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo, List]),
    ListsModule,
  ],
  controllers: [TodosController],
  providers: [
    EnsureListHelper,
    {
      provide: 'ITodosRepository',
      useClass: TodosRepository,
    },
    {
      provide: 'ITodosService',
      useClass: TodosService,
    },
    
  ],
})
export class TodosModule {}