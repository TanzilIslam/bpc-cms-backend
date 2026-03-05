import { IsEnum } from 'class-validator';
import { UserRole } from '../../../database/enums/core.enums';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
