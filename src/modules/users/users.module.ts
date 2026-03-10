import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity, UserEntity } from '../../database/entities';
import {
  AdminUsersController,
  PaymentsController,
  UsersController,
} from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, PaymentEntity])],
  controllers: [UsersController, AdminUsersController, PaymentsController],
  providers: [UsersService],
})
export class UsersModule {}
