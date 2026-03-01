import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentFormEntity } from '../../database/entities';
import { EnrollmentFormStatus } from '../../database/enums/core.enums';
import { CreateEnrollmentFormDto } from './dto/create-enrollment-form.dto';

@Injectable()
export class EnrollmentFormsService {
  constructor(
    @InjectRepository(EnrollmentFormEntity)
    private readonly enrollmentFormRepo: Repository<EnrollmentFormEntity>,
  ) {}

  async submit(input: CreateEnrollmentFormDto) {
    const form = this.enrollmentFormRepo.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      interestedCourse: input.interestedCourse,
      hasLaptop: input.hasLaptop,
      laptopSpecs: input.laptopSpecs || null,
      hasInternet: input.hasInternet,
      whyJoin: input.whyJoin || null,
      status: EnrollmentFormStatus.PENDING,
      notes: null,
    });
    return this.enrollmentFormRepo.save(form);
  }
}
