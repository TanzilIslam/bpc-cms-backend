import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BatchEntity,
  BatchTaEntity,
  CourseContentEntity,
  CourseEntity,
  EnrollmentEntity,
  PaymentEntity,
  UserEntity,
} from '../../database/entities';
import { CertificatesService } from '../certificates/certificates.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;

  const userRepo = { find: jest.fn() };
  const courseRepo = { save: jest.fn(), create: jest.fn() };
  const courseContentRepo = { save: jest.fn(), create: jest.fn() };
  const batchRepo = { save: jest.fn(), create: jest.fn() };
  const batchTaRepo = { save: jest.fn(), create: jest.fn() };
  const paymentRepo = { find: jest.fn(), save: jest.fn(), create: jest.fn() };
  const enrollmentRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const certificatesService = { generateForEnrollment: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(CourseEntity), useValue: courseRepo },
        {
          provide: getRepositoryToken(CourseContentEntity),
          useValue: courseContentRepo,
        },
        { provide: getRepositoryToken(BatchEntity), useValue: batchRepo },
        { provide: getRepositoryToken(BatchTaEntity), useValue: batchTaRepo },
        { provide: getRepositoryToken(PaymentEntity), useValue: paymentRepo },
        {
          provide: getRepositoryToken(EnrollmentEntity),
          useValue: enrollmentRepo,
        },
        { provide: CertificatesService, useValue: certificatesService },
      ],
    }).compile();
    service = module.get<AdminService>(AdminService);
  });

  it('returns financial summary', async () => {
    paymentRepo.find.mockResolvedValue([
      { amount: '5000' },
      { amount: '3000' },
    ]);
    enrollmentRepo.find.mockResolvedValue([
      { totalFee: '10000', amountPaid: '5000' },
      { totalFee: '8000', amountPaid: '3000' },
    ]);

    const result = await service.financialDashboard();
    expect(result.totalRevenue).toBe(8000);
    expect(result.outstandingAmount).toBe(10000);
  });
});
