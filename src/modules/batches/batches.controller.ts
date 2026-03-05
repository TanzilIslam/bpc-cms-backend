import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BatchesService } from './batches.service';

@ApiTags('batches')
@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get()
  listBatches() {
    return this.batchesService.listPublicBatches();
  }
}
