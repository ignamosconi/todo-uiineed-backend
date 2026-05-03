//Hago los updates por separado porque en el front son acciones distintivas, no está todo en un "mismo formulario", por lo que
//no va a haber un momento en el que se actualice el nombre, status y trash al mismo tiempo. 
import { IsEnum } from 'class-validator';
import { TodoStatus } from '../enums/todo-status.enum';

export class UpdateTodoStatusDto {
  @IsEnum(TodoStatus)
  status!: TodoStatus;
}