import { IsString, Length } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @Length(1, 126)
  name!: string;
}