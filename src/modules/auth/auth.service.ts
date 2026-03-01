import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import {
  EmailVerificationTokenEntity,
  PasswordResetTokenEntity,
  RefreshTokenEntity,
  UserEntity,
} from '../../database/entities';
import { UserRole, UserStatus } from '../../database/enums/core.enums';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../../common/auth/auth-user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>,
    @InjectRepository(PasswordResetTokenEntity)
    private readonly resetTokenRepo: Repository<PasswordResetTokenEntity>,
    @InjectRepository(EmailVerificationTokenEntity)
    private readonly verificationTokenRepo: Repository<EmailVerificationTokenEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async register(input: RegisterDto) {
    const existing = await this.usersRepo.findOne({
      where: { email: input.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = this.usersRepo.create({
      email: input.email.toLowerCase(),
      password: hashedPassword,
      fullName: input.fullName,
      phone: input.phone,
      address: input.address || null,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      emailVerified: false,
    });
    const saved = await this.usersRepo.save(user);
    await this.sendVerificationEmail(saved);
    return this.issueTokens(saved);
  }

  async login(input: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: input.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const validPassword = await bcrypt.compare(input.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);
    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    const rows = await this.refreshTokenRepo.find({
      where: { revokedAt: IsNull() },
    });

    for (const row of rows) {
      const matched = await bcrypt.compare(refreshToken, row.tokenHash);
      if (matched) {
        row.revokedAt = new Date();
        await this.refreshTokenRepo.save(row);
        return;
      }
    }
  }

  async refresh(refreshToken: string) {
    const rows = await this.refreshTokenRepo.find({
      where: { revokedAt: IsNull() },
      relations: { user: true },
    });

    for (const row of rows) {
      const matched = await bcrypt.compare(refreshToken, row.tokenHash);
      if (!matched) {
        continue;
      }
      if (row.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      row.revokedAt = new Date();
      await this.refreshTokenRepo.save(row);
      return this.issueTokens(row.user);
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepo.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return;
    }

    const rawToken = randomUUID() + randomUUID();
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    const token = this.resetTokenRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      usedAt: null,
    });
    await this.resetTokenRepo.save(token);

    await this.notificationsService.sendEmail(
      user.email,
      'Reset your password',
      `Use this token to reset your password: ${rawToken}`,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const rows = await this.resetTokenRepo.find({
      where: { usedAt: IsNull() },
      relations: { user: true },
    });

    for (const row of rows) {
      const matched = await bcrypt.compare(token, row.tokenHash);
      if (!matched) {
        continue;
      }
      if (row.expiresAt < new Date()) {
        throw new BadRequestException('Reset token expired');
      }
      row.usedAt = new Date();
      row.user.password = await bcrypt.hash(newPassword, 10);
      await this.usersRepo.save(row.user);
      await this.resetTokenRepo.save(row);
      return;
    }

    throw new NotFoundException('Invalid reset token');
  }

  private async issueTokens(user: UserEntity) {
    const payload: AuthUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.toSeconds(
        this.configService.get<string>('JWT_EXPIRATION', '7d'),
      ),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.toSeconds(
        this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d'),
      ),
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const refreshEntity = this.refreshTokenRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      revokedAt: null,
    });
    await this.refreshTokenRepo.save(refreshEntity);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  private async sendVerificationEmail(user: UserEntity): Promise<void> {
    const rawToken = randomUUID() + randomUUID();
    const tokenHash = await bcrypt.hash(rawToken, 10);
    await this.verificationTokenRepo.save(
      this.verificationTokenRepo.create({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        verifiedAt: null,
      }),
    );

    await this.notificationsService.sendEmail(
      user.email,
      'Verify your email',
      `Use this token to verify your account: ${rawToken}`,
    );
  }

  private toSeconds(duration: string): number {
    const match = duration.trim().match(/^(\d+)([smhd])$/i);
    if (!match) {
      return 60 * 60 * 24 * 7;
    }
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 's') return value;
    if (unit === 'm') return value * 60;
    if (unit === 'h') return value * 60 * 60;
    return value * 60 * 60 * 24;
  }
}
