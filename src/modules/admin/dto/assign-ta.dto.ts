import { IsArray, IsString } from 'class-validator';

export class AssignTaDto {
  @IsArray()
  @IsString({ each: true })
  taIds!: string[];
}
