import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  events: CategoryEvent[];
}

interface CategoryEvent {
  name: string;
  operation: string;
  value: number;
}
