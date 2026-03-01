import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EnrollmentFormsService } from './enrollment-forms.service';
import { CreateEnrollmentFormDto } from './dto/create-enrollment-form.dto';

@ApiTags('enrollment-forms')
@Controller('enrollment-forms')
export class EnrollmentFormsController {
  constructor(
    private readonly enrollmentFormsService: EnrollmentFormsService,
  ) {}

  @Post()
  submit(@Body() dto: CreateEnrollmentFormDto) {
    return this.enrollmentFormsService.submit(dto);
  }
}
