import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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

  @Post('batches')
  createBatch(@Body() dto: CreateBatchDto) {
    return this.adminService.createBatch(dto);
  }

  @Post('courses/content')
  createCourseContent(@Body() dto: CreateCourseContentDto) {
    return this.adminService.createCourseContent(dto);
  }

  @Post('payments')
  recordPayment(@Body() dto: RecordPaymentDto, @CurrentUser() user: AuthUser) {
    return this.adminService.recordPayment(dto, user);
  }

  @Get('financials')
  financialDashboard() {
    return this.adminService.financialDashboard();
  }

  @Post('certificates/generate')
  generateCertificate(@Body() dto: GenerateCertificateDto) {
    return this.adminService.generateCertificate(dto);
  }
}
