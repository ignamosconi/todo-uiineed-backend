import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { List } from '../lists/entities/list.entity';
import { TodosController } from './controllers/todos.controller';
import { TodosService } from './services/todos.service';
import { TodosRepository } from './repositories/todos.repository';
import { ListsModule } from '../lists/lists.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo, List]),
    ListsModule, // Necesario para acceder al ListsRepository si hiciera falta
  ],
  controllers: [TodosController],
  providers: [
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