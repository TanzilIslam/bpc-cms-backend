import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity, UserEntity } from '../../database/entities';
import { UserRole } from '../../database/enums/core.enums';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
  ) {}

  async myProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      profilePhoto: user.profilePhoto,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      laptopSpecs: user.laptopSpecs,
      internetSpeed: user.internetSpeed,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  async updateMyProfile(userId: string, dto: UpdateMyProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.fullName = dto.fullName ?? user.fullName;
    user.phone = dto.phone ?? user.phone;
    user.address = dto.address ?? user.address;
    user.laptopSpecs = dto.laptopSpecs ?? user.laptopSpecs;
    user.internetSpeed = dto.internetSpeed ?? user.internetSpeed;
    user.dateOfBirth = dto.dateOfBirth ?? user.dateOfBirth;

    await this.userRepo.save(user);
    return this.myProfile(userId);
  }

  async updateMyAvatar(userId: string, profilePhoto: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.profilePhoto = profilePhoto;
    await this.userRepo.save(user);

    return {
      id: user.id,
      profilePhoto: user.profilePhoto,
    };
  }

  myPayments(userId: string) {
    return this.paymentRepo.find({
      where: { studentId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async adminListUsers(actorRole: UserRole) {
    if (actorRole !== UserRole.ADMIN && actorRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const users = await this.userRepo.find({
      order: { createdAt: 'DESC' },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
