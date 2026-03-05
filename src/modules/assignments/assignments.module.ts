import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AssignmentEntity,
  AssignmentRequiredFileEntity,
  EnrollmentEntity,
} from '../../database/entities';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssignmentEntity,
      AssignmentRequiredFileEntity,
      EnrollmentEntity,
    ]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
})
export class AssignmentsModule {}
