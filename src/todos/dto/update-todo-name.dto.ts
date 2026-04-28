//Hago los updates por separado porque en el front son acciones distintivas, no está todo en un "mismo formulario", por lo que
//no va a haber un momento en el que se actualice el nombre, status y trash al mismo tiempo. 
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateTodoNameDto {
  @IsOptional()
  @IsString()
  @Length(1, 126)
  name!: string;
}