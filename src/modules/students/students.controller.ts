import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../../database/enums/core.enums';
import type { AuthUser } from '../../common/auth/auth-user.interface';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me')
  myProfile(@CurrentUser() user: AuthUser) {
    return this.studentsService.myProfile(user.sub);
  }

  @Get('me/enrollments')
  myEnrollments(@CurrentUser() user: AuthUser) {
    return this.studentsService.myEnrollments(user.sub);
  }

  @Get('me/assignments')
  myAssignments(@CurrentUser() user: AuthUser) {
    return this.studentsService.myAssignments(user.sub);
  }

  @Post('me/assignments/:id/submit')
  submitAssignment(
    @CurrentUser() user: AuthUser,
    @Param('id') assignmentId: string,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.studentsService.submitAssignment(user.sub, assignmentId, dto);
  }

  @Get('me/progress')
  myProgress(@CurrentUser() user: AuthUser) {
    return this.studentsService.myProgress(user.sub);
  }

  @Get('me/certificate')
  myCertificate(@CurrentUser() user: AuthUser) {
    return this.studentsService.myCertificates(user.sub);
  }
}
