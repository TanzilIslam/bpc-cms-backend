import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TaService } from './ta.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../../database/enums/core.enums';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import type { AuthUser } from '../../common/auth/auth-user.interface';

@ApiTags('ta')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TA, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('ta')
export class TaController {
  constructor(private readonly taService: TaService) {}

  @Get('batches')
  listMyBatches(@CurrentUser() user: AuthUser) {
    return this.taService.listMyBatches(user.sub);
  }

  @Get('batches/:id/students')
  batchStudents(@Param('id') batchId: string) {
    return this.taService.batchStudents(batchId);
  }

  @Get('submissions')
  listSubmissionsForGrading(@CurrentUser() user: AuthUser) {
    return this.taService.listSubmissionsForGrading(user.sub);
  }

  @Post('attendance')
  markAttendance(
    @CurrentUser() user: AuthUser,
    @Body() dto: MarkAttendanceDto,
  ) {
    return this.taService.markAttendance(user.sub, dto);
  }

  @Post('assignments/:id/grade')
  gradeAssignment(
    @CurrentUser() user: AuthUser,
    @Param('id') assignmentId: string,
    @Body() dto: GradeAssignmentDto,
  ) {
    return this.taService.gradeAssignment(user.sub, assignmentId, dto);
  }
}
