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
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../../database/enums/core.enums';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { CreateCourseContentDto } from './dto/create-course-content.dto';
import { UpdateEnrollmentFormStatusDto } from './dto/update-enrollment-form-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { AssignTaDto } from './dto/assign-ta.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import type { AuthUser } from '../../common/auth/auth-user.interface';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('students')
  listStudents() {
    return this.adminService.listStudents();
  }

  @Post('courses')
  createCourse(@Body() dto: CreateCourseDto, @CurrentUser() user: AuthUser) {
    return this.adminService.createCourse(dto, user);
  }

  @Put('courses/:id')
  updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.adminService.updateCourse(id, dto);
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id') id: string) {
    return this.adminService.deleteCourse(id);
  }

  @Post('batches')
  createBatch(@Body() dto: CreateBatchDto) {
    return this.adminService.createBatch(dto);
  }

  @Put('batches/:id')
  updateBatch(@Param('id') id: string, @Body() dto: UpdateBatchDto) {
    return this.adminService.updateBatch(id, dto);
  }

  @Get('batches/:id/students')
  batchStudents(@Param('id') id: string) {
    return this.adminService.batchStudents(id);
  }

  @Post('batches/:id/assign-ta')
  assignTa(@Param('id') id: string, @Body() dto: AssignTaDto) {
    return this.adminService.assignTa(id, dto);
  }

  @Post('courses/content')
  createCourseContent(@Body() dto: CreateCourseContentDto) {
    return this.adminService.createCourseContent(dto);
  }

  @Post('payments')
  recordPayment(@Body() dto: RecordPaymentDto, @CurrentUser() user: AuthUser) {
    return this.adminService.recordPayment(dto, user);
  }

  @Get('payments')
  listPayments() {
    return this.adminService.listPayments();
  }

  @Get('payments/pending')
  listPendingPayments() {
    return this.adminService.listPendingPayments();
  }

  @Post('payments/:id/reminder')
  sendPaymentReminder(@Param('id') id: string) {
    return this.adminService.sendPaymentReminder(id);
  }

  @Post('assignments')
  createAssignment(
    @Body() dto: CreateAssignmentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.adminService.createAssignment(dto, user);
  }

  @Post('submissions/:id/grade')
  gradeSubmission(
    @Param('id') id: string,
    @Body() dto: GradeSubmissionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.adminService.gradeSubmission(id, dto, user.sub);
  }

  @Get('batches/:id/attendance')
  batchAttendance(@Param('id') id: string) {
    return this.adminService.batchAttendance(id);
  }

  @Get('financials')
  financialDashboard() {
    return this.adminService.financialDashboard();
  }

  @Get('analytics/dashboard')
  analyticsDashboard() {
    return this.adminService.analyticsDashboard();
  }

  @Get('analytics/revenue')
  analyticsRevenue() {
    return this.adminService.analyticsRevenue();
  }

  @Get('analytics/students')
  analyticsStudents() {
    return this.adminService.analyticsStudents();
  }

  @Get('analytics/courses')
  analyticsCourses() {
    return this.adminService.analyticsCourses();
  }

  @Get('enrollment-forms')
  listEnrollmentForms() {
    return this.adminService.listEnrollmentForms();
  }

  @Get('users/:id')
  adminGetUserById(@Param('id') id: string) {
    return this.adminService.adminGetUserById(id);
  }

  @Put('users/:id/role')
  adminUpdateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.adminService.adminUpdateUserRole(id, dto, user);
  }

  @Delete('users/:id')
  adminDeleteUser(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.adminService.adminDeleteUser(id, user);
  }

  @Post('enrollments')
  createEnrollment(@Body() dto: CreateEnrollmentDto) {
    return this.adminService.createEnrollment(dto);
  }

  @Put('enrollments/:id/status')
  updateEnrollmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentStatusDto,
  ) {
    return this.adminService.updateEnrollmentStatus(id, dto);
  }

  @Put('enrollment-forms/:id/status')
  updateEnrollmentFormStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentFormStatusDto,
  ) {
    return this.adminService.updateEnrollmentFormStatus(id, dto);
  }

  @Post('certificates/generate')
  generateCertificate(@Body() dto: GenerateCertificateDto) {
    return this.adminService.generateCertificate(dto);
  }
}
