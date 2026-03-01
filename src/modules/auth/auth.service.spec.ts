import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import {
  EmailVerificationTokenEntity,
  PasswordResetTokenEntity,
  RefreshTokenEntity,
  UserEntity,
} from '../../database/entities';
import { AuthService } from './auth.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '../../database/enums/core.enums';

describe('AuthService', () => {
  let service: AuthService;

  const usersRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const refreshRepo = { save: jest.fn(), find: jest.fn(), create: jest.fn() };
  const resetRepo = { save: jest.fn(), find: jest.fn(), create: jest.fn() };
  const verifyRepo = { save: jest.fn(), create: jest.fn() };
  const jwtService = { signAsync: jest.fn() };
  const notificationsService = { sendEmail: jest.fn() };
  const configService = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        JWT_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
        JWT_REFRESH_SECRET: 'abcdefghijklmnopqrstuvwxyz654321',
        JWT_EXPIRATION: '7d',
        JWT_REFRESH_EXPIRATION: '30d',
      };
      return map[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: usersRepo },
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useValue: refreshRepo,
        },
        {
          provide: getRepositoryToken(PasswordResetTokenEntity),
          useValue: resetRepo,
        },
        {
          provide: getRepositoryToken(EmailVerificationTokenEntity),
          useValue: verifyRepo,
        },
        { provide: JwtService, useValue: jwtService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('registers a student and returns tokens', async () => {
    usersRepo.findOne.mockResolvedValue(null);
    usersRepo.create.mockImplementation((x: unknown) => x);
    refreshRepo.create.mockImplementation((x: unknown) => x);
    verifyRepo.create.mockImplementation((x: unknown) => x);
    usersRepo.save.mockResolvedValue({
      id: 'u1',
      email: 'student@example.com',
      fullName: 'Student',
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      emailVerified: false,
    });
    jwtService.signAsync
      .mockResolvedValueOnce('access')
      .mockResolvedValueOnce('refresh');

    const result = await service.register({
      email: 'student@example.com',
      password: 'Password123',
      fullName: 'Student',
      phone: '+8801712345678',
    });

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
    expect(notificationsService.sendEmail).toHaveBeenCalled();
  });
});
