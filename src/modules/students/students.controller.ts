import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { CreateProjectDto } from './dto/create-project.dto';
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

  @Get('me/enrollments/:id/progress')
  myEnrollmentProgress(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.studentsService.myEnrollmentProgress(user.sub, id);
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

  @Get('me/payments')
  myPayments(@CurrentUser() user: AuthUser) {
    return this.studentsService.myPayments(user.sub);
  }

  @Get('me/attendance')
  myAttendance(@CurrentUser() user: AuthUser) {
    return this.studentsService.myAttendance(user.sub);
  }

  @Get('me/projects')
  myProjects(@CurrentUser() user: AuthUser) {
    return this.studentsService.myProjects(user.sub);
  }

  @Post('me/projects')
  createProject(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateProjectDto,
  ) {
    return this.studentsService.createProject(user.sub, dto);
  }

  @Put('me/projects/:id')
  updateProject(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.studentsService.updateProject(user.sub, id, dto);
  }

  @Delete('me/projects/:id')
  deleteProject(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.studentsService.deleteProject(user.sub, id);
  }
}
