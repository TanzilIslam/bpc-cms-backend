import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchEntity } from '../../database/entities';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';

@Module({
  imports: [TypeOrmModule.forFeature([BatchEntity])],
  controllers: [BatchesController],
  providers: [BatchesService],
})
export class BatchesModule {}
