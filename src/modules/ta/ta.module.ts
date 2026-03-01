import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AttendanceEntity,
  BatchTaEntity,
  EnrollmentEntity,
  SubmissionEntity,
} from '../../database/entities';
import { TaController } from './ta.controller';
import { TaService } from './ta.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BatchTaEntity,
      EnrollmentEntity,
      AttendanceEntity,
      SubmissionEntity,
    ]),
  ],
  controllers: [TaController],
  providers: [TaService],
})
export class TaModule {}
