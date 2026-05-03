import { IsString, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateListDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title!: string;
}