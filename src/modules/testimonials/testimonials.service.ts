import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestimonialEntity } from '../../database/entities';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(TestimonialEntity)
    private readonly testimonialRepo: Repository<TestimonialEntity>,
  ) {}

  listApproved() {
    return this.testimonialRepo.find({
      where: { isApproved: true },
      order: { createdAt: 'DESC' },
    });
  }
}
