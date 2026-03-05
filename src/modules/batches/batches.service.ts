import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchEntity } from '../../database/entities';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(BatchEntity)
    private readonly batchRepo: Repository<BatchEntity>,
  ) {}

  listPublicBatches() {
    return this.batchRepo.find({
      order: { startDate: 'DESC' },
    });
  }
}
