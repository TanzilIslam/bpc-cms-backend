import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentFormEntity } from '../../database/entities';
import { EnrollmentFormsController } from './enrollment-forms.controller';
import { EnrollmentFormsService } from './enrollment-forms.service';

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentFormEntity])],
  controllers: [EnrollmentFormsController],
  providers: [EnrollmentFormsService],
})
export class EnrollmentFormsModule {}
