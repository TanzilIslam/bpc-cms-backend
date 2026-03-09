import { UserRole } from '../../database/enums/core.enums';

export interface AuthUser {
  sub: string;
  email: string;
  role: UserRole;
}
