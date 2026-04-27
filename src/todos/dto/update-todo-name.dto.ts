//Los hago por separado porque son dos acciones distintivas en el front, no está
//todo en un "mismo formulario". 
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateTodoNameDto {
  @IsOptional()
  @IsString()
  @Length(1, 126)
  name!: string;
}