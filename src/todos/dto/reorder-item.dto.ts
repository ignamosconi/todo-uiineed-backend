import { IsInt, IsOptional } from 'class-validator';

export class ReorderItemDto {
  @IsInt()
  id!: number;

  @IsOptional()
  @IsInt()
  beforeId?: number;

  @IsOptional()
  @IsInt()
  afterId?: number;
}